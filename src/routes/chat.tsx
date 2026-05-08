import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Nav } from "@/components/turisrio/Nav";
import { Send, Plus, MessageCircle, Heart, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

type Msg = { id?: string; role: "user" | "assistant"; content: string };
type Conv = { id: string; title: string; updated_at: string };

const SUGGESTIONS = [
  "Monte um roteiro de 3 dias no Rio com praia, mirante e gastronomia.",
  "Quais são as melhores praias para famílias com crianças?",
  "Onde comer comida carioca autêntica em Santa Teresa?",
  "Dicas de segurança para circular entre Copacabana e o Centro.",
];

function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.navigate({ to: "/auth" });
  }, [user, authLoading, router]);

  useEffect(() => { if (user) loadConvs(); }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function loadConvs() {
    const { data } = await supabase.from("conversations").select("id,title,updated_at").order("updated_at", { ascending: false });
    setConvs(data || []);
  }

  async function openConv(id: string) {
    setActiveId(id);
    const { data } = await supabase.from("messages").select("id,role,content").eq("conversation_id", id).order("created_at");
    setMessages((data || []).map(m => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })));
  }

  function newConv() {
    setActiveId(null);
    setMessages([]);
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming || !user) return;
    if (content.length > 2000) { toast.error("Mensagem muito longa (máx. 2000 caracteres)."); return; }

    setInput("");
    let convId = activeId;

    // Create conversation if needed
    if (!convId) {
      const title = content.slice(0, 60);
      const { data, error } = await supabase.from("conversations").insert({ user_id: user.id, title }).select("id,title,updated_at").single();
      if (error) { toast.error("Não foi possível criar a conversa."); return; }
      convId = data.id;
      setActiveId(convId);
      setConvs(c => [data, ...c]);
    }

    const userMsg: Msg = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setStreaming(true);

    // Persist user message
    await supabase.from("messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content });

    let assistantText = "";
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Muitas solicitações. Aguarde um instante.");
        else if (resp.status === 402) toast.error("Créditos de IA esgotados.");
        else toast.error("Falha ao conversar com o Concierge.");
        setMessages(newMessages);
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { done = true; break; }
          try {
            const j = JSON.parse(payload);
            const delta = j.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }

      if (assistantText) {
        await supabase.from("messages").insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: assistantText });
        await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
        loadConvs();
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro de rede. Tente novamente.");
      setMessages(newMessages);
    } finally {
      setStreaming(false);
    }
  }

  async function saveAsFavorite(text: string) {
    if (!user) return;
    const name = text.split("\n")[0].replace(/[#*_>`-]/g, "").slice(0, 80) || "Recomendação salva";
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id, name, description: text.slice(0, 500), category: "Recomendação do Concierge",
    });
    if (error) toast.error("Não foi possível salvar."); else toast.success("Salvo nos favoritos!");
  }

  if (authLoading || !user) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-24 max-w-7xl mx-auto px-4 lg:px-6 grid lg:grid-cols-[280px_1fr] gap-6 pb-6">
        {/* Sidebar */}
        <aside className="hidden lg:block bg-card rounded-3xl shadow-soft p-4 h-[calc(100svh-7rem)] sticky top-24">
          <button onClick={newConv}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl gradient-hero text-primary-foreground font-medium shadow-glow">
            <Plus className="size-4" /> Nova conversa
          </button>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-6 mb-2 px-2">Histórico</p>
          <div className="overflow-y-auto h-[calc(100%-7rem)] space-y-1 pr-1">
            {convs.length === 0 && <p className="text-sm text-muted-foreground px-2 py-4">Sem conversas ainda.</p>}
            {convs.map(c => (
              <button key={c.id} onClick={() => openConv(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition ${activeId === c.id ? "bg-secondary font-medium" : ""}`}>
                <MessageCircle className="size-3 inline mr-2 opacity-60" />
                <span className="line-clamp-1">{c.title}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <main className="bg-card rounded-3xl shadow-soft flex flex-col h-[calc(100svh-7rem)] overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center pt-12">
                <div className="size-16 mx-auto rounded-full gradient-hero grid place-items-center text-primary-foreground shadow-glow">
                  <Sparkles className="size-7" />
                </div>
                <h1 className="editorial text-4xl mt-6">Olá! Sou seu Concierge do Rio.</h1>
                <p className="text-muted-foreground mt-3">
                  Posso montar roteiros, sugerir restaurantes, dicas de segurança e experiências locais. Por onde começamos?
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-8 text-left">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => send(s)}
                      className="p-4 rounded-2xl bg-secondary/60 hover:bg-secondary text-sm transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`group max-w-[85%] ${m.role === "user" ? "" : "w-full"}`}>
                      {m.role === "assistant" && (
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2 flex items-center gap-2">
                          <Sparkles className="size-3" /> Concierge
                        </p>
                      )}
                      <div className={`px-5 py-4 rounded-3xl whitespace-pre-wrap leading-relaxed ${
                        m.role === "user"
                          ? "gradient-hero text-primary-foreground rounded-tr-md"
                          : "bg-secondary/60 rounded-tl-md"
                      }`}>
                        {m.content || (streaming && i === messages.length - 1 ? "..." : "")}
                      </div>
                      {m.role === "assistant" && m.content && !streaming && (
                        <button onClick={() => saveAsFavorite(m.content)}
                          className="mt-2 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
                          <Heart className="size-3" /> Salvar nos favoritos
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t border-border/60 px-4 sm:px-8 py-4 bg-background/40">
            <div className="max-w-3xl mx-auto flex items-end gap-3 glass rounded-3xl p-2 pl-4">
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Pergunte algo sobre o Rio..." rows={1} maxLength={2000}
                className="flex-1 bg-transparent resize-none outline-none py-2 text-sm max-h-40" />
              <button type="submit" disabled={streaming || !input.trim()}
                className="size-10 grid place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition">
                {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Concierge de IA. Pode cometer erros — confirme informações importantes.
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}