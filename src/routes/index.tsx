import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/turisrio/Nav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  ArrowRight, MapPin, Clock, Ticket, Lightbulb, Utensils, Music, Building2,
  BadgeCheck, ExternalLink, LifeBuoy, ChevronDown, Calendar, Route as RouteIcon,
  Sun, Sparkles, BookOpen,
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
      { title: "TurisRio — Guia de Turismo do Rio de Janeiro" },
      { name: "description", content: "Guia completo do Rio de Janeiro: pontos turísticos, roteiros, eventos, restaurantes e hospedagem com links diretos para reserva." },
      { property: "og:title", content: "TurisRio — Guia de Turismo do Rio de Janeiro" },
      { property: "og:description", content: "Guia completo do Rio: pontos turísticos, roteiros, eventos, restaurantes e hospedagem." },
    ],
  }),
});

type Tag = "Praia" | "Mirante" | "Aventura" | "Cultura" | "Família" | "Romântico" | "Grátis";

const pontos: {
  name: string; img: string; desc: string; horario: string; preco: string; dica: string; tags: Tag[];
}[] = [
  { name: "Cristo Redentor", img: christImg,
    desc: "Vista 360º do Rio do alto do Corcovado, em meio à Mata Atlântica.",
    horario: "08h–19h, todos os dias", preco: "A partir de R$ 109",
    dica: "Vá cedo (8h) para evitar filas e nuvens.", tags: ["Mirante", "Família", "Romântico"] },
  { name: "Praia de Copacabana", img: beachImg,
    desc: "Calçadão icônico, quiosques, vôlei e o pôr do sol carioca por excelência.",
    horario: "Acesso 24h", preco: "Grátis",
    dica: "Posto 6 ao entardecer — caipirinha e roda de samba.", tags: ["Praia", "Família", "Grátis"] },
  { name: "Pão de Açúcar", img: sugarloafImg,
    desc: "Bondinho em duas etapas até 396m sobre a Baía de Guanabara.",
    horario: "08h–19h50", preco: "A partir de R$ 150",
    dica: "Suba antes do pôr do sol e desça com a cidade iluminada.", tags: ["Aventura", "Mirante", "Romântico"] },
  { name: "Escadaria Selarón", img: selaronImg,
    desc: "215 degraus cobertos por azulejos do mundo inteiro, em Santa Teresa.",
    horario: "Acesso 24h (visite de dia)", preco: "Grátis",
    dica: "Combine com almoço no bairro da Lapa logo abaixo.", tags: ["Cultura", "Grátis"] },
  { name: "Arcos da Lapa", img: lapaImg,
    desc: "Aqueduto colonial e epicentro da vida noturna e do samba carioca.",
    horario: "Vida noturna: 20h–04h", preco: "Grátis (bares à parte)",
    dica: "Sextas têm Pedra do Sal: samba de roda imperdível.", tags: ["Cultura", "Grátis"] },
  { name: "Jardim Botânico", img: heroImg,
    desc: "140 hectares de palmeiras imperiais, orquidário e fauna nativa.",
    horario: "08h–17h", preco: "R$ 35",
    dica: "Leve repelente — visite o Bosque dos Macaquinhos.", tags: ["Família", "Cultura"] },
];

const TAGS: Tag[] = ["Praia", "Mirante", "Aventura", "Cultura", "Família", "Romântico", "Grátis"];

const roteiros = [
  {
    titulo: "Rio em 3 dias — o essencial",
    duracao: "3 dias", publico: "Primeira viagem",
    paradas: ["Cristo Redentor", "Pão de Açúcar", "Copacabana", "Lapa & Selarón", "Ipanema ao pôr do sol"],
    img: christImg,
  },
  {
    titulo: "Praia & relax em 2 dias",
    duracao: "2 dias", publico: "Casal / descanso",
    paradas: ["Praia do Leme", "Pedra do Arpoador", "Ipanema (Posto 9)", "Pôr do sol no Mirante do Leblon"],
    img: beachImg,
  },
  {
    titulo: "Aventura & natureza em 4 dias",
    duracao: "4 dias", publico: "Trilheiros",
    paradas: ["Pedra Bonita", "Vidigal — Dois Irmãos", "Floresta da Tijuca", "Praia Vermelha & Pista Cláudio Coutinho"],
    img: sugarloafImg,
  },
];

const eventos = [
  { mes: "Fev / Mar", nome: "Carnaval do Rio", local: "Sambódromo + 500 blocos de rua", preco: "Grátis (camarote pago)" },
  { mes: "Abr", nome: "Tomorrowland Brasil (anos pares)", local: "Itu / Rio (eventos satélite)", preco: "A partir de R$ 800" },
  { mes: "Jun", nome: "Festa Junina da Quinta da Boa Vista", local: "São Cristóvão", preco: "Grátis" },
  { mes: "Set", nome: "Rock in Rio (anos ímpares)", local: "Parque Olímpico", preco: "A partir de R$ 695" },
  { mes: "Dez", nome: "Réveillon de Copacabana", local: "Praia de Copacabana", preco: "Grátis" },
  { mes: "Ano todo", nome: "Maracanã — jogos de futebol", local: "Estádio do Maracanã", preco: "A partir de R$ 60" },
];

const restaurantes = [
  { nome: "Aprazível", bairro: "Santa Teresa", cozinha: "Brasileira contemporânea",
    desc: "Vista panorâmica da Baía de Guanabara, ambiente ao ar livre entre árvores.", preco: "$$$" },
  { nome: "Confeitaria Colombo", bairro: "Centro", cozinha: "Café & doces",
    desc: "Salão belle époque de 1894, ponto histórico para chá da tarde e pastéis de Belém.", preco: "$$" },
  { nome: "Casa da Feijoada", bairro: "Ipanema", cozinha: "Brasileira tradicional",
    desc: "Feijoada todos os dias, com cinco tipos de carne e acompanhamentos clássicos.", preco: "$$" },
  { nome: "Bar Urca", bairro: "Urca", cozinha: "Petiscos & cerveja",
    desc: "Pastéis de camarão na mureta da Baía, com pôr do sol atrás do Pão de Açúcar.", preco: "$" },
  { nome: "Oro", bairro: "Leblon", cozinha: "Alta gastronomia",
    desc: "Estrela Michelin do chef Felipe Bronze, menu degustação com produtos brasileiros.", preco: "$$$$" },
  { nome: "Galeto Sat's", bairro: "Copacabana", cozinha: "Galetos",
    desc: "Tradição de 60 anos: frango assado, polenta frita e chope gelado.", preco: "$" },
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

const hospedagens = [
  { name: "Belmond Copacabana Palace", tier: "Patrocinado · Luxo",
    desc: "Ícone art déco em frente a Copacabana, piscina histórica e spa premiado.",
    preco: "A partir de R$ 2.890/noite",
    desconto: "10% OFF com o cupom TURISRIO10",
    cupom: "TURISRIO10",
    url: "https://www.belmond.com/hotels/south-america/brazil/rio-de-janeiro/belmond-copacabana-palace/",
    img: hotelImg },
  { name: "Hotel Fasano Ipanema", tier: "Patrocinado · Boutique",
    desc: "Design assinado por Philippe Starck, rooftop com vista para o Arpoador.",
    preco: "A partir de R$ 1.950/noite",
    desconto: "15% OFF em estadias de 3+ noites",
    cupom: "TURISRIO15",
    url: "https://www.booking.com/hotel/br/fasano-rio-de-janeiro.pt-br.html",
    img: sugarloafImg },
  { name: "Selina Lapa Rio", tier: "Patrocinado · Hostel design",
    desc: "Coworking, eventos e quartos compartilhados no coração da Lapa.",
    preco: "A partir de R$ 120/noite",
    desconto: "20% OFF na 1ª reserva",
    cupom: "RIO20",
    url: "https://www.booking.com/searchresults.pt-br.html?ss=Lapa%2C+Rio+de+Janeiro",
    img: lapaImg },
];

const guia = [
  {
    title: "1. O melhor pôr do sol da cidade",
    body: "Para um pôr do sol inesquecível, suba a Pedra do Arpoador 40 minutos antes do horário oficial. Quando o sol toca o mar, a multidão aplaude — uma tradição carioca desde os anos 70. Em dias de céu limpo, o Mirante do Leblon e o Forte de Copacabana são alternativas mais tranquilas.",
  },
  {
    title: "2. Onde provar a verdadeira cozinha carioca",
    body: "Comece com pastel de camarão e chope no Bar Urca, sentado na mureta. Em um sábado, almoço de feijoada na Casa da Feijoada (Ipanema) é regra. À noite, peça galeto e polenta frita no Galeto Sat's. Para uma experiência refinada, reserve no Oro (Leblon), estrela Michelin.",
  },
  {
    title: "3. Como aproveitar as praias com segurança",
    body: "Cada posto tem seu público: Posto 9 em Ipanema é jovem e descolado, Posto 6 em Copacabana é família. Leve apenas o essencial — quiosques têm guarda-volumes pago. Bandeira vermelha indica mar perigoso; respeite os guarda-vidas. Hidrate-se sempre.",
  },
  {
    title: "4. Vida noturna além da Lapa",
    body: "A Lapa é o clássico — mas o Rio noturno vai além. No Comuna (Botafogo), microcervejarias e indie. No Trapiche Gamboa, samba de raiz. Em Ipanema, o Jobi serve até 4h da manhã desde 1956. Use Uber ou taxi: estacionar é difícil e arriscado.",
  },
];

const faq = [
  { q: "Qual a melhor época para visitar o Rio?", a: "Entre abril e outubro o clima é mais ameno e seco. Dezembro a fevereiro tem alta temporada e Carnaval." },
  { q: "É seguro andar pela cidade?", a: "Sim, com bom senso. Use aplicativos de transporte à noite, evite ostentar objetos e prefira praias e bairros movimentados." },
  { q: "Como funciona o transporte público?", a: "Metrô atende Centro, Zona Sul e Barra. Use o cartão Riocard ou pagamento por aproximação." },
  { q: "Preciso falar português?", a: "Em hotéis e atrações principais há atendimento em inglês e espanhol, mas algumas palavras em português ajudam muito." },
  { q: "O TurisRio cobra alguma taxa?", a: "Não. O conteúdo é gratuito — alguns hotéis e experiências são patrocinados e estão sinalizados." },
];

const supportSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  type: z.enum(["bug", "question", "feedback"]),
  subject: z.string().trim().min(3, "Assunto muito curto").max(150),
  message: z.string().trim().min(10, "Conte um pouco mais").max(2000),
});

