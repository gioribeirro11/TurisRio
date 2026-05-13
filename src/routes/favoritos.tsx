import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Nav } from "@/components/turisrio/Nav";
import { Heart, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/favoritos")({
  component: FavoritosPage,
});

type Fav = { id: string; name: string; description: string | null; category: string | null; created_at: string };

function FavoritosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favs, setFavs] = useState<Fav[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) router.navigate({ to: "/auth" }); }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    supabase.from("favorites").select("id,name,description,category,created_at").order("created_at", { ascending: false })
      .then(({ data }) => { setFavs(data || []); setLoading(false); });
  }, [user]);

  async function remove(id: string) {
    const { error } = await supabase.from("favorites").delete().eq("id", id);
    if (error) toast.error("Erro ao remover");
    else { setFavs(f => f.filter(x => x.id !== id)); toast.success("Removido"); }
  }

  if (authLoading || !user) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-32 max-w-5xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Sua coleção</p>
        <h1 className="editorial text-5xl mt-3">Favoritos</h1>
        <p className="text-muted-foreground mt-3 max-w-xl">Lugares e recomendações que você guardou para sua próxima viagem ao Rio.</p>

        <div className="mt-12">
          {loading ? (
            <Loader2 className="animate-spin text-muted-foreground" />
          ) : favs.length === 0 ? (
            <div className="bg-card rounded-3xl p-12 text-center shadow-soft">
              <Heart className="size-10 mx-auto text-muted-foreground" />
              <h2 className="editorial text-2xl mt-4">Nada salvo ainda</h2>
              <p className="text-muted-foreground mt-2">Converse com o assistente de IA e salve as recomendações que mais gostar.</p>
              <Link to="/chat" className="inline-block mt-6 px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium">Abrir assistente de IA</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {favs.map(f => (
                <article key={f.id} className="bg-card rounded-3xl p-6 shadow-soft group relative">
                  {f.category && <span className="text-[11px] uppercase tracking-[0.18em] text-accent-foreground bg-accent/40 px-2 py-1 rounded-full">{f.category}</span>}
                  <h3 className="editorial text-xl mt-3">{f.name}</h3>
                  {f.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-5 whitespace-pre-wrap">{f.description}</p>}
                  <button onClick={() => remove(f.id)}
                    className="absolute top-4 right-4 size-9 rounded-full bg-secondary opacity-0 group-hover:opacity-100 transition grid place-items-center hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="size-4" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}