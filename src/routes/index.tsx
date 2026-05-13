import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/turisrio/Nav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  ArrowRight, Sparkles, MapPin, Compass, Sun, Clock, Ticket, Lightbulb,
  Utensils, Music, Building2, BadgeCheck, ExternalLink, MessageCircle, LifeBuoy, ChevronDown,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import heroImg from "@/assets/rio-hero.jpg";
import beachImg from "@/assets/rio-beach.jpg";
import christImg from "@/assets/rio-christ.jpg";
import sugarloafImg from "@/assets/rio-sugarloaf.jpg";
import gastroImg from "@/assets/rio-gastronomia.jpg";
import hotelImg from "@/assets/rio-hotel.jpg";
import lapaImg from "@/assets/rio-lapa.jpg";
import selaronImg from "@/assets/rio-selaron.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "TurisRio — Viva o Rio do seu jeito" },
      { name: "description", content: "Pontos turísticos, gastronomia, hospedagem e roteiros personalizados por IA no Rio de Janeiro." },
    ],
  }),
});

type Tag = "Praia" | "Mirante" | "Aventura" | "Cultura" | "Família" | "Romântico" | "Grátis";

const pontos: {
  name: string; img: string; desc: string; horario: string; preco: string; dica: string; tags: Tag[];
}[] = [
  {
    name: "Cristo Redentor", img: christImg,
    desc: "Vista 360º do Rio do alto do Corcovado, em meio à Mata Atlântica.",
    horario: "08h–19h, todos os dias", preco: "A partir de R$ 109",
    dica: "Vá cedo (8h) para evitar filas e nuvens.", tags: ["Mirante", "Família", "Romântico"],
  },
  {
    name: "Praia de Copacabana", img: beachImg,
    desc: "Calçadão icônico, quiosques, vôlei e o pôr do sol carioca por excelência.",
    horario: "Acesso 24h", preco: "Grátis",
    dica: "Posto 6 ao entardecer — caipirinha e roda de samba.", tags: ["Praia", "Família", "Grátis"],
  },
  {
    name: "Pão de Açúcar", img: sugarloafImg,
    desc: "Bondinho em duas etapas até 396m sobre a Baía de Guanabara.",
    horario: "08h–19h50", preco: "A partir de R$ 150",
    dica: "Suba antes do pôr do sol e desça com a cidade iluminada.", tags: ["Aventura", "Mirante", "Romântico"],
  },
  {
    name: "Escadaria Selarón", img: selaronImg,
    desc: "215 degraus cobertos por azulejos do mundo inteiro, em Santa Teresa.",
    horario: "Acesso 24h (visite de dia)", preco: "Grátis",
    dica: "Combine com almoço no bairro da Lapa logo abaixo.", tags: ["Cultura", "Grátis"],
  },
  {
    name: "Arcos da Lapa", img: lapaImg,
    desc: "Aqueduto colonial e epicentro da vida noturna e do samba carioca.",
    horario: "Vida noturna: 20h–04h", preco: "Grátis (bares à parte)",
    dica: "Sextas têm Pedra do Sal: samba de roda imperdível.", tags: ["Cultura", "Grátis"],
  },
  {
    name: "Jardim Botânico", img: heroImg,
    desc: "140 hectares de palmeiras imperiais, orquidário e fauna nativa.",
    horario: "08h–17h", preco: "R$ 35",
    dica: "Leve repelente — e visite o Bosque dos Macaquinhos.", tags: ["Família", "Cultura"],
  },
];

const TAGS: Tag[] = ["Praia", "Mirante", "Aventura", "Cultura", "Família", "Romântico", "Grátis"];

const experiencias = [
  { icon: Sparkles, title: "Roteiros sob medida", desc: "Itinerários gerados por IA, ajustados ao seu ritmo, gosto e tempo." },
  { icon: MapPin, title: "Bairros autênticos", desc: "Santa Teresa, Lapa, Ipanema, Urca — o Rio dos cariocas." },
  { icon: Compass, title: "Dicas locais", desc: "Onde comer, beber e curtir longe das armadilhas turísticas." },
  { icon: Sun, title: "Segurança & transporte", desc: "Como circular tranquilo entre praias, mirantes e a vida noturna." },
];

const cultura = [
  { icon: Utensils, title: "Feijoada de sábado", desc: "Tradição imperdível em botequins da Urca, Santa Teresa e Leme." },
  { icon: Music, title: "Roda de samba", desc: "Pedra do Sal (seg/sex), Lapa (qua a sáb), Trapiche Gamboa." },
  { icon: Sparkles, title: "Carnaval de rua", desc: "Mais de 500 blocos em fevereiro/março — gratuito e democrático." },
];

const pratos = [
  { nome: "Feijoada", desc: "Sábado, ao meio-dia, com farofa e laranja." },
  { nome: "Açaí na tigela", desc: "Pós-praia em Ipanema com banana e granola." },
  { nome: "Pastel de feira", desc: "Sábados na feira do Cobal do Humaitá." },
  { nome: "Caipirinha", desc: "Cachaça artesanal, limão tahiti, no quiosque." },
];

// Sponsored — patrocinadores
const hospedagens = [
  {
    name: "Belmond Copacabana Palace", tier: "Patrocinado · Luxo",
    desc: "Ícone art déco em frente a Copacabana, piscina histórica e spa premiado.",
    preco: "A partir de R$ 2.890/noite", url: "https://www.belmond.com/hotels/south-america/brazil/rio-de-janeiro/belmond-copacabana-palace/",
    img: hotelImg,
  },
  {
    name: "Hotel Fasano Ipanema", tier: "Patrocinado · Boutique",
    desc: "Design assinado por Philippe Starck, rooftop com vista para o Arpoador.",
    preco: "A partir de R$ 1.950/noite", url: "https://www.fasano.com.br/hospedagem/rio-de-janeiro",
    img: sugarloafImg,
  },
  {
    name: "Selina Lapa Rio", tier: "Patrocinado · Hostel design",
    desc: "Coworking, eventos e quartos compartilhados no coração da Lapa.",
    preco: "A partir de R$ 120/noite", url: "https://www.selina.com/brazil/lapa-rio/",
    img: lapaImg,
  },
];

const faq = [
  { q: "Qual a melhor época para visitar o Rio?", a: "Entre abril e outubro o clima é mais ameno e seco. Dezembro a fevereiro tem alta temporada e Carnaval." },
  { q: "É seguro andar pela cidade?", a: "Sim, com bom senso. Use aplicativos de transporte à noite, evite ostentar objetos e prefira praias e bairros movimentados." },
  { q: "Como funciona o transporte público?", a: "Metrô atende Centro, Zona Sul e Barra. Use o cartão Riocard ou pagamento por aproximação." },
  { q: "Preciso falar português?", a: "Em hotéis e atrações principais há atendimento em inglês e espanhol, mas algumas palavras em português ajudam muito." },
  { q: "O TurisRio cobra alguma taxa?", a: "Não. O uso do assistente e dos roteiros é gratuito — alguns hotéis e experiências são patrocinados e estão sinalizados." },
];

const supportSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  type: z.enum(["bug", "question", "feedback"]),
  subject: z.string().trim().min(3, "Assunto muito curto").max(150),
  message: z.string().trim().min(10, "Conte um pouco mais").max(2000),
});

const roteiroSchema = z.object({
  dias: z.string().min(1).max(3),
  estilo: z.string().min(1).max(60),
  interesses: z.string().trim().max(300).optional(),
});

function Index() {
  const { user } = useAuth();
  const ctaTo = user ? "/chat" : "/auth";
  const [activeTags, setActiveTags] = useState<Tag[]>([]);

  const filtered = useMemo(() => {
    if (activeTags.length === 0) return pontos;
    return pontos.filter((p) => activeTags.every((t) => p.tags.includes(t)));
  }, [activeTags]);

  const toggleTag = (t: Tag) =>
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <img src={heroImg} alt="Vista aérea do Rio de Janeiro com o Pão de Açúcar e Copacabana ao pôr do sol"
          width={1792} height={1024}
          className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-sunset)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-24 min-h-[100svh] flex flex-col justify-center">
          <span className="glass-dark inline-flex items-center gap-2 self-start px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em]">
            <Sparkles className="size-3" /> Assistente digital · Rio de Janeiro
          </span>
          <h1 className="editorial text-5xl sm:text-7xl md:text-8xl mt-6 max-w-4xl text-white drop-shadow-2xl">
            Viva o Rio<br />
            <span className="text-gradient-gold italic">do seu jeito.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90">
            Praias douradas, mirantes lendários e roteiros sob medida — desenhados por uma IA que conhece a Cidade Maravilhosa como um carioca.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to={ctaTo}
              className="group inline-flex items-center gap-2 gradient-gold text-primary px-6 py-3.5 rounded-full font-semibold shadow-glow hover:scale-[1.02] transition">
              Conversar com a IA <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
            </Link>
            <a href="#pontos" className="glass inline-flex items-center gap-2 text-white px-6 py-3.5 rounded-full font-medium border border-white/20">
              Explorar pontos turísticos
            </a>
          </div>
          <a href="#pontos" aria-label="Rolar para conteúdo"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 animate-bounce">
            <ChevronDown className="size-6" />
          </a>
        </div>
      </section>

      {/* PONTOS TURÍSTICOS com tags */}
      <section id="pontos" className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Pontos turísticos</p>
            <h2 className="editorial text-4xl sm:text-5xl mt-3 max-w-2xl">Cartões-postais, redescobertos.</h2>
          </div>
          <Link to={ctaTo} className="text-sm font-medium underline-offset-4 hover:underline">Pedir um roteiro →</Link>
        </div>

        {/* Tag filter */}
        <div role="group" aria-label="Filtrar pontos turísticos por interesse" className="flex flex-wrap gap-2 mb-10">
          <button onClick={() => setActiveTags([])}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${activeTags.length === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"}`}>
            Todos
          </button>
          {TAGS.map((t) => {
            const on = activeTags.includes(t);
            return (
              <button key={t} onClick={() => toggleTag(t)} aria-pressed={on}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"}`}>
                {t}
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <article key={p.name} className="group bg-card rounded-3xl overflow-hidden shadow-soft flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img src={p.img} alt={p.name} loading="lazy" width={1280} height={896}
                  className="size-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {p.tags.slice(0, 2).map((t) => (
                    <span key={t} className="glass-dark text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="editorial text-2xl">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex gap-2"><Clock className="size-4 mt-0.5 text-primary shrink-0" /><span>{p.horario}</span></li>
                  <li className="flex gap-2"><Ticket className="size-4 mt-0.5 text-primary shrink-0" /><span>{p.preco}</span></li>
                  <li className="flex gap-2"><Lightbulb className="size-4 mt-0.5 text-accent shrink-0" /><span className="text-muted-foreground">{p.dica}</span></li>
                </ul>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">Nenhum ponto com todas essas tags. Remova alguma para ver mais opções.</p>
          )}
        </div>
      </section>

      {/* ROTEIRO PERSONALIZADO (form) */}
      <RoteiroForm ctaTo={ctaTo} />

      {/* CULTURA & GASTRONOMIA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-[2rem] overflow-hidden h-[420px] shadow-soft">
            <img src={gastroImg} alt="Feijoada e caipirinha em um botequim do Rio" loading="lazy" width={1280} height={896}
              className="absolute inset-0 size-full object-cover" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Cultura & gastronomia</p>
            <h2 className="editorial text-4xl sm:text-5xl mt-3">O sabor e o som do Rio.</h2>
            <p className="mt-4 text-muted-foreground max-w-lg">Da feijoada de sábado ao samba na Lapa, a cultura carioca se vive na rua, no botequim e no calçadão.</p>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {cultura.map((c) => (
                <div key={c.title} className="bg-card rounded-2xl p-4 shadow-soft">
                  <c.icon className="size-5 text-primary" />
                  <h3 className="font-semibold mt-2 text-sm">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                </div>
              ))}
            </div>

            <h3 className="editorial text-xl mt-10">Pratos típicos</h3>
            <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {pratos.map((p) => (
                <li key={p.nome} className="border-b border-border/60 py-2">
                  <span className="font-medium">{p.nome}</span>
                  <span className="text-muted-foreground"> — {p.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* HOSPEDAGEM PATROCINADA */}
      <section className="bg-secondary/40 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <BadgeCheck className="size-4 text-accent" /> Hospedagem · Parceiros patrocinados
              </p>
              <h2 className="editorial text-4xl sm:text-5xl mt-3 max-w-2xl">Onde dormir no Rio.</h2>
            </div>
            <span className="text-xs text-muted-foreground max-w-xs">
              Estabelecimentos selecionados que apoiam o TurisRio. Reservas direto no parceiro.
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {hospedagens.map((h) => (
              <a key={h.name} href={h.url} target="_blank" rel="noopener noreferrer sponsored"
                className="group relative bg-card rounded-3xl overflow-hidden shadow-soft border border-accent/20 hover:border-accent/60 transition flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img src={h.img} alt={h.name} loading="lazy" width={1280} height={896}
                    className="size-full object-cover group-hover:scale-105 transition duration-700" />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 gradient-gold text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <BadgeCheck className="size-3" /> {h.tier}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg">{h.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 flex-1">{h.desc}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">{h.preco}</span>
                    <span className="inline-flex items-center gap-1 text-accent-foreground/80 group-hover:text-primary">
                      Reservar <ExternalLink className="size-3.5" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Quer divulgar seu hotel, pousada ou restaurante? <a href="#suporte" className="underline">Fale com a equipe</a>.
          </p>
        </div>
      </section>

      {/* EXPERIÊNCIAS */}
      <section className="max-w-6xl mx-auto px-6 py-24">
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
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Perguntas frequentes</p>
        <h2 className="editorial text-4xl sm:text-5xl mt-3">Tire suas dúvidas.</h2>
        <Accordion type="single" collapsible className="mt-10">
          {faq.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-8 text-sm text-muted-foreground">
          Não encontrou? <Link to={ctaTo} className="text-primary underline inline-flex items-center gap-1">
            <MessageCircle className="size-3.5" /> Pergunte à IA
          </Link> ou <a href="#suporte" className="underline">abra um chamado</a>.
        </p>
      </section>

      {/* SUPORTE */}
      <SuporteForm />

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 gradient-hero text-primary-foreground shadow-glow">
          <div className="absolute -top-20 -right-20 size-80 rounded-full opacity-30 gradient-gold blur-3xl" />
          <div className="relative">
            <h2 className="editorial text-4xl sm:text-5xl max-w-2xl">Pronto para descobrir o seu Rio?</h2>
            <p className="mt-4 max-w-xl opacity-90">Crie sua conta e converse com o assistente de IA — roteiros, dicas e favoritos guardados para sua próxima viagem.</p>
            <Link to={ctaTo} className="inline-flex items-center gap-2 mt-8 bg-white text-primary px-6 py-3.5 rounded-full font-semibold hover:scale-[1.02] transition">
              Começar agora <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        TurisRio · Guia de viagens com IA · Rio de Janeiro, Brasil
      </footer>
    </div>
  );
}

/* ---------------- ROTEIRO FORM ---------------- */
function RoteiroForm({ ctaTo }: { ctaTo: "/chat" | "/auth" }) {
  const [dias, setDias] = useState("3");
  const [estilo, setEstilo] = useState("Equilibrado");
  const [interesses, setInteresses] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = roteiroSchema.safeParse({ dias, estilo, interesses });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    const prompt = `Monte um roteiro de ${dias} dia(s) no Rio de Janeiro, estilo ${estilo}.${
      interesses ? ` Interesses: ${interesses}.` : ""
    } Inclua horários, preços médios e dicas locais.`;
    sessionStorage.setItem("turisrio:prompt", prompt);
    window.location.href = ctaTo;
  };

  return (
    <section id="roteiro" className="bg-secondary/40 py-24">
      <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Experiência personalizada</p>
          <h2 className="editorial text-4xl sm:text-5xl mt-3">Crie seu roteiro em 30 segundos.</h2>
          <p className="mt-4 text-muted-foreground max-w-md">Conte como você viaja — a IA monta um itinerário com pontos turísticos, restaurantes e dicas, ajustado ao seu perfil.</p>
        </div>
        <form onSubmit={submit} className="bg-card rounded-3xl p-8 shadow-soft space-y-5">
          <div>
            <label htmlFor="dias" className="text-sm font-medium">Quantos dias?</label>
            <select id="dias" value={dias} onChange={(e) => setDias(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="1">1 dia</option><option value="2">2 dias</option>
              <option value="3">3 dias</option><option value="5">5 dias</option>
              <option value="7">Uma semana</option>
            </select>
          </div>
          <div>
            <label htmlFor="estilo" className="text-sm font-medium">Qual seu estilo?</label>
            <select id="estilo" value={estilo} onChange={(e) => setEstilo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Equilibrado</option><option>Praia & relax</option>
              <option>Aventura & natureza</option><option>Cultura & história</option>
              <option>Gastronomia & vida noturna</option><option>Família com crianças</option>
              <option>Romântico</option>
            </select>
          </div>
          <div>
            <label htmlFor="interesses" className="text-sm font-medium">Algo específico? <span className="text-muted-foreground">(opcional)</span></label>
            <textarea id="interesses" value={interesses} onChange={(e) => setInteresses(e.target.value)}
              rows={3} maxLength={300} placeholder="Ex.: amo trilhas, adoro samba, quero conhecer o Maracanã…"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <button type="submit"
            className="w-full inline-flex items-center justify-center gap-2 gradient-hero text-primary-foreground px-6 py-3.5 rounded-full font-semibold hover:opacity-95 transition">
            Gerar meu roteiro <Sparkles className="size-4" />
          </button>
        </form>
      </div>
    </section>
  );
}

/* ---------------- SUPORTE FORM ---------------- */
function SuporteForm() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"bug" | "question" | "feedback">("question");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = supportSchema.safeParse({ name, email, type, subject, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os campos");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("support_tickets").insert({
      ...parsed.data, user_id: user?.id ?? null,
    });
    setLoading(false);
    if (error) {
      toast.error("Não conseguimos enviar agora. Tente novamente em instantes.");
      return;
    }
    toast.success("Recebemos sua mensagem! Responderemos por email em breve.");
    setName(""); setEmail(""); setSubject(""); setMessage(""); setType("question");
  };

  return (
    <section id="suporte" className="bg-secondary/40 py-24">
      <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <LifeBuoy className="size-4" /> Suporte & contato
          </p>
          <h2 className="editorial text-4xl sm:text-5xl mt-3">Encontrou um bug? Tem uma dúvida?</h2>
          <p className="mt-4 text-muted-foreground max-w-md">Mande pra gente. Lemos e respondemos cada mensagem — bugs, sugestões, parcerias e dúvidas de viagem.</p>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex gap-3"><Building2 className="size-5 text-primary" /> Parcerias de hospedagem e restaurantes</li>
            <li className="flex gap-3"><MessageCircle className="size-5 text-primary" /> Dúvidas que não foram cobertas no FAQ</li>
            <li className="flex gap-3"><LifeBuoy className="size-5 text-primary" /> Bugs ou problemas no app</li>
          </ul>
        </div>

        <form onSubmit={submit} className="bg-card rounded-3xl p-8 shadow-soft space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="s-name" className="text-sm font-medium">Nome</label>
              <input id="s-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label htmlFor="s-email" className="text-sm font-medium">Email</label>
              <input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label htmlFor="s-type" className="text-sm font-medium">Tipo</label>
            <select id="s-type" value={type} onChange={(e) => setType(e.target.value as "bug" | "question" | "feedback")}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="question">Dúvida</option>
              <option value="bug">Reportar bug</option>
              <option value="feedback">Sugestão / parceria</option>
            </select>
          </div>
          <div>
            <label htmlFor="s-subject" className="text-sm font-medium">Assunto</label>
            <input id="s-subject" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={150}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label htmlFor="s-msg" className="text-sm font-medium">Mensagem</label>
            <textarea id="s-msg" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} maxLength={2000}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-full font-semibold hover:opacity-95 transition disabled:opacity-50">
            {loading ? "Enviando…" : "Enviar mensagem"}
          </button>
        </form>
      </div>
    </section>
  );
}