import { useEffect, useState } from "react";
import { Accessibility, X, Plus, Minus, Contrast, Eye, Sparkles, RotateCcw } from "lucide-react";

type Prefs = {
  scale: number;
  highContrast: boolean;
  calm: boolean;
  dyslexia: boolean;
};

const DEFAULTS: Prefs = { scale: 1, highContrast: false, calm: false, dyslexia: false };
const KEY = "turisrio:a11y";

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function applyPrefs(p: Prefs) {
  const root = document.documentElement;
  root.style.setProperty("--a11y-font-scale", String(p.scale));
  root.classList.toggle("a11y-high-contrast", p.highContrast);
  root.classList.toggle("a11y-calm", p.calm);
  root.classList.toggle("a11y-dyslexia", p.dyslexia);
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    const p = loadPrefs();
    setPrefs(p);
    applyPrefs(p);
  }, []);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    applyPrefs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const reset = () => update(DEFAULTS);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir opções de acessibilidade"
        aria-haspopup="dialog"
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-glow grid place-items-center hover:scale-105 transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-ring"
      >
        <Accessibility className="size-6" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Opções de acessibilidade"
          className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-md bg-card text-card-foreground rounded-3xl p-6 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="editorial text-2xl">Acessibilidade</h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar"
                className="size-9 rounded-full hover:bg-secondary grid place-items-center">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-2">Tamanho do texto</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => update({ scale: Math.max(0.85, +(prefs.scale - 0.1).toFixed(2)) })}
                    aria-label="Diminuir texto"
                    className="size-10 rounded-full border border-border grid place-items-center hover:bg-secondary">
                    <Minus className="size-4" />
                  </button>
                  <span aria-live="polite" className="flex-1 text-center text-sm tabular-nums">
                    {Math.round(prefs.scale * 100)}%
                  </span>
                  <button onClick={() => update({ scale: Math.min(1.5, +(prefs.scale + 0.1).toFixed(2)) })}
                    aria-label="Aumentar texto"
                    className="size-10 rounded-full border border-border grid place-items-center hover:bg-secondary">
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              <Toggle
                icon={<Contrast className="size-4" />}
                label="Alto contraste"
                description="Para baixa visão e cegueira parcial."
                on={prefs.highContrast}
                onChange={(v) => update({ highContrast: v })}
              />
              <Toggle
                icon={<Sparkles className="size-4" />}
                label="Modo calmo (autismo, TDAH)"
                description="Remove animações, gradientes e estímulos visuais."
                on={prefs.calm}
                onChange={(v) => update({ calm: v })}
              />
              <Toggle
                icon={<Eye className="size-4" />}
                label="Fonte para dislexia"
                description="Espaçamento maior e fonte legível."
                on={prefs.dyslexia}
                onChange={(v) => update({ dyslexia: v })}
              />

              <button onClick={reset}
                className="w-full inline-flex items-center justify-center gap-2 text-sm py-2 rounded-full border border-border hover:bg-secondary">
                <RotateCcw className="size-3.5" /> Restaurar padrões
              </button>

              <p className="text-xs text-muted-foreground">
                O site também segue navegação por teclado (Tab) e leitores de tela. Atalho: pressione <kbd className="px-1.5 py-0.5 bg-secondary rounded">Tab</kbd> a partir do topo para usar o link "Pular para o conteúdo".
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Toggle({ icon, label, description, on, onChange }: {
  icon: React.ReactNode; label: string; description: string;
  on: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="w-full flex items-start gap-3 p-3 rounded-2xl border border-border hover:bg-secondary text-left"
    >
      <span className="size-9 rounded-full bg-secondary grid place-items-center shrink-0">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <span className={`mt-1 inline-block w-10 h-6 rounded-full p-0.5 transition ${on ? "bg-primary" : "bg-muted"}`}>
        <span className={`block size-5 rounded-full bg-background transition ${on ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}