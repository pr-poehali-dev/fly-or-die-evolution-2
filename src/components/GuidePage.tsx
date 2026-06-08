import { useState } from "react";
import { Screen } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  onNavigate: (s: Screen) => void;
}

const EVOLUTION_CHAIN = [
  { emoji: "🦟", name: "Муха / Комар", mass: "0+", tier: "Земля", color: "#6ee7b7", desc: "Самое уязвимое существо. Ешь частицы пищи и избегай всех остальных." },
  { emoji: "🪲", name: "Жук / Мышь", mass: "50+", tier: "Земля", color: "#86efac", desc: "Появляется немного здоровья. Можно нападать на мух." },
  { emoji: "🦎", name: "Ящерица", mass: "150+", tier: "Земля", color: "#4ade80", desc: "Хорошая скорость, начинаешь доминировать на нижнем ярусе." },
  { emoji: "🪁", name: "Стрекоза", mass: "300+", tier: "Воздух", color: "#93c5fd", desc: "Первый полёт! Открывается средний ярус и новая пища." },
  { emoji: "🦅", name: "Ястреб", mass: "600+", tier: "Воздух", color: "#60a5fa", desc: "Высокая скорость и урон. Опасен для большинства существ." },
  { emoji: "🐉", name: "Дракон", mass: "1200+", tier: "Высь", color: "#fbbf24", desc: "Вершина пищевой цепи. Никто не осмелится атаковать тебя." },
];

const TIPS = [
  { icon: "🍃", title: "Питайся постоянно", text: "Существо голодает со временем. Если не есть — потеряешь массу и эволюцию." },
  { icon: "⚡", title: "Береги энергию", text: "Ускорение тратит энергию. Используй рывок только для охоты или побега." },
  { icon: "👁️", title: "Оценивай противника", text: "Атакуй только тех, кто меньше тебя. Число под существом — его масса." },
  { icon: "🗺️", title: "Изучай ярусы", text: "На верхних ярусах меньше конкурентов, но и пищи тоже меньше." },
  { icon: "💀", title: "Смерть — не конец", text: "После гибели ты возрождаешься насекомым. Опыт накапливается в профиле." },
  { icon: "🤝", title: "Кооп — быстрый старт", text: "В кооп-миссиях проще набрать массу с союзниками в начале игры." },
];

const CONTROLS = [
  { input: "Мышь", action: "Направление движения" },
  { input: "ЛКМ (зажать)", action: "Ускорение / рывок" },
  { input: "Колёсико", action: "Масштаб камеры" },
  { input: "Esc", action: "Пауза / меню" },
];

const SECTIONS = ["Эволюция", "Советы", "Управление", "Ярусы"] as const;
type Section = typeof SECTIONS[number];

export default function GuidePage({ onNavigate }: Props) {
  const [active, setActive] = useState<Section>("Эволюция");

  return (
    <div
      className="min-h-screen"
      style={{ background: "radial-gradient(ellipse at bottom left, #05100a 0%, #05080f 60%, #0a0510 100%)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate("menu")}
            className="btn-outline-gold px-4 py-2 text-xs rounded-lg flex items-center gap-2"
          >
            <Icon name="ArrowLeft" size={13} />
            Назад
          </button>
        </div>

        <h1 className="font-cinzel-deco text-3xl text-gold-gradient mb-2 text-center">Гайд</h1>
        <p className="font-crimson text-foreground/40 text-center mb-8">Всё что нужно знать для победы</p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-8 overflow-x-auto"
          style={{ background: "rgba(15,20,35,0.6)", border: "1px solid rgba(251,191,36,0.1)" }}>
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={`flex-1 py-2.5 rounded-lg font-cinzel text-xs tracking-wider transition-all whitespace-nowrap px-3 ${
                active === s ? "btn-gold" : "text-foreground/50 hover:text-foreground/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Evolution */}
        {active === "Эволюция" && (
          <div className="animate-fade-in">
            <div
              className="rounded-2xl mb-6 overflow-hidden border border-gold-500/15"
              style={{ background: "rgba(15,20,35,0.7)" }}
            >
              <img
                src="https://cdn.poehali.dev/projects/c123528a-7ef2-4b8e-bead-d1de45fdb71b/files/d21de9d0-6238-49cc-8c25-8e4b3e431f86.jpg"
                alt="Эволюция существ"
                className="w-full h-48 object-cover opacity-70"
              />
            </div>
            <div className="space-y-3">
              {EVOLUTION_CHAIN.map((e, i) => (
                <div key={e.name} className="card-dark rounded-xl p-5 flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border"
                      style={{ borderColor: `${e.color}30`, background: `${e.color}10` }}
                    >
                      {e.emoji}
                    </div>
                    {i < EVOLUTION_CHAIN.length - 1 && (
                      <div className="w-0.5 h-4 mt-1 rounded-full" style={{ background: `${e.color}40` }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-cinzel text-sm" style={{ color: e.color }}>{e.name}</span>
                      <span className="font-cinzel text-xs text-foreground/30 border border-border/30 px-2 py-0.5 rounded-full">{e.tier}</span>
                      <span className="font-cinzel text-xs text-foreground/30">масса {e.mass}</span>
                    </div>
                    <p className="font-crimson text-sm text-foreground/60">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {active === "Советы" && (
          <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
            {TIPS.map((tip) => (
              <div key={tip.title} className="card-dark rounded-xl p-5">
                <div className="text-2xl mb-3">{tip.icon}</div>
                <h3 className="font-cinzel text-sm text-gold-400 mb-2 tracking-wider">{tip.title}</h3>
                <p className="font-crimson text-sm text-foreground/60 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        {active === "Управление" && (
          <div className="card-dark rounded-2xl overflow-hidden animate-fade-in">
            {CONTROLS.map((c, i) => (
              <div
                key={c.input}
                className={`flex items-center px-6 py-4 ${i < CONTROLS.length - 1 ? "border-b border-border/30" : ""}`}
              >
                <div className="flex-1">
                  <span
                    className="font-cinzel text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}
                  >
                    {c.input}
                  </span>
                </div>
                <div className="font-crimson text-sm text-foreground/70">{c.action}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tiers */}
        {active === "Ярусы" && (
          <div className="space-y-4 animate-fade-in">
            <div
              className="rounded-2xl overflow-hidden border border-gold-500/15"
              style={{ background: "rgba(15,20,35,0.7)" }}
            >
              <img
                src="https://cdn.poehali.dev/projects/c123528a-7ef2-4b8e-bead-d1de45fdb71b/files/f216db2a-3ddb-45f6-bce8-9bbc6103ff9c.jpg"
                alt="Высший ярус"
                className="w-full h-52 object-cover opacity-60"
              />
            </div>
            {[
              {
                name: "Нижний ярус — Земля", emoji: "🌿", color: "#4ade80",
                creatures: "Муха, Жук, Ящерица",
                desc: "Самая плотная зона. Много еды, но и много хищников. Нужно быстро расти, чтобы выжить.",
                food: "Частицы, яйца, грибы",
                danger: "Очень высокая",
              },
              {
                name: "Средний ярус — Воздух", emoji: "☁️", color: "#60a5fa",
                creatures: "Стрекоза, Ястреб",
                desc: "Открывается при достижении стадии стрекозы. Больше пространства для манёвра.",
                food: "Птицы, крупные насекомые, ягоды",
                danger: "Средняя",
              },
              {
                name: "Верхний ярус — Высь", emoji: "⚡", color: "#fbbf24",
                creatures: "Дракон, Грифон",
                desc: "Только для сильнейших. Мало еды, но почти нет угроз. Абсолютная власть.",
                food: "Редкие существа, орбитальные частицы",
                danger: "Низкая",
              },
            ].map((tier) => (
              <div key={tier.name} className="card-dark rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tier.emoji}</span>
                  <span className="font-cinzel text-sm tracking-wider" style={{ color: tier.color }}>{tier.name}</span>
                </div>
                <p className="font-crimson text-sm text-foreground/60 mb-3">{tier.desc}</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="font-cinzel text-foreground/30 mb-1">Существа</div>
                    <div className="font-crimson text-foreground/70">{tier.creatures}</div>
                  </div>
                  <div>
                    <div className="font-cinzel text-foreground/30 mb-1">Пища</div>
                    <div className="font-crimson text-foreground/70">{tier.food}</div>
                  </div>
                  <div>
                    <div className="font-cinzel text-foreground/30 mb-1">Опасность</div>
                    <div className="font-crimson" style={{ color: tier.color }}>{tier.danger}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
