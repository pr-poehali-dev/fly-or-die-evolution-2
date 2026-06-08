import { useState } from "react";
import { Screen } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  onNavigate: (s: Screen) => void;
}

const ACHIEVEMENTS = [
  { id: 1, icon: "🦟", name: "Первый полёт", desc: "Достигни стадии стрекозы", unlocked: true, date: "03 июня" },
  { id: 2, icon: "🦅", name: "Охотник", desc: "Съешь 50 существ", unlocked: true, date: "05 июня" },
  { id: 3, icon: "🐉", name: "Властелин небес", desc: "Достигни стадии дракона", unlocked: false, date: null },
  { id: 4, icon: "⚡", name: "Молния", desc: "Проведи 10 мин в ускорении", unlocked: false, date: null },
  { id: 5, icon: "👑", name: "Лидер", desc: "Войди в топ-3 рейтинга", unlocked: false, date: null },
  { id: 6, icon: "🤝", name: "Союзник", desc: "Завершить 5 кооп-миссий", unlocked: true, date: "07 июня" },
  { id: 7, icon: "💀", name: "Выживший", desc: "Продержись 30 минут", unlocked: false, date: null },
  { id: 8, icon: "🌟", name: "Легенда", desc: "Набери 50 000 очков", unlocked: false, date: null },
];

const STATS = [
  { label: "Игр сыграно", value: "142", icon: "Gamepad2" },
  { label: "Лучший счёт", value: "18 450", icon: "Star" },
  { label: "Существ съедено", value: "1 247", icon: "Skull" },
  { label: "Время в игре", value: "23ч 14м", icon: "Clock" },
  { label: "Макс. масса", value: "2 840", icon: "TrendingUp" },
  { label: "Кооп-миссий", value: "8 / 20", icon: "Users" },
];

const SEASON_RANK = [
  { season: "Сезон 3", rank: "Серебро", icon: "🥈", pts: 1840 },
  { season: "Сезон 2", rank: "Бронза", icon: "🥉", pts: 920 },
  { season: "Сезон 1", rank: "Дерево", icon: "🌿", pts: 340 },
];

export default function ProfilePage({ onNavigate }: Props) {
  const [tab, setTab] = useState<"stats" | "achievements" | "history">("stats");

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "radial-gradient(ellipse at top, #0d1f0d 0%, #050e1a 50%, #080510 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => onNavigate("menu")}
          className="btn-outline-gold px-4 py-2 text-xs rounded-lg flex items-center gap-2 mb-8"
        >
          <Icon name="ArrowLeft" size={13} />
          Назад
        </button>

        {/* Profile header */}
        <div className="card-dark rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl border-2"
              style={{ borderColor: "rgba(251,191,36,0.4)", background: "rgba(15,20,35,0.8)" }}
            >
              🦅
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gold-500 text-black font-cinzel text-xs font-bold px-2 py-0.5 rounded-full">
              Lv.14
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-cinzel text-2xl text-gold-400 tracking-wider mb-1">SkyHunter_777</h1>
            <p className="font-crimson text-foreground/50 text-sm mb-3">Играет с мая 2026 · Текущая стадия: <span className="text-gold-400">Ястреб 🦅</span></p>
            <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
              <span className="tier-badge border text-emerald-400 border-emerald-400/30 bg-emerald-400/5">Воздушный ярус</span>
              <span className="tier-badge border text-gold-400 border-gold-400/30 bg-gold-400/5">🥈 Серебро S3</span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-cinzel-deco text-3xl text-gold-gradient">18 450</div>
            <div className="font-cinzel text-xs text-foreground/40 tracking-wider mt-1">Лучший счёт</div>
          </div>
        </div>

        {/* Season history */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {SEASON_RANK.map((s) => (
            <div key={s.season} className="card-dark rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-cinzel text-xs text-foreground/70 tracking-wider">{s.season}</div>
              <div className="font-cinzel text-sm text-gold-400 mt-0.5">{s.rank}</div>
              <div className="font-crimson text-xs text-foreground/40">{s.pts} pts</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "rgba(15,20,35,0.6)", border: "1px solid rgba(251,191,36,0.1)" }}>
          {(["stats", "achievements", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg font-cinzel text-xs tracking-wider transition-all ${
                tab === t ? "btn-gold" : "text-foreground/50 hover:text-foreground/80"
              }`}
            >
              {t === "stats" ? "Статистика" : t === "achievements" ? "Достижения" : "История"}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === "stats" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
            {STATS.map((stat) => (
              <div key={stat.label} className="card-dark rounded-xl p-4">
                <Icon name={stat.icon} size={18} className="text-gold-500 mb-2 opacity-70" />
                <div className="font-cinzel text-xl text-foreground/90">{stat.value}</div>
                <div className="font-crimson text-xs text-foreground/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements tab */}
        {tab === "achievements" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.id}
                className={`card-dark rounded-xl p-4 flex items-center gap-4 ${!a.unlocked ? "opacity-40" : ""}`}
              >
                <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl ${a.unlocked ? "bg-gold-500/10 border border-gold-500/20" : "bg-muted/30 border border-border/20"}`}>
                  {a.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-cinzel text-sm tracking-wider ${a.unlocked ? "text-gold-400" : "text-foreground/50"}`}>{a.name}</div>
                  <div className="font-crimson text-xs text-foreground/40 mt-0.5">{a.desc}</div>
                  {a.date && <div className="font-cinzel text-xs text-emerald-400/60 mt-1">{a.date}</div>}
                </div>
                {a.unlocked && <Icon name="CheckCircle" size={16} className="text-emerald-400 shrink-0" />}
              </div>
            ))}
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div className="space-y-3 animate-fade-in">
            {[
              { date: "08 июня", score: 4200, stage: "Ястреб 🦅", time: "18 мин", result: "win" },
              { date: "07 июня", score: 1850, stage: "Стрекоза 🪁", time: "9 мин", result: "loss" },
              { date: "07 июня", score: 3100, stage: "Ястреб 🦅", time: "14 мин", result: "win" },
              { date: "06 июня", score: 680, stage: "Ящерица 🦎", time: "4 мин", result: "loss" },
              { date: "05 июня", score: 5600, stage: "Дракон 🐉", time: "31 мин", result: "win" },
            ].map((g, i) => (
              <div key={i} className="card-dark rounded-xl px-5 py-4 flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full ${g.result === "win" ? "bg-emerald-500" : "bg-crimson-500"}`} />
                <div className="flex-1">
                  <div className="font-cinzel text-sm text-foreground/80">{g.stage}</div>
                  <div className="font-crimson text-xs text-foreground/40">{g.date} · {g.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-cinzel text-sm text-gold-400">{g.score.toLocaleString()}</div>
                  <div className="font-crimson text-xs text-foreground/40">очков</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
