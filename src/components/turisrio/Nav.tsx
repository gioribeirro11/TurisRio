import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Mountain, MessageCircle, Heart, User, LogOut } from "lucide-react";

export function Nav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(96%,1100px)]">
      <nav className="glass rounded-full px-3 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground pl-2">
          <span className="size-8 rounded-full gradient-hero grid place-items-center text-primary-foreground">
            <Mountain className="size-4" />
          </span>
          <span className="editorial text-lg">TurisRio</span>
        </Link>
        <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="px-3 py-2 rounded-full hover:text-foreground" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground bg-secondary" }}>Início</Link>
          {user && <>
            <Link to="/chat" className="px-3 py-2 rounded-full hover:text-foreground" activeProps={{ className: "text-foreground bg-secondary" }}>Assistente</Link>
            <Link to="/favoritos" className="px-3 py-2 rounded-full hover:text-foreground" activeProps={{ className: "text-foreground bg-secondary" }}>Favoritos</Link>
            <Link to="/perfil" className="px-3 py-2 rounded-full hover:text-foreground" activeProps={{ className: "text-foreground bg-secondary" }}>Perfil</Link>
          </>}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/chat" className="md:hidden p-2 rounded-full hover:bg-secondary"><MessageCircle className="size-4" /></Link>
              <Link to="/favoritos" className="md:hidden p-2 rounded-full hover:bg-secondary"><Heart className="size-4" /></Link>
              <button onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground" aria-label="Sair">
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <Link to="/auth" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}