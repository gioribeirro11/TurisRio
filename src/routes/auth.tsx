import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Mountain } from "lucide-react";
import heroImg from "@/assets/rio-hero.jpg";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
  displayName: z.string().trim().min(1).max(60).optional(),
});

function AuthPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) router.navigate({ to: "/chat" }); }, [user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, displayName: mode === "signup" ? displayName : undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Bem-vindo ao TurisRio.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(m.includes("Invalid login") ? "E-mail ou senha incorretos" : m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:block">
        <img src={heroImg} alt="Rio de Janeiro" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-sunset)" }} />
        <div className="relative z-10 p-12 h-full flex flex-col justify-end text-white">
          <Link to="/" className="flex items-center gap-2 font-semibold mb-auto">
            <span className="size-9 rounded-full glass grid place-items-center"><Mountain className="size-4" /></span>
            <span className="editorial text-xl">TurisRio</span>
          </Link>
          <h2 className="editorial text-5xl max-w-md drop-shadow-lg">Descubra a Cidade Maravilhosa com a ajuda da IA.</h2>
          <p className="opacity-90 mt-4 max-w-md">Roteiros sob medida, favoritos salvos e um assistente de IA dedicado ao Rio.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-semibold mb-8">
            <span className="size-9 rounded-full gradient-hero grid place-items-center text-primary-foreground"><Mountain className="size-4" /></span>
            <span className="editorial text-xl">TurisRio</span>
          </Link>
          <h1 className="editorial text-4xl">{mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}</h1>
          <p className="text-muted-foreground mt-2">
            {mode === "login" ? "Entre para continuar sua jornada." : "Comece a planejar sua viagem ao Rio."}
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-sm font-medium">Nome</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  required maxLength={60} placeholder="Como podemos te chamar?"
                  className="w-full mt-1.5 px-4 py-3 rounded-2xl bg-secondary/60 outline-none focus:ring-2 ring-ring" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255}
                className="w-full mt-1.5 px-4 py-3 rounded-2xl bg-secondary/60 outline-none focus:ring-2 ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} maxLength={72}
                className="w-full mt-1.5 px-4 py-3 rounded-2xl bg-secondary/60 outline-none focus:ring-2 ring-ring" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-semibold shadow-glow hover:opacity-95 disabled:opacity-60 transition">
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
          <p className="text-sm text-center mt-6 text-muted-foreground">
            {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-foreground font-medium underline-offset-4 hover:underline">
              {mode === "login" ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}