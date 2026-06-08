import { useEffect, useRef, useState, useCallback } from "react";
import { Screen } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  onNavigate: (s: Screen) => void;
}

interface Creature {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  emoji: string;
  color: string;
  isPlayer?: boolean;
  mass: number;
  id: number;
}

const EVOLUTION_STAGES = [
  { name: "Муха", emoji: "🦟", minMass: 0, tier: "Земля", color: "#6ee7b7" },
  { name: "Жук", emoji: "🪲", minMass: 50, tier: "Земля", color: "#86efac" },
  { name: "Ящерица", emoji: "🦎", minMass: 150, tier: "Земля", color: "#4ade80" },
  { name: "Стрекоза", emoji: "🪁", minMass: 300, tier: "Воздух", color: "#93c5fd" },
  { name: "Ястреб", emoji: "🦅", minMass: 600, tier: "Воздух", color: "#60a5fa" },
  { name: "Дракон", emoji: "🐉", minMass: 1200, tier: "Высь", color: "#fbbf24" },
];

const FOOD_EMOJIS = ["🌿", "🍄", "🫐", "🌸", "🍃", "✨"];
const ENEMY_EMOJIS = ["🦟", "🪲", "🦎", "🪁", "🦅"];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function GameScreen({ onNavigate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    player: { x: 400, y: 300, vx: 0, vy: 0, size: 18, mass: 0, stageIdx: 0 },
    food: [] as { x: number; y: number; emoji: string; r: number }[],
    enemies: [] as Creature[],
    mouseX: 400,
    mouseY: 300,
    camX: 0,
    camY: 0,
    energy: 100,
    boost: false,
    score: 0,
    alive: true,
    tick: 0,
  });
  const [ui, setUi] = useState({
    mass: 0,
    stageIdx: 0,
    energy: 100,
    score: 0,
    alive: true,
    leaderboard: [
      { name: "DragonMaster", mass: 2840 },
      { name: "SkyPredator", mass: 1560 },
      { name: "NightHawk", mass: 980 },
      { name: "ты", mass: 0 },
    ],
  });
  const animRef = useRef<number>();
  const WORLD = 2000;

  useEffect(() => {
    const s = stateRef.current;
    s.player.x = WORLD / 2;
    s.player.y = WORLD / 2;

    for (let i = 0; i < 80; i++) {
      s.food.push({
        x: randomBetween(30, WORLD - 30),
        y: randomBetween(30, WORLD - 30),
        emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
        r: 10 + Math.random() * 8,
      });
    }

    for (let i = 0; i < 25; i++) {
      const stIdx = Math.floor(Math.random() * 4);
      s.enemies.push({
        id: i,
        x: randomBetween(50, WORLD - 50),
        y: randomBetween(50, WORLD - 50),
        vx: randomBetween(-1, 1),
        vy: randomBetween(-1, 1),
        size: 14 + stIdx * 5,
        mass: EVOLUTION_STAGES[stIdx].minMass + Math.random() * 100,
        emoji: ENEMY_EMOJIS[Math.floor(Math.random() * ENEMY_EMOJIS.length)],
        color: EVOLUTION_STAGES[stIdx].color,
      });
    }

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const loop = () => {
      if (!s.alive) return;
      s.tick++;

      const W = canvas.width;
      const H = canvas.height;

      // Move player toward mouse
      const dx = s.mouseX + s.camX - s.player.x;
      const dy = s.mouseY + s.camY - s.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = s.boost && s.energy > 0 ? 4 : 2;
      if (dist > 5) {
        s.player.vx += (dx / dist) * 0.4;
        s.player.vy += (dy / dist) * 0.4;
      }
      s.player.vx *= 0.85;
      s.player.vy *= 0.85;
      const maxSpd = speed;
      const spd = Math.sqrt(s.player.vx ** 2 + s.player.vy ** 2);
      if (spd > maxSpd) {
        s.player.vx = (s.player.vx / spd) * maxSpd;
        s.player.vy = (s.player.vy / spd) * maxSpd;
      }
      s.player.x = Math.max(s.player.size, Math.min(WORLD - s.player.size, s.player.x + s.player.vx));
      s.player.y = Math.max(s.player.size, Math.min(WORLD - s.player.size, s.player.y + s.player.vy));

      // Energy
      if (s.boost && s.energy > 0) s.energy = Math.max(0, s.energy - 0.5);
      else if (!s.boost) s.energy = Math.min(100, s.energy + 0.15);

      // Hunger
      if (s.tick % 120 === 0) s.player.mass = Math.max(0, s.player.mass - 3);

      // Move enemies
      s.enemies.forEach((e) => {
        e.vx += randomBetween(-0.2, 0.2);
        e.vy += randomBetween(-0.2, 0.2);
        e.vx = Math.max(-1.5, Math.min(1.5, e.vx));
        e.vy = Math.max(-1.5, Math.min(1.5, e.vy));
        e.x = Math.max(e.size, Math.min(WORLD - e.size, e.x + e.vx));
        e.y = Math.max(e.size, Math.min(WORLD - e.size, e.y + e.vy));
      });

      // Eat food
      s.food = s.food.filter((f) => {
        const d = Math.hypot(f.x - s.player.x, f.y - s.player.y);
        if (d < s.player.size + f.r) {
          s.player.mass += 8;
          s.score += 5;
          return false;
        }
        return true;
      });
      if (s.food.length < 60) {
        s.food.push({
          x: randomBetween(30, WORLD - 30),
          y: randomBetween(30, WORLD - 30),
          emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
          r: 10 + Math.random() * 6,
        });
      }

      // Eat enemies / die
      s.enemies = s.enemies.filter((e) => {
        const d = Math.hypot(e.x - s.player.x, e.y - s.player.y);
        if (d < s.player.size + e.size - 8) {
          if (s.player.mass > e.mass * 0.8) {
            s.player.mass += e.mass * 0.3;
            s.score += Math.floor(e.mass / 5);
            return false;
          } else if (e.mass > s.player.mass * 1.5) {
            s.alive = false;
          }
        }
        return true;
      });
      if (s.enemies.length < 20) {
        const stIdx = Math.floor(Math.random() * 4);
        s.enemies.push({
          id: Date.now(),
          x: randomBetween(50, WORLD - 50),
          y: randomBetween(50, WORLD - 50),
          vx: randomBetween(-1, 1),
          vy: randomBetween(-1, 1),
          size: 14 + stIdx * 5,
          mass: EVOLUTION_STAGES[stIdx].minMass + Math.random() * 100,
          emoji: ENEMY_EMOJIS[Math.floor(Math.random() * ENEMY_EMOJIS.length)],
          color: EVOLUTION_STAGES[stIdx].color,
        });
      }

      // Evolution
      let stageIdx = 0;
      for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
        if (s.player.mass >= EVOLUTION_STAGES[i].minMass) { stageIdx = i; break; }
      }
      s.player.stageIdx = stageIdx;
      s.player.size = 18 + stageIdx * 8;

      // Camera
      s.camX = s.player.x - W / 2;
      s.camY = s.player.y - H / 2;

      // Draw
      ctx.clearRect(0, 0, W, H);

      // Sky gradient per tier
      const tierColors = [
        ["#0a1a0a", "#0f2d14"],
        ["#050d1a", "#0a1428"],
        ["#100820", "#1a0a10"],
      ];
      const tc = tierColors[Math.min(stageIdx >= 5 ? 2 : stageIdx >= 3 ? 1 : 0, 2)];
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, tc[0]);
      grad.addColorStop(1, tc[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      const startX = -(s.camX % gridSize);
      const startY = -(s.camY % gridSize);
      for (let x = startX; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = startY; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Food
      ctx.font = "18px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      s.food.forEach((f) => {
        const sx = f.x - s.camX;
        const sy = f.y - s.camY;
        if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) return;
        ctx.globalAlpha = 0.9;
        ctx.font = `${f.r * 1.4}px serif`;
        ctx.fillText(f.emoji, sx, sy);
      });

      // Enemies
      s.enemies.forEach((e) => {
        const sx = e.x - s.camX;
        const sy = e.y - s.camY;
        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) return;
        ctx.globalAlpha = 0.85;
        ctx.font = `${e.size * 1.6}px serif`;
        ctx.fillText(e.emoji, sx, sy);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = e.color;
        ctx.font = "10px Cinzel, serif";
        ctx.fillText(`${Math.floor(e.mass)}`, sx, sy + e.size + 8);
      });

      // Player
      ctx.globalAlpha = 1;
      const stage = EVOLUTION_STAGES[stageIdx];
      const px = s.player.x - s.camX;
      const py = s.player.y - s.camY;

      if (s.boost && s.energy > 0) {
        ctx.shadowColor = stage.color;
        ctx.shadowBlur = 20;
      }
      ctx.font = `${s.player.size * 2}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stage.emoji, px, py);
      ctx.shadowBlur = 0;

      // Player name + mass
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 12px Cinzel, serif";
      ctx.fillText("Ты", px, py - s.player.size - 10);
      ctx.fillStyle = stage.color;
      ctx.font = "10px Cinzel, serif";
      ctx.fillText(`${Math.floor(s.player.mass)}`, px, py + s.player.size + 14);

      ctx.globalAlpha = 1;

      // Update UI every 6 frames
      if (s.tick % 6 === 0) {
        setUi((prev) => ({
          ...prev,
          mass: Math.floor(s.player.mass),
          stageIdx: s.player.stageIdx,
          energy: Math.floor(s.energy),
          score: s.score,
          alive: s.alive,
          leaderboard: [
            { name: "DragonMaster", mass: 2840 },
            { name: "SkyPredator", mass: 1560 },
            { name: "NightHawk", mass: 980 },
            { name: "ты", mass: Math.floor(s.player.mass) },
          ].sort((a, b) => b.mass - a.mass),
        }));
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current!);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouseX = e.clientX - rect.left;
      stateRef.current.mouseY = e.clientY - rect.top;
    };
    const onMouseDown = () => { stateRef.current.boost = true; };
    const onMouseUp = () => { stateRef.current.boost = false; };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const stage = EVOLUTION_STAGES[ui.stageIdx];
  const nextStage = EVOLUTION_STAGES[ui.stageIdx + 1];
  const massProgress = nextStage
    ? ((ui.mass - stage.minMass) / (nextStage.minMass - stage.minMass)) * 100
    : 100;

  const handleRestart = () => {
    const s = stateRef.current;
    s.player = { x: WORLD / 2, y: WORLD / 2, vx: 0, vy: 0, size: 18, mass: 0, stageIdx: 0 };
    s.energy = 100;
    s.score = 0;
    s.alive = true;
    s.tick = 0;
    setUi((prev) => ({ ...prev, mass: 0, stageIdx: 0, energy: 100, score: 0, alive: true }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="block cursor-none"
      />

      {/* HUD top-left */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button
          onClick={() => onNavigate("menu")}
          className="btn-outline-gold px-3 py-2 text-xs rounded-lg flex items-center gap-2 mb-3"
        >
          <Icon name="ArrowLeft" size={13} />
          Меню
        </button>

        <div className="card-dark rounded-xl p-4 min-w-[180px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{stage.emoji}</span>
            <div>
              <div className="font-cinzel text-xs text-gold-400 tracking-wider">{stage.name}</div>
              <div className="font-cinzel text-xs text-foreground/40">{stage.tier}</div>
            </div>
          </div>
          <div className="text-foreground/60 text-xs mb-1">Масса: <span className="text-gold-300 font-semibold">{ui.mass}</span></div>
          <div className="progress-bar mt-2">
            <div className="progress-fill" style={{ width: `${Math.min(massProgress, 100)}%` }} />
          </div>
          {nextStage && (
            <div className="text-foreground/30 text-xs mt-1">→ {nextStage.emoji} {nextStage.name}</div>
          )}
        </div>

        <div className="card-dark rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-cinzel text-xs text-sky-400">⚡ Энергия</span>
            <span className="font-cinzel text-xs text-foreground/60">{ui.energy}%</span>
          </div>
          <div className="progress-bar">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${ui.energy}%`, background: "linear-gradient(90deg, #3b82f6, #60a5fa)" }} />
          </div>
        </div>

        <div className="card-dark rounded-xl px-4 py-2">
          <span className="font-cinzel text-xs text-foreground/40">Счёт </span>
          <span className="font-cinzel text-sm text-gold-400">{ui.score}</span>
        </div>
      </div>

      {/* Leaderboard top-right */}
      <div className="absolute top-4 right-4 z-10">
        <div className="card-dark rounded-xl p-4 min-w-[180px]">
          <div className="font-cinzel text-xs text-gold-400 tracking-wider mb-3 flex items-center gap-2">
            <Icon name="Trophy" size={12} />
            Лидеры
          </div>
          {ui.leaderboard.slice(0, 4).map((p, i) => (
            <div key={p.name} className={`flex items-center justify-between py-1 ${p.name === "ты" ? "text-gold-400" : "text-foreground/60"}`}>
              <span className="font-cinzel text-xs">{i + 1}. {p.name}</span>
              <span className="font-cinzel text-xs">{p.mass}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex gap-4 items-center">
          <span className="font-cinzel text-xs text-foreground/30 tracking-wider">🖱️ движение</span>
          <span className="font-cinzel text-xs text-foreground/30">•</span>
          <span className="font-cinzel text-xs text-foreground/30 tracking-wider">ЛКМ ускорение</span>
        </div>
      </div>

      {/* Death overlay */}
      {!ui.alive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="card-dark rounded-2xl p-10 text-center max-w-sm animate-scale-in">
            <div className="text-5xl mb-4">💀</div>
            <h2 className="font-cinzel-deco text-2xl text-crimson-400 mb-2">Ты погиб</h2>
            <p className="font-crimson text-foreground/60 mb-2">Счёт: <span className="text-gold-400 font-semibold">{ui.score}</span></p>
            <p className="font-crimson text-foreground/60 mb-6">Масса: <span className="text-gold-400 font-semibold">{ui.mass}</span></p>
            <div className="flex gap-3">
              <button onClick={handleRestart} className="btn-gold flex-1 py-3 rounded-xl text-sm">
                Заново
              </button>
              <button onClick={() => onNavigate("menu")} className="btn-outline-gold flex-1 py-3 rounded-xl text-sm">
                Меню
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
