import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Nav } from "@/components/turisrio/Nav";
import { toast } from "sonner";
import { Inbox, Bug, MessageSquare, HelpCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/feedback")({
  component: AdminFeedback,
});

type Ticket = {
  id: string;
  name: string;
  email: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

function AdminFeedback() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.navigate({ to: "/auth" }); return; }

    (async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      const admin = !!roles && roles.length > 0;
      setIsAdmin(admin);
      if (admin) {
        const { data, error } = await supabase
          .from("support_tickets")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) toast.error("Erro ao carregar tickets");
        else setTickets(data as Ticket[]);
      }
      setLoading(false);
    })();
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main id="main-content" className="max-w-xl mx-auto px-6 pt-32 text-center">
          <h1 className="editorial text-3xl">Acesso restrito</h1>
          <p className="mt-4 text-muted-foreground">
            Esta área é exclusiva para a equipe TurisRio. Se você é parte do time, peça a um administrador para conceder a função "admin" ao seu usuário.
          </p>
          <p className="mt-2 text-xs text-muted-foreground break-all">Seu ID: {user?.id}</p>
          <Link to="/" className="mt-6 inline-block underline">Voltar ao início</Link>
        </main>
      </div>
    );
  }

  const icon = (t: string) =>
    t === "bug" ? <Bug className="size-4 text-destructive" />
    : t === "feedback" ? <MessageSquare className="size-4 text-accent-foreground" />
    : <HelpCircle className="size-4 text-primary" />;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main id="main-content" className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Inbox className="size-4" /> Painel da equipe
          </p>
          <h1 className="editorial text-4xl mt-2">Feedback dos usuários</h1>
          <p className="mt-2 text-muted-foreground">{tickets.length} mensagem(ns) recebida(s).</p>
        </header>

        {tickets.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">Nenhuma mensagem ainda.</p>
        ) : (
          <ul className="space-y-4">
            {tickets.map((t) => (
              <li key={t.id} className="bg-card rounded-2xl p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {icon(t.type)}
                    <div>
                      <h2 className="font-semibold">{t.subject}</h2>
                      <p className="text-xs text-muted-foreground">
                        {t.name} · <a href={`mailto:${t.email}`} className="underline">{t.email}</a> · {new Date(t.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary">{t.status}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{t.message}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}