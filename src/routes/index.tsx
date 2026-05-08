import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/turisrio/Nav";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Sparkles, MapPin, Compass, Sun } from "lucide-react";
import heroImg from "@/assets/rio-hero.jpg";
import beachImg from "@/assets/rio-beach.jpg";
import christImg from "@/assets/rio-christ.jpg";
import sugarloafImg from "@/assets/rio-sugarloaf.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const destinos = [
  { name: "Cristo Redentor", category: "Mirante", img: christImg, desc: "Vista 360º do Rio entre nuvens, no topo do Corcovado." },
  { name: "Praia de Copacabana", category: "Praia", img: beachImg, desc: "O calçadão mais famoso do mundo e areias douradas sem fim." },
  { name: "Pão de Açúcar", category: "Aventura", img: sugarloafImg, desc: "Bondinho ao pôr do sol sobre a Baía de Guanabara." },
];

const experiencias = [
  { icon: Sparkles, title: "Roteiros sob medida", desc: "Itinerários gerados por IA, ajustados ao seu ritmo, gosto e tempo." },
  { icon: MapPin, title: "Bairros autênticos", desc: "Santa Teresa, Lapa, Ipanema, Urca — o Rio dos cariocas." },
  { icon: Compass, title: "Dicas locais", desc: "Onde comer, beber e curtir longe das armadilhas turísticas." },
  { icon: Sun, title: "Segurança & transporte", desc: "Como circular tranquilo entre praias, mirantes e a vida noturna." },
];

function Index() {
  const { user } = useAuth();
  const ctaTo = user ? "/chat" : "/auth";
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <img src={heroImg} alt="Vista aérea do Rio de Janeiro ao pôr do sol" width={1792} height={1024}
          className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-sunset)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-24 min-h-[100svh] flex flex-col justify-center">
          <span className="glass-dark inline-flex items-center gap-2 self-start px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em]">
            <Sparkles className="size-3" /> Concierge digital · Rio de Janeiro
          </span>
          <h1 className="editorial text-5xl sm:text-7xl md:text-8xl mt-6 max-w-4xl text-white drop-shadow-2xl">
            O Rio,<br />
            <span className="text-gradient-gold italic">curado para você.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90">
            Descubra praias, mirantes, restaurantes e roteiros pensados sob medida — com a ajuda de uma assistente de IA dedicada à Cidade Maravilhosa.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to={ctaTo}
              className="group inline-flex items-center gap-2 gradient-gold text-primary px-6 py-3.5 rounded-full font-semibold shadow-glow hover:scale-[1.02] transition">
              Conversar com o Concierge <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
            </Link>
            <a href="#destinos" className="glass inline-flex items-center gap-2 text-white px-6 py-3.5 rounded-full font-medium border border-white/20">
              Ver destaques
            </a>
          </div>
        </div>
      </section>

      {/* DESTINOS */}
      <section id="destinos" className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Destinos em destaque</p>
            <h2 className="editorial text-4xl sm:text-5xl mt-3 max-w-2xl">Cartões-postais, redescobertos.</h2>
          </div>
          <Link to={ctaTo} className="text-sm font-medium underline-offset-4 hover:underline">Pedir um roteiro →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {destinos.map((d, i) => (
            <article key={d.name}
              className={`group relative overflow-hidden rounded-3xl shadow-soft ${i === 0 ? "md:row-span-2 md:h-[640px]" : "h-[300px]"}`}>
              <img src={d.img} alt={d.name} loading="lazy" width={1024} height={1024}
                className="absolute inset-0 size-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0" style={{ background: "var(--gradient-sunset)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="text-xs uppercase tracking-[0.2em] opacity-80">{d.category}</span>
                <h3 className="editorial text-2xl mt-1">{d.name}</h3>
                <p className="text-sm opacity-90 mt-1 line-clamp-2">{d.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* EXPERIÊNCIAS */}
      <section className="bg-secondary/40 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Experiências</p>
          <h2 className="editorial text-4xl sm:text-5xl mt-3 max-w-2xl">Uma viagem desenhada com inteligência.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {experiencias.map((e) => (
              <div key={e.title} className="bg-card rounded-3xl p-6 shadow-soft">
                <div className="size-11 rounded-2xl gradient-hero grid place-items-center text-primary-foreground">
                  <e.icon className="size-5" />
                </div>
                <h3 className="font-semibold mt-4 text-lg">{e.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 gradient-hero text-primary-foreground shadow-glow">
          <div className="absolute -top-20 -right-20 size-80 rounded-full opacity-30 gradient-gold blur-3xl" />
          <div className="relative">
            <h2 className="editorial text-4xl sm:text-5xl max-w-2xl">Pronto para descobrir o seu Rio?</h2>
            <p className="mt-4 max-w-xl opacity-90">Crie sua conta e converse com o Concierge — roteiros, dicas e favoritos guardados para sua próxima viagem.</p>
            <Link to={ctaTo} className="inline-flex items-center gap-2 mt-8 bg-white text-primary px-6 py-3.5 rounded-full font-semibold hover:scale-[1.02] transition">
              Começar agora <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        TurisRio · Concierge de viagens · Rio de Janeiro, Brasil
      </footer>
    </div>
  );
}
