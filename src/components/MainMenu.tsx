import { useEffect, useRef, useState } from "react";
import { Screen } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  onNavigate: (s: Screen) => void;
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  emoji: ["🦟", "🪲", "🦋", "🦅", "🐉", "🦎", "🦜", "🦇"][i % 8],
  left: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 8 + Math.random() * 10,
  size: 12 + Math.random() * 20,
}));

export default function MainMenu({ onNavigate }: Props) {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sfx, setSfx] = useState(true);
  const [music, setMusic] = useState(true);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("high");

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://cdn.poehali.dev/projects/c123528a-7ef2-4b8e-bead-d1de45fdb71b/files/503892a3-8b71-480b-8750-6ccde062d4c1.jpg)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${p.left}%`,
            bottom: "-60px",
            fontSize: `${p.size}px`,
            animation: `particle-float ${p.duration}s ${p.delay}s linear infinite`,
            opacity: 0.6,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Top nav */}
      <div className="relative z-10 flex justify-between items-center px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-cinzel text-xs tracking-[0.3em] text-gold-300 uppercase opacity-70">
            v1.0.0
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate("profile")}
            className="btn-outline-gold px-4 py-2 text-xs rounded-lg flex items-center gap-2"
          >
            <Icon name="User" size={14} />
            Профиль
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="btn-outline-gold px-4 py-2 text-xs rounded-lg flex items-center gap-2"
          >
            <Icon name="Settings" size={14} />
            Настройки
          </button>
        </div>
      </div>

      {/* Hero center */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div
          className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="font-cinzel text-xs tracking-[0.5em] text-gold-400 uppercase mb-4 opacity-80">
            Многопользовательское выживание
          </p>
          <h1 className="font-cinzel-deco text-6xl md:text-8xl font-bold leading-none mb-2">
            <span className="text-gold-gradient">FLY</span>
            <span className="text-foreground/30 mx-4 font-cinzel text-4xl md:text-5xl">or</span>
            <span className="text-gold-gradient">DIE</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/50" />
            <span className="font-cinzel text-gold-400 text-sm tracking-[0.4em]">.io</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/50" />
          </div>
          <p className="font-crimson text-lg md:text-xl text-foreground/70 max-w-md mx-auto leading-relaxed mb-12">
            От ничтожного насекомого до властелина небес.
            <br />
            <span className="text-gold-400/80">Эволюция — твой единственный шанс.</span>
          </p>

          {/* Main buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
            <button
              onClick={() => onNavigate("game")}
              className="btn-gold px-10 py-4 text-base rounded-xl w-full sm:w-auto min-w-[200px] animate-pulse-glow"
            >
              ▶ Играть
            </button>
            <button
              onClick={() => onNavigate("coop")}
              className="btn-outline-gold px-8 py-4 text-sm rounded-xl w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
            >
              <Icon name="Users" size={16} />
              Кооп миссии
            </button>
          </div>

          {/* Sub nav */}
          <div className="flex gap-6 items-center justify-center flex-wrap">
            {[
              { label: "Магазин", screen: "shop" as Screen, icon: "ShoppingBag" },
              { label: "Гайд", screen: "guide" as Screen, icon: "BookOpen" },
              { label: "Рейтинг", screen: "profile" as Screen, icon: "Trophy" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.screen)}
                className="flex items-center gap-2 text-foreground/50 hover:text-gold-400 transition-colors duration-200 font-cinzel text-sm tracking-wider"
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="relative z-10 flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-cinzel text-xs text-foreground/40 tracking-wider">
            1 247 онлайн
          </span>
        </div>
        <div className="flex gap-6">
          {[
            { tier: "🌿 Земля", color: "text-emerald-400" },
            { tier: "☁️ Воздух", color: "text-sky-400" },
            { tier: "⚡ Высь", color: "text-gold-400" },
          ].map((t) => (
            <span key={t.tier} className={`font-cinzel text-xs tracking-wider ${t.color} opacity-60`}>
              {t.tier}
            </span>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="relative card-dark rounded-2xl p-8 w-full max-w-md mx-4 animate-scale-in">
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
            <h2 className="font-cinzel text-xl text-gold-400 mb-6 tracking-wider">Настройки</h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-crimson text-foreground/80">Звуковые эффекты</span>
                <button
                  onClick={() => setSfx(!sfx)}
                  className={`w-12 h-6 rounded-full transition-colors ${sfx ? "bg-gold-500" : "bg-muted"} relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${sfx ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-crimson text-foreground/80">Музыка</span>
                <button
                  onClick={() => setMusic(!music)}
                  className={`w-12 h-6 rounded-full transition-colors ${music ? "bg-gold-500" : "bg-muted"} relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${music ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
              <div>
                <span className="font-crimson text-foreground/80 block mb-3">Качество графики</span>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`flex-1 py-2 rounded-lg font-cinzel text-xs tracking-wider transition-all ${
                        quality === q
                          ? "btn-gold"
                          : "border border-border/50 text-foreground/50 hover:border-gold-500/50"
                      }`}
                    >
                      {q === "low" ? "Низкое" : q === "medium" ? "Среднее" : "Высокое"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              className="btn-gold w-full py-3 rounded-xl mt-8 text-sm"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
