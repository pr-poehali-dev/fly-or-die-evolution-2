import { useState } from "react";
import { Screen } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  onNavigate: (s: Screen) => void;
}

const MISSIONS = [
  {
    id: 1,
    name: "Охота на Дракона",
    desc: "Объединитесь в группу из 3 игроков и уничтожьте Дракона-боса в верхнем ярусе.",
    reward: 1200,
    rewardEmoji: "🪙",
    players: { current: 2, max: 3 },
    difficulty: "hard",
    time: "20 мин",
    status: "waiting",
    icon: "🐉",
    tier: "Высь",
  },
  {
    id: 2,
    name: "Защита гнезда",
    desc: "Защищайте гнездо от волн хищников вместе с напарником в течение 10 минут.",
    reward: 600,
    rewardEmoji: "🪙",
    players: { current: 1, max: 2 },
    difficulty: "medium",
    time: "10 мин",
    status: "active",
    icon: "🥚",
    tier: "Земля",
  },
  {
    id: 3,
    name: "Великая миграция",
    desc: "Сопроводите стаю мелких существ из нижнего яруса в средний, избегая хищников.",
    reward: 800,
    rewardEmoji: "🪙",
    players: { current: 3, max: 4 },
    difficulty: "medium",
    time: "15 мин",
    status: "waiting",
    icon: "🦋",
    tier: "Воздух",
  },
  {
    id: 4,
    name: "Царство насекомых",
    desc: "Соберите 500 единиц пищи вместе за 5 минут — только на земляном ярусе.",
    reward: 300,
    rewardEmoji: "🪙",
    players: { current: 0, max: 2 },
    difficulty: "easy",
    time: "5 мин",
    status: "open",
    icon: "🌿",
    tier: "Земля",
  },
  {
    id: 5,
    name: "Небесный турнир",
    desc: "Соревнуйтесь с командой соперников: чья сторона наберёт больше массы за 15 минут.",
    reward: 1500,
    rewardEmoji: "🪙",
    players: { current: 4, max: 6 },
    difficulty: "hard",
    time: "15 мин",
    status: "active",
    icon: "🏆",
    tier: "Воздух",
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#4ade80",
  medium: "#60a5fa",
  hard: "#f59e0b",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Лёгкая",
  medium: "Средняя",
  hard: "Сложная",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#4ade80",
  waiting: "#f59e0b",
  active: "#60a5fa",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Открыта",
  waiting: "Ждёт игроков",
  active: "Идёт",
};

export default function CoopMissions({ onNavigate }: Props) {
  const [joined, setJoined] = useState<number | null>(null);
  const [selected, setSelected] = useState<typeof MISSIONS[0] | null>(null);

  return (
    <div
      className="min-h-screen"
      style={{ background: "radial-gradient(ellipse at top left, #0a0514 0%, #05080f 60%, #060f08 100%)" }}
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
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-cinzel text-xs text-foreground/40 tracking-wider">247 онлайн</span>
          </div>
        </div>

        <h1 className="font-cinzel-deco text-3xl text-gold-gradient mb-2 text-center">Кооп-миссии</h1>
        <p className="font-crimson text-foreground/40 text-center mb-8">
          Объединяйтесь с другими игроками для совместных вызовов
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Завершено", value: "8", icon: "CheckCircle", color: "text-emerald-400" },
            { label: "Активных", value: "2", icon: "Zap", color: "text-gold-400" },
            { label: "Лучшее место", value: "#3", icon: "Trophy", color: "text-sky-400" },
          ].map((s) => (
            <div key={s.label} className="card-dark rounded-xl p-4 text-center">
              <Icon name={s.icon} size={18} className={`${s.color} mx-auto mb-1 opacity-70`} />
              <div className={`font-cinzel text-lg ${s.color}`}>{s.value}</div>
              <div className="font-crimson text-xs text-foreground/40 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Missions list */}
        <div className="space-y-4">
          {MISSIONS.map((m) => (
            <div
              key={m.id}
              className="card-dark rounded-2xl p-5 cursor-pointer"
              onClick={() => setSelected(m)}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 border"
                  style={{
                    background: `${DIFFICULTY_COLORS[m.difficulty]}10`,
                    borderColor: `${DIFFICULTY_COLORS[m.difficulty]}25`,
                  }}
                >
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-cinzel text-sm tracking-wider text-foreground/90">{m.name}</h3>
                    <span
                      className="font-cinzel text-xs px-2 py-0.5 rounded-full"
                      style={{
                        color: STATUS_COLORS[m.status],
                        background: `${STATUS_COLORS[m.status]}15`,
                        border: `1px solid ${STATUS_COLORS[m.status]}30`,
                      }}
                    >
                      {STATUS_LABELS[m.status]}
                    </span>
                  </div>
                  <p className="font-crimson text-sm text-foreground/50 leading-relaxed mb-3 line-clamp-2">
                    {m.desc}
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-cinzel text-xs text-foreground/40 flex items-center gap-1">
                      <Icon name="Users" size={11} />
                      {m.players.current}/{m.players.max}
                    </span>
                    <span className="font-cinzel text-xs text-foreground/40 flex items-center gap-1">
                      <Icon name="Clock" size={11} />
                      {m.time}
                    </span>
                    <span className="font-cinzel text-xs" style={{ color: DIFFICULTY_COLORS[m.difficulty] }}>
                      {DIFFICULTY_LABELS[m.difficulty]}
                    </span>
                    <span className="font-cinzel text-xs text-gold-400 flex items-center gap-1">
                      🪙 {m.reward}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  {joined === m.id ? (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Icon name="CheckCircle" size={14} />
                      <span className="font-cinzel text-xs">В команде</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setJoined(m.id);
                      }}
                      className="btn-gold px-4 py-2 text-xs rounded-lg"
                    >
                      Войти
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar for players */}
              <div className="mt-4">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(m.players.current / m.players.max) * 100}%`,
                      background: `linear-gradient(90deg, ${DIFFICULTY_COLORS[m.difficulty]}, ${DIFFICULTY_COLORS[m.difficulty]}aa)`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-cinzel text-xs text-foreground/30">Игроки</span>
                  <span className="font-cinzel text-xs text-foreground/30">{m.players.current} из {m.players.max}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create mission btn */}
        <button className="btn-outline-gold w-full py-4 rounded-xl mt-6 flex items-center justify-center gap-2 text-sm">
          <Icon name="Plus" size={16} />
          Создать свою миссию
        </button>
      </div>

      {/* Mission detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative card-dark rounded-2xl p-7 max-w-md w-full mx-4 animate-scale-in">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-foreground/40 hover:text-foreground">
              <Icon name="X" size={18} />
            </button>

            <div className="text-4xl mb-4">{selected.icon}</div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="font-cinzel text-lg text-gold-400 tracking-wider">{selected.name}</h2>
              <span
                className="font-cinzel text-xs px-2 py-0.5 rounded-full"
                style={{
                  color: DIFFICULTY_COLORS[selected.difficulty],
                  background: `${DIFFICULTY_COLORS[selected.difficulty]}15`,
                  border: `1px solid ${DIFFICULTY_COLORS[selected.difficulty]}30`,
                }}
              >
                {DIFFICULTY_LABELS[selected.difficulty]}
              </span>
            </div>
            <p className="font-crimson text-foreground/60 mb-5 leading-relaxed">{selected.desc}</p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Ярус", value: selected.tier },
                { label: "Время", value: selected.time },
                { label: "Команда", value: `${selected.players.current}/${selected.players.max}` },
                { label: "Награда", value: `🪙 ${selected.reward}` },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="font-cinzel text-xs text-foreground/30 mb-0.5">{item.label}</div>
                  <div className="font-cinzel text-sm text-foreground/80">{item.value}</div>
                </div>
              ))}
            </div>

            {joined === selected.id ? (
              <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 border border-emerald-400/30 rounded-xl">
                <Icon name="CheckCircle" size={16} />
                <span className="font-cinzel text-sm">Вы уже в команде!</span>
              </div>
            ) : (
              <button
                onClick={() => { setJoined(selected.id); setSelected(null); }}
                className="btn-gold w-full py-3 rounded-xl text-sm"
              >
                Присоединиться
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
