import { useState } from "react";
import { Screen } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  onNavigate: (s: Screen) => void;
}

const SKINS = [
  {
    id: 1, stage: "Муха", stageEmoji: "🦟", name: "Золотая муха", preview: "✨🦟✨",
    rarity: "common", price: 200, owned: true, desc: "Блестящие крылья, сверкающие на солнце",
    color: "#d97706",
  },
  {
    id: 2, stage: "Жук", stageEmoji: "🪲", name: "Нефритовый жук", preview: "💚🪲💚",
    rarity: "rare", price: 450, owned: false, desc: "Панцирь цвета редкого камня",
    color: "#10b981",
  },
  {
    id: 3, stage: "Ящерица", stageEmoji: "🦎", name: "Огненная ящерица", preview: "🔥🦎🔥",
    rarity: "epic", price: 800, owned: false, desc: "Чешуя пылает как магма",
    color: "#ef4444",
  },
  {
    id: 4, stage: "Стрекоза", stageEmoji: "🪁", name: "Ледяная стрекоза", preview: "❄️🪁❄️",
    rarity: "rare", price: 600, owned: true, desc: "Крылья покрыты кристаллами льда",
    color: "#60a5fa",
  },
  {
    id: 5, stage: "Ястреб", stageEmoji: "🦅", name: "Тёмный ястреб", preview: "🌑🦅🌑",
    rarity: "epic", price: 1200, owned: false, desc: "Призрак неба — едва виден в сумерках",
    color: "#8b5cf6",
  },
  {
    id: 6, stage: "Дракон", stageEmoji: "🐉", name: "Небесный дракон", preview: "⭐🐉⭐",
    rarity: "legendary", price: 2500, owned: false, desc: "Легендарный властелин небес",
    color: "#fbbf24",
  },
  {
    id: 7, stage: "Дракон", stageEmoji: "🐉", name: "Кровавый дракон", preview: "💀🐉💀",
    rarity: "legendary", price: 2500, owned: false, desc: "Несёт смерть всему живому",
    color: "#dc2626",
  },
  {
    id: 8, stage: "Жук", stageEmoji: "🪲", name: "Призрачный жук", preview: "👻🪲👻",
    rarity: "common", price: 250, owned: true, desc: "Почти прозрачный, неуловимый",
    color: "#94a3b8",
  },
];

const RARITY_COLORS: Record<string, string> = {
  common: "#94a3b8",
  rare: "#60a5fa",
  epic: "#a78bfa",
  legendary: "#f59e0b",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Обычный",
  rare: "Редкий",
  epic: "Эпический",
  legendary: "Легендарный",
};

const FILTERS = ["Все", "Земля", "Воздух", "Высь", "В наличии"];

export default function ShopPage({ onNavigate }: Props) {
  const [filter, setFilter] = useState("Все");
  const [selected, setSelected] = useState<typeof SKINS[0] | null>(null);
  const [coins] = useState(1840);

  const filtered = SKINS.filter((s) => {
    if (filter === "В наличии") return s.owned;
    if (filter === "Земля") return ["Муха", "Жук", "Ящерица"].includes(s.stage);
    if (filter === "Воздух") return ["Стрекоза", "Ястреб"].includes(s.stage);
    if (filter === "Высь") return s.stage === "Дракон";
    return true;
  });

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top right, #1a0a05 0%, #05080f 50%, #080510 100%)",
      }}
    >
      <div className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-5 pointer-events-none"
        style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate("menu")}
            className="btn-outline-gold px-4 py-2 text-xs rounded-lg flex items-center gap-2"
          >
            <Icon name="ArrowLeft" size={13} />
            Назад
          </button>
          <div className="flex items-center gap-2 card-dark px-4 py-2 rounded-xl">
            <span className="text-yellow-400 text-lg">🪙</span>
            <span className="font-cinzel text-sm text-gold-400">{coins.toLocaleString()}</span>
            <button className="ml-2 btn-gold px-3 py-1 text-xs rounded-lg">+ Купить</button>
          </div>
        </div>

        <h1 className="font-cinzel-deco text-3xl text-gold-gradient mb-2 text-center">Магазин</h1>
        <p className="font-crimson text-foreground/40 text-center mb-8">Уникальные облики для твоих существ</p>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-cinzel text-xs tracking-wider transition-all ${
                filter === f ? "btn-gold" : "btn-outline-gold"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((skin) => (
            <button
              key={skin.id}
              onClick={() => setSelected(skin)}
              className="card-dark rounded-2xl p-4 text-left transition-all hover:scale-[1.02] group"
            >
              <div
                className="h-24 rounded-xl mb-3 flex items-center justify-center text-3xl font-serif"
                style={{ background: `radial-gradient(circle, ${skin.color}15 0%, transparent 70%)`, border: `1px solid ${skin.color}25` }}
              >
                {skin.preview}
              </div>
              <div
                className="font-cinzel text-xs mb-1"
                style={{ color: RARITY_COLORS[skin.rarity] }}
              >
                {RARITY_LABELS[skin.rarity]}
              </div>
              <div className="font-cinzel text-sm text-foreground/90 leading-tight mb-1">{skin.name}</div>
              <div className="font-crimson text-xs text-foreground/40 mb-3">{skin.stageEmoji} {skin.stage}</div>
              {skin.owned ? (
                <div className="flex items-center gap-1 text-emerald-400">
                  <Icon name="CheckCircle" size={12} />
                  <span className="font-cinzel text-xs">В наличии</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gold-400">
                  <span className="text-xs">🪙</span>
                  <span className="font-cinzel text-xs">{skin.price}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Skin detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative card-dark rounded-2xl p-8 max-w-sm w-full mx-4 animate-scale-in">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-foreground/40 hover:text-foreground">
              <Icon name="X" size={18} />
            </button>

            <div
              className="h-36 rounded-xl mb-5 flex items-center justify-center text-5xl font-serif"
              style={{ background: `radial-gradient(circle, ${selected.color}20 0%, transparent 70%)`, border: `1px solid ${selected.color}30` }}
            >
              {selected.preview}
            </div>

            <div style={{ color: RARITY_COLORS[selected.rarity] }} className="font-cinzel text-xs mb-1">
              {RARITY_LABELS[selected.rarity]}
            </div>
            <h3 className="font-cinzel text-xl text-foreground/90 mb-1">{selected.name}</h3>
            <p className="font-crimson text-foreground/50 text-sm mb-5">{selected.desc}</p>
            <p className="font-crimson text-foreground/40 text-xs mb-5">
              {selected.stageEmoji} Для стадии: <span className="text-foreground/70">{selected.stage}</span>
            </p>

            {selected.owned ? (
              <button className="btn-gold w-full py-3 rounded-xl text-sm">
                ✓ Применить скин
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-crimson text-foreground/50">Стоимость</span>
                  <span className="font-cinzel text-gold-400 text-lg">🪙 {selected.price}</span>
                </div>
                <button
                  className={`w-full py-3 rounded-xl text-sm ${coins >= selected.price ? "btn-gold" : "opacity-40 cursor-not-allowed btn-outline-gold"}`}
                  disabled={coins < selected.price}
                >
                  {coins >= selected.price ? "Купить скин" : "Недостаточно монет"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