function Index() {
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

      <main id="main-content">
      {/* HERO */}
      <section aria-label="Apresentação" className="relative min-h-[100svh] overflow-hidden">
        <img src={heroImg} alt="Vista aérea do Rio de Janeiro com o Pão de Açúcar e Copacabana ao pôr do sol"
          width={1792} height={1024}
          className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-sunset)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-24 min-h-[100svh] flex flex-col justify-center">
          <span className="glass-dark inline-flex items-center gap-2 self-start px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em]">
            <MapPin className="size-3" /> Guia de turismo · Rio de Janeiro
          </span>
          <h1 className="editorial text-5xl sm:text-7xl md:text-8xl mt-6 max-w-4xl text-white drop-shadow-2xl">
            O Rio,<br />
            <span className="text-gradient-gold italic">de cabo a rabo.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90">
            Pontos turísticos, roteiros prontos, eventos, restaurantes e hospedagem — tudo o que você precisa para planejar sua viagem à Cidade Maravilhosa.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#pontos"
              className="group inline-flex items-center gap-2 gradient-gold text-primary px-6 py-3.5 rounded-full font-semibold shadow-glow hover:scale-[1.02] transition">
              Explorar pontos turísticos <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
            </a>
            <a href="#roteiros" className="glass inline-flex items-center gap-2 text-white px-6 py-3.5 rounded-full font-medium border border-white/20">
              Ver roteiros prontos
            </a>
          </div>
          <a href="#intro" aria-label="Rolar para conteúdo"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 animate-bounce">
            <ChevronDown className="size-6" />
          </a>
        </div>
      </section>

      {/* INTRODUÇÃO */}
      <section id="intro" className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Bem-vindo ao Rio</p>
        <h2 className="editorial text-4xl sm:text-5xl mt-4">A cidade entre o mar e a montanha.</h2>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Fundado em 1565, o Rio de Janeiro é a única capital do mundo abraçada por uma floresta tropical urbana — a Tijuca. São <strong>23 km de praias</strong>, mais de <strong>40 mirantes</strong>, séculos de história colonial, samba nascido na Pedra do Sal e a maior festa popular do planeta. Este guia reúne o essencial para você viver o Rio como um carioca.
        </p>
      </section>

      {/* PONTOS TURÍSTICOS com tags */}
      <section id="pontos" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Pontos turísticos</p>
          <h2 className="editorial text-4xl sm:text-5xl mt-3 max-w-2xl">Cartões-postais imperdíveis.</h2>
        </div>

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

      {/* ROTEIROS PRONTOS */}
      <section id="roteiros" className="bg-secondary/40 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <RouteIcon className="size-4" /> Roteiros sugeridos
          </p>
          <h2 className="editorial text-4xl sm:text-5xl mt-3 max-w-2xl">Itinerários prontos para seguir.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl">Três roteiros testados para diferentes perfis de viajante. Use como base e ajuste à sua viagem.</p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {roteiros.map((r) => (
              <article key={r.titulo} className="bg-card rounded-3xl overflow-hidden shadow-soft flex flex-col">
                <div className="relative h-44 overflow-hidden">
                  <img src={r.img} alt={r.titulo} loading="lazy" width={1280} height={896}
                    className="size-full object-cover" />
                  <span className="absolute top-3 right-3 glass-dark text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {r.duracao}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{r.publico}</span>
                  <h3 className="editorial text-xl mt-1">{r.titulo}</h3>
                  <ol className="mt-4 space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
                    {r.paradas.map((p) => <li key={p}>{p}</li>)}
                  </ol>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTOS */}
      <section id="eventos" className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Calendar className="size-4" /> Calendário
        </p>
        <h2 className="editorial text-4xl sm:text-5xl mt-3">Eventos imperdíveis.</h2>
        <p className="mt-4 text-muted-foreground max-w-xl">Os principais eventos do calendário carioca, mês a mês.</p>

        <ul className="mt-10 divide-y divide-border/60 border-y border-border/60">
          {eventos.map((e) => (
            <li key={e.nome} className="py-5 grid grid-cols-[80px_1fr_auto] gap-4 items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground bg-accent/30 px-2.5 py-1 rounded-full text-center">
                {e.mes}
              </span>
              <div>
                <h3 className="font-semibold">{e.nome}</h3>
                <p className="text-sm text-muted-foreground">{e.local}</p>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:block">{e.preco}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CULTURA & GASTRONOMIA */}
      <section id="cultura" className="bg-secondary/40 py-24">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
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

      {/* RESTAURANTES */}
      <section id="restaurantes" className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Utensils className="size-4" /> Restaurantes
        </p>
        <h2 className="editorial text-4xl sm:text-5xl mt-3 max-w-2xl">Onde comer no Rio.</h2>
        <p className="mt-4 text-muted-foreground max-w-xl">Uma seleção de endereços icônicos, do botequim de bairro à alta gastronomia.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {restaurantes.map((r) => (
            <article key={r.nome} className="bg-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-lg">{r.nome}</h3>
                <span className="text-xs font-mono text-primary">{r.preco}</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                {r.bairro} · {r.cozinha}
              </p>
              <p className="text-sm text-muted-foreground mt-3">{r.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HOSPEDAGEM PATROCINADA */}
      <section id="hospedagem" className="bg-secondary/40 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Building2 className="size-4 text-accent" /> Hospedagem · Parceiros patrocinados
              </p>
              <h2 className="editorial text-4xl sm:text-5xl mt-3 max-w-2xl">Onde dormir no Rio.</h2>
            </div>
            <span className="text-xs text-muted-foreground max-w-xs">
              Estabelecimentos selecionados que apoiam o TurisRio. Reservas direto no parceiro.
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {hospedagens.map((h) => (
              <article key={h.name}
                className="group relative bg-card rounded-3xl overflow-hidden shadow-soft border border-accent/20 hover:border-accent/60 transition flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img src={h.img} alt={`Foto de ${h.name}`} loading="lazy" width={1280} height={896}
                    className="size-full object-cover group-hover:scale-105 transition duration-700" />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 gradient-gold text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <BadgeCheck className="size-3" /> {h.tier}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg">{h.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{h.desc}</p>
                  <div className="mt-4 p-3 rounded-xl bg-accent/15 border border-accent/30">
                    <p className="text-xs uppercase tracking-wider text-accent-foreground/80">Desconto exclusivo TurisRio</p>
                    <p className="text-sm font-semibold mt-1">{h.desconto}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="px-2 py-1 bg-background rounded text-xs font-mono">{h.cupom}</code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(h.cupom);
                          toast.success(`Cupom ${h.cupom} copiado!`);
                        }}
                        className="text-xs underline text-muted-foreground hover:text-foreground"
                      >
                        Copiar cupom
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">{h.preco}</span>
                    <a href={h.url} target="_blank" rel="noopener noreferrer sponsored"
                      aria-label={`Reservar no site oficial de ${h.name} (abre em nova aba)`}
                      className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium hover:opacity-90">
                      Reservar <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Quer divulgar seu hotel, pousada ou restaurante? <a href="#suporte" className="underline">Fale com a equipe</a>.
          </p>
        </div>
      </section>

      {/* GUIA EDITORIAL — recomendações em formato artigo */}
      <section id="guia" className="max-w-3xl mx-auto px-6 py-24">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <BookOpen className="size-4" /> Guia editorial
        </p>
        <h2 className="editorial text-4xl sm:text-5xl mt-3">As melhores experiências do Rio.</h2>
        <p className="mt-4 text-muted-foreground">Recomendações da nossa redação — o que fazer, onde comer e como aproveitar a cidade como quem mora aqui.</p>

        <div className="mt-12 space-y-10">
          {guia.map((g) => (
            <article key={g.title}>
              <h3 className="editorial text-2xl">{g.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{g.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 flex items-center gap-3 text-sm text-muted-foreground border-t border-border/60 pt-6">
          <Sun className="size-4 text-accent" />
          <span>Atualizado mensalmente pela equipe TurisRio.</span>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-secondary/40 py-24">
        <div className="max-w-3xl mx-auto px-6">
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
        </div>
      </section>

      {/* SUPORTE */}
      <SuporteForm />

      </main>
      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        TurisRio · Guia de turismo · Rio de Janeiro, Brasil
      </footer>
    </div>
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
    <section id="suporte" className="py-24">
      <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <LifeBuoy className="size-4" /> Suporte & contato
          </p>
          <h2 className="editorial text-4xl sm:text-5xl mt-3">Encontrou um bug? Tem uma dúvida?</h2>
          <p className="mt-4 text-muted-foreground max-w-md">Mande pra gente. Lemos e respondemos cada mensagem — bugs, sugestões, parcerias e dúvidas de viagem.</p>
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