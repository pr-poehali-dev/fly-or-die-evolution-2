import { Screen } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import { EVOLUTION_STAGES } from "./gameTypes";

interface LeaderboardEntry {
  name: string;
  mass: number;
  isMe?: boolean;
}

interface Props {
  onNavigate: (s: Screen) => void;
  onRestart: () => void;
  mass: number;
  stageIdx: number;
  energy: number;
  score: number;
  alive: boolean;
  onlineCount: number;
  leaderboard: LeaderboardEntry[];
}

export default function GameHUD({
  onNavigate, onRestart,
  mass, stageIdx, energy, score, alive, onlineCount, leaderboard,
}: Props) {
  const stage = EVOLUTION_STAGES[stageIdx];
  const nextStage = EVOLUTION_STAGES[stageIdx + 1];
  const massProgress = nextStage
    ? ((mass - stage.minMass) / (nextStage.minMass - stage.minMass)) * 100
    : 100;

  return (
    <>
      {/* HUD — top left */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button onClick={() => onNavigate("menu")} className="btn-outline-gold px-3 py-2 text-xs rounded-lg flex items-center gap-2 mb-3">
          <Icon name="ArrowLeft" size={13} />Меню
        </button>

        <div className="card-dark rounded-xl p-4 min-w-[190px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{stage.emoji}</span>
            <div>
              <div className="font-cinzel text-xs tracking-wider" style={{ color: stage.color }}>{stage.name}</div>
              <div className="font-cinzel text-xs text-foreground/40">{stage.tier}</div>
            </div>
          </div>
          <div className="text-foreground/50 text-xs mb-1">Масса: <span className="font-semibold" style={{ color: stage.color }}>{mass}</span></div>
          <div className="progress-bar mt-1.5">
            <div className="progress-fill" style={{ width: `${Math.min(massProgress, 100)}%`, background: `linear-gradient(90deg, ${stage.color}88, ${stage.color})` }} />
          </div>
          {nextStage && <div className="text-foreground/30 text-xs mt-1.5">→ {nextStage.emoji} {nextStage.name}</div>}
        </div>

        <div className="card-dark rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-cinzel text-xs text-sky-400">⚡ Энергия</span>
            <span className="font-cinzel text-xs text-foreground/50">{energy}%</span>
          </div>
          <div className="progress-bar">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${energy}%`, background: "linear-gradient(90deg, #2563eb, #60a5fa)" }} />
          </div>
        </div>

        <div className="card-dark rounded-xl px-4 py-2 flex items-center gap-2">
          <Icon name="Star" size={13} className="text-gold-400 opacity-70" />
          <span className="font-cinzel text-xs text-foreground/40">Счёт </span>
          <span className="font-cinzel text-sm text-gold-400">{score}</span>
        </div>
      </div>

      {/* Leaderboard — top right */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <div className="card-dark rounded-xl px-4 py-2 flex items-center gap-2 justify-end">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-cinzel text-xs text-emerald-400 tracking-wider">{onlineCount} онлайн</span>
        </div>

        <div className="card-dark rounded-xl p-4 min-w-[185px]">
          <div className="font-cinzel text-xs text-gold-400 tracking-wider mb-3 flex items-center gap-2">
            <Icon name="Trophy" size={12} />Лидеры
          </div>
          {leaderboard.slice(0, 6).map((p, i) => (
            <div
              key={p.name + i}
              className={`flex items-center justify-between py-1 ${p.isMe ? "" : "text-foreground/55"}`}
              style={p.isMe ? { color: stage.color } : {}}
            >
              <span className="font-cinzel text-xs">
                {i === 0 ? "👑 " : `${i + 1}. `}{p.name}
              </span>
              <span className="font-cinzel text-xs">{p.mass}</span>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="font-cinzel text-xs text-foreground/30">Загрузка...</div>
          )}
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="card-dark rounded-full px-5 py-2 flex gap-5 items-center">
          <span className="font-cinzel text-xs text-foreground/30">🖱️ движение</span>
          <span className="text-foreground/20">·</span>
          <span className="font-cinzel text-xs text-foreground/30">ЛКМ ускорение</span>
        </div>
      </div>

      {/* Death overlay */}
      {!alive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="card-dark rounded-2xl p-10 text-center max-w-sm animate-scale-in">
            <div className="text-5xl mb-4">💀</div>
            <h2 className="font-cinzel-deco text-2xl mb-2" style={{ color: "#ef4444" }}>Ты погиб</h2>
            <p className="font-crimson text-foreground/60 mb-1">Счёт: <span className="text-gold-400 font-semibold">{score}</span></p>
            <p className="font-crimson text-foreground/60 mb-6">Масса: <span className="text-gold-400 font-semibold">{mass}</span></p>
            <div className="flex gap-3">
              <button onClick={onRestart} className="btn-gold flex-1 py-3 rounded-xl text-sm">Заново</button>
              <button onClick={() => onNavigate("menu")} className="btn-outline-gold flex-1 py-3 rounded-xl text-sm">Меню</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
