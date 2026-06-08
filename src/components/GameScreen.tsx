import { useEffect, useRef, useState, useCallback } from "react";
import { Screen } from "@/pages/Index";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/bf3287fb-baee-4c52-b914-2c1ef800ee19";

interface RemotePlayer {
  id: string; name: string;
  x: number; y: number;
  mass: number; stage: number;
  emoji: string; color: string;
}

interface Props {
  onNavigate: (s: Screen) => void;
}

interface Creature {
  x: number; y: number; vx: number; vy: number;
  size: number; emoji: string; color: string;
  mass: number; id: number; wobble: number;
}

const EVOLUTION_STAGES = [
  { name: "Муха",     emoji: "🦟", minMass: 0,    tier: "Земля",  color: "#6ee7b7", glow: "rgba(110,231,183,0.6)" },
  { name: "Жук",      emoji: "🪲", minMass: 50,   tier: "Земля",  color: "#86efac", glow: "rgba(134,239,172,0.6)" },
  { name: "Ящерица",  emoji: "🦎", minMass: 150,  tier: "Земля",  color: "#4ade80", glow: "rgba(74,222,128,0.6)"  },
  { name: "Стрекоза", emoji: "🪁", minMass: 300,  tier: "Воздух", color: "#93c5fd", glow: "rgba(147,197,253,0.6)" },
  { name: "Ястреб",   emoji: "🦅", minMass: 600,  tier: "Воздух", color: "#60a5fa", glow: "rgba(96,165,250,0.7)"  },
  { name: "Дракон",   emoji: "🐉", minMass: 1200, tier: "Высь",   color: "#fbbf24", glow: "rgba(251,191,36,0.8)"  },
];

const FOOD_ITEMS = [
  { emoji: "🌿", color: "#4ade80" }, { emoji: "🍄", color: "#fb923c" },
  { emoji: "🫐", color: "#818cf8" }, { emoji: "🌸", color: "#f9a8d4" },
  { emoji: "🍃", color: "#6ee7b7" }, { emoji: "✨", color: "#fde68a" },
  { emoji: "🌺", color: "#f87171" }, { emoji: "🍀", color: "#34d399" },
];

const ENEMY_DATA = [
  { emoji: "🦟", stage: 0 }, { emoji: "🪲", stage: 1 },
  { emoji: "🦎", stage: 2 }, { emoji: "🪁", stage: 3 },
  { emoji: "🦅", stage: 4 },
];

const RB = (a: number, b: number) => a + Math.random() * (b - a);

// ─── MAP GENERATION ────────────────────────────────────────────────
const WORLD = 3200;
const TILE = 80;

// Pre-generate static map decorations
function generateMap() {
  const trees: { x: number; y: number; r: number; type: number }[] = [];
  const rocks: { x: number; y: number; r: number }[] = [];
  const flowers: { x: number; y: number; emoji: string }[] = [];
  const lakes: { x: number; y: number; rx: number; ry: number }[] = [];
  const fireflies: { x: number; y: number; phase: number }[] = [];

  // Lakes / ponds
  for (let i = 0; i < 8; i++) {
    lakes.push({
      x: RB(200, WORLD - 200),
      y: RB(200, WORLD - 200),
      rx: RB(80, 220),
      ry: RB(50, 140),
    });
  }

  // Trees
  for (let i = 0; i < 180; i++) {
    trees.push({
      x: RB(30, WORLD - 30),
      y: RB(30, WORLD - 30),
      r: RB(12, 28),
      type: Math.floor(Math.random() * 4),
    });
  }

  // Rocks
  for (let i = 0; i < 80; i++) {
    rocks.push({
      x: RB(20, WORLD - 20),
      y: RB(20, WORLD - 20),
      r: RB(8, 22),
    });
  }

  // Ground flowers
  for (let i = 0; i < 120; i++) {
    const fi = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
    flowers.push({ x: RB(10, WORLD - 10), y: RB(10, WORLD - 10), emoji: fi.emoji });
  }

  // Fireflies
  for (let i = 0; i < 60; i++) {
    fireflies.push({ x: RB(10, WORLD - 10), y: RB(10, WORLD - 10), phase: Math.random() * Math.PI * 2 });
  }

  return { trees, rocks, flowers, lakes, fireflies };
}

const MAP = generateMap();

// ─── DRAW HELPERS ──────────────────────────────────────────────────
function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, type: number, tick: number) {
  const sway = Math.sin(tick * 0.018 + x * 0.01) * 1.5;
  ctx.save();
  ctx.translate(x, y);

  // Trunk
  const trunkW = r * 0.22;
  const trunkH = r * 1.1;
  const trunkGrad = ctx.createLinearGradient(-trunkW, 0, trunkW, 0);
  trunkGrad.addColorStop(0, "#3d2b1a");
  trunkGrad.addColorStop(0.5, "#6b4226");
  trunkGrad.addColorStop(1, "#3d2b1a");
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.roundRect(-trunkW / 2, -trunkH * 0.2, trunkW, trunkH, [2]);
  ctx.fill();

  ctx.translate(sway, 0);

  // Canopy layers
  const colors = [
    ["#14532d", "#15803d", "#16a34a"],  // deep forest
    ["#1a4a1a", "#1f6b1f", "#25872a"],  // pine
    ["#374a1c", "#4a6322", "#5a7a2a"],  // autumn-ish
    ["#0f3a2a", "#145a40", "#1a7a50"],  // tropical
  ][type % 4];

  for (let layer = 2; layer >= 0; layer--) {
    const lr = r * (1 + layer * 0.25);
    const ly = -trunkH * 0.5 - layer * r * 0.3;
    const g = ctx.createRadialGradient(0, ly - lr * 0.2, lr * 0.1, 0, ly, lr);
    g.addColorStop(0, colors[2]);
    g.addColorStop(0.6, colors[1]);
    g.addColorStop(1, colors[0]);
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.ellipse(0, ly, lr * 0.85, lr, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight blob
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.beginPath();
    ctx.ellipse(-lr * 0.2, ly - lr * 0.25, lr * 0.3, lr * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
  g.addColorStop(0, "#64748b");
  g.addColorStop(0.5, "#475569");
  g.addColorStop(1, "#1e293b");
  ctx.fillStyle = g;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.65, Math.PI * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.2, y - r * 0.2, r * 0.35, r * 0.2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawLake(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, tick: number) {
  // Water body
  const g = ctx.createRadialGradient(x, y - ry * 0.2, ry * 0.1, x, y, Math.max(rx, ry));
  g.addColorStop(0, "rgba(56,189,248,0.55)");
  g.addColorStop(0.5, "rgba(14,165,233,0.45)");
  g.addColorStop(1, "rgba(7,89,133,0.35)");
  ctx.fillStyle = g;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ripples
  ctx.strokeStyle = "rgba(186,230,253,0.3)";
  ctx.lineWidth = 1;
  for (let r = 0; r < 3; r++) {
    const rphase = (tick * 0.015 + r * 0.8) % 1;
    const rRx = rx * 0.2 + rx * 0.7 * rphase;
    const rRy = ry * 0.15 + ry * 0.5 * rphase;
    ctx.globalAlpha = 0.3 * (1 - rphase);
    ctx.beginPath();
    ctx.ellipse(x, y, rRx, rRy, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Shore highlight
  ctx.strokeStyle = "rgba(186,230,253,0.5)";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(x - rx * 0.1, y - ry * 0.15, rx * 0.9, ry * 0.8, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function drawGround(ctx: CanvasRenderingContext2D, camX: number, camY: number, W: number, H: number) {
  // Base terrain gradient
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0,   "#071a0b");
  g.addColorStop(0.3, "#0b2211");
  g.addColorStop(0.6, "#0d2a14");
  g.addColorStop(1,   "#091505");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Subtle grass patches
  const patchSeed = Math.floor(camX / 200) + Math.floor(camY / 200) * 100;
  for (let px = -1; px <= Math.ceil(W / 200) + 1; px++) {
    for (let py = -1; py <= Math.ceil(H / 200) + 1; py++) {
      const wx = (Math.floor(camX / 200) + px) * 200;
      const wy = (Math.floor(camY / 200) + py) * 200;
      const sx = wx - camX;
      const sy = wy - camY;
      // deterministic "random" per patch
      const h = Math.sin(wx * 0.031 + wy * 0.047 + patchSeed) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(${10 + h * 20},${30 + h * 40},${12 + h * 20},0.4)`;
      ctx.beginPath();
      ctx.ellipse(sx + 100, sy + 100, 90 + h * 30, 70 + h * 20, h * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawAtmosphere(ctx: CanvasRenderingContext2D, W: number, H: number, stageIdx: number, tick: number) {
  // Fog at top
  const fogG = ctx.createLinearGradient(0, 0, 0, H * 0.35);
  fogG.addColorStop(0, "rgba(200,230,210,0.06)");
  fogG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fogG;
  ctx.fillRect(0, 0, W, H);

  // Vignette
  const vigG = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
  vigG.addColorStop(0, "rgba(0,0,0,0)");
  vigG.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vigG;
  ctx.fillRect(0, 0, W, H);

  // Drifting light shafts
  if (stageIdx <= 2) {
    for (let i = 0; i < 3; i++) {
      const shx = W * (0.2 + i * 0.3) + Math.sin(tick * 0.006 + i) * 30;
      const shG = ctx.createLinearGradient(shx - 40, 0, shx + 40, H * 0.6);
      shG.addColorStop(0, "rgba(180,255,150,0.04)");
      shG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shG;
      ctx.beginPath();
      ctx.moveTo(shx - 30, 0);
      ctx.lineTo(shx + 30, 0);
      ctx.lineTo(shx + 80, H * 0.6);
      ctx.lineTo(shx - 80, H * 0.6);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawFirefly(ctx: CanvasRenderingContext2D, x: number, y: number, phase: number, tick: number) {
  const alpha = (Math.sin(tick * 0.05 + phase) + 1) / 2;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
  glow.addColorStop(0, `rgba(253,230,100,${alpha * 0.9})`);
  glow.addColorStop(0.5, `rgba(250,204,21,${alpha * 0.4})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255,240,100,${alpha})`;
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function GameScreen({ onNavigate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    player: { x: WORLD / 2, y: WORLD / 2, vx: 0, vy: 0, size: 18, mass: 0, stageIdx: 0, angle: 0 },
    food: [] as { x: number; y: number; emoji: string; color: string; r: number; bob: number }[],
    enemies: [] as Creature[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; r: number }[],
    remotePlayers: [] as RemotePlayer[],
    mouseX: 400,
    mouseY: 300,
    camX: 0,
    camY: 0,
    energy: 100,
    boost: false,
    score: 0,
    alive: true,
    tick: 0,
    playerId: null as string | null,
    onlineCount: 1,
  });

  const [ui, setUi] = useState({
    mass: 0, stageIdx: 0, energy: 100, score: 0, alive: true,
    onlineCount: 1,
    leaderboard: [] as { name: string; mass: number; isMe?: boolean }[],
  });

  const animRef = useRef<number>();

  // ── Multiplayer: join & sync ──────────────────────────────────────
  const joinGame = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/join`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.player_id) stateRef.current.playerId = parsed.player_id;
    } catch (e) { console.warn("join error", e); }
  }, []);

  const syncPlayers = useCallback(async () => {
    const s = stateRef.current;
    if (!s.playerId) return;
    try {
      const res = await fetch(`${API_URL}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: s.playerId, x: s.player.x, y: s.player.y, mass: s.player.mass, stage: s.player.stageIdx }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.players) {
        s.remotePlayers = (parsed.players as RemotePlayer[]).filter(p => p.id !== s.playerId);
        s.onlineCount = parsed.players.length;
      }
    } catch (e) { console.warn("sync error", e); }
  }, []);

  useEffect(() => {
    joinGame();
    const syncInterval = setInterval(syncPlayers, 2000);
    return () => clearInterval(syncInterval);
  }, [joinGame, syncPlayers]);

  useEffect(() => {
    const s = stateRef.current;

    // Spawn food
    for (let i = 0; i < 100; i++) {
      const fi = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
      s.food.push({ x: RB(30, WORLD - 30), y: RB(30, WORLD - 30), emoji: fi.emoji, color: fi.color, r: 10 + Math.random() * 9, bob: Math.random() * Math.PI * 2 });
    }

    // Spawn enemies
    for (let i = 0; i < 30; i++) {
      const stIdx = Math.floor(Math.random() * 4);
      const ed = ENEMY_DATA[Math.floor(Math.random() * ENEMY_DATA.length)];
      s.enemies.push({
        id: i, x: RB(80, WORLD - 80), y: RB(80, WORLD - 80),
        vx: RB(-1, 1), vy: RB(-1, 1),
        size: 14 + stIdx * 6,
        mass: EVOLUTION_STAGES[stIdx].minMass + Math.random() * 80,
        emoji: ed.emoji, color: EVOLUTION_STAGES[stIdx].color, wobble: Math.random() * Math.PI * 2,
      });
    }

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const loop = () => {
      if (!s.alive) return;
      s.tick++;
      const T = s.tick;
      const W = canvas.width;
      const H = canvas.height;

      // ── PLAYER PHYSICS ──
      const dx = s.mouseX + s.camX - s.player.x;
      const dy = s.mouseY + s.camY - s.player.y;
      const dist = Math.hypot(dx, dy);
      const speed = s.boost && s.energy > 0 ? 4.5 : 2.2;
      if (dist > 5) {
        s.player.vx += (dx / dist) * 0.45;
        s.player.vy += (dy / dist) * 0.45;
        s.player.angle = Math.atan2(dy, dx);
      }
      s.player.vx *= 0.84;
      s.player.vy *= 0.84;
      const spd = Math.hypot(s.player.vx, s.player.vy);
      if (spd > speed) { s.player.vx = (s.player.vx / spd) * speed; s.player.vy = (s.player.vy / spd) * speed; }
      s.player.x = Math.max(s.player.size, Math.min(WORLD - s.player.size, s.player.x + s.player.vx));
      s.player.y = Math.max(s.player.size, Math.min(WORLD - s.player.size, s.player.y + s.player.vy));

      // Energy & hunger
      if (s.boost && s.energy > 0) s.energy = Math.max(0, s.energy - 0.55);
      else s.energy = Math.min(100, s.energy + 0.18);
      if (T % 100 === 0) s.player.mass = Math.max(0, s.player.mass - 2);

      // Boost trail particles
      if (s.boost && s.energy > 0 && T % 2 === 0) {
        const stage = EVOLUTION_STAGES[s.player.stageIdx];
        s.particles.push({ x: s.player.x, y: s.player.y, vx: RB(-1, 1), vy: RB(-1, 1), life: 1, color: stage.color, r: RB(3, 7) });
      }

      // Update particles
      s.particles = s.particles.filter((p) => { p.x += p.vx; p.y += p.vy; p.life -= 0.04; p.r *= 0.96; return p.life > 0; });

      // Enemies
      s.enemies.forEach((e) => {
        e.wobble += 0.05;
        e.vx += RB(-0.18, 0.18);
        e.vy += RB(-0.18, 0.18);
        e.vx = Math.max(-1.6, Math.min(1.6, e.vx));
        e.vy = Math.max(-1.6, Math.min(1.6, e.vy));
        e.x = Math.max(e.size, Math.min(WORLD - e.size, e.x + e.vx));
        e.y = Math.max(e.size, Math.min(WORLD - e.size, e.y + e.vy));
      });

      // Eat food
      s.food = s.food.filter((f) => {
        const d = Math.hypot(f.x - s.player.x, f.y - s.player.y);
        if (d < s.player.size + f.r) {
          s.player.mass += 8; s.score += 5;
          for (let p = 0; p < 5; p++) s.particles.push({ x: f.x, y: f.y, vx: RB(-2, 2), vy: RB(-2, 2), life: 1, color: f.color, r: RB(2, 5) });
          return false;
        }
        return true;
      });
      while (s.food.length < 80) {
        const fi = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
        s.food.push({ x: RB(30, WORLD - 30), y: RB(30, WORLD - 30), emoji: fi.emoji, color: fi.color, r: 10 + Math.random() * 7, bob: Math.random() * Math.PI * 2 });
      }

      // Eat enemies / die
      s.enemies = s.enemies.filter((e) => {
        const d = Math.hypot(e.x - s.player.x, e.y - s.player.y);
        if (d < s.player.size + e.size - 10) {
          if (s.player.mass > e.mass * 0.8) {
            s.player.mass += e.mass * 0.35; s.score += Math.floor(e.mass / 5);
            for (let p = 0; p < 8; p++) s.particles.push({ x: e.x, y: e.y, vx: RB(-3, 3), vy: RB(-3, 3), life: 1, color: e.color, r: RB(3, 8) });
            return false;
          } else if (e.mass > s.player.mass * 1.4) { s.alive = false; }
        }
        return true;
      });
      while (s.enemies.length < 25) {
        const stIdx = Math.floor(Math.random() * 4);
        const ed = ENEMY_DATA[Math.floor(Math.random() * ENEMY_DATA.length)];
        s.enemies.push({ id: Date.now() + Math.random(), x: RB(60, WORLD - 60), y: RB(60, WORLD - 60), vx: RB(-1, 1), vy: RB(-1, 1), size: 14 + stIdx * 6, mass: EVOLUTION_STAGES[stIdx].minMass + Math.random() * 80, emoji: ed.emoji, color: EVOLUTION_STAGES[stIdx].color, wobble: 0 });
      }

      // Evolution
      let stageIdx = 0;
      for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) { if (s.player.mass >= EVOLUTION_STAGES[i].minMass) { stageIdx = i; break; } }
      s.player.stageIdx = stageIdx;
      s.player.size = 18 + stageIdx * 9;

      // Camera
      s.camX = s.player.x - W / 2;
      s.camY = s.player.y - H / 2;

      // ═══════════════════════════════════════════
      //  D R A W
      // ═══════════════════════════════════════════
      ctx.clearRect(0, 0, W, H);
      ctx.save();

      // Ground / terrain
      drawGround(ctx, s.camX, s.camY, W, H);

      // Lakes
      MAP.lakes.forEach((l) => {
        const sx = l.x - s.camX, sy = l.y - s.camY;
        if (sx < -l.rx - 20 || sx > W + l.rx + 20 || sy < -l.ry - 20 || sy > H + l.ry + 20) return;
        drawLake(ctx, sx, sy, l.rx, l.ry, T);
      });

      // Rocks (behind trees)
      MAP.rocks.forEach((r) => {
        const sx = r.x - s.camX, sy = r.y - s.camY;
        if (sx < -r.r - 5 || sx > W + r.r + 5 || sy < -r.r - 5 || sy > H + r.r + 5) return;
        drawRock(ctx, sx, sy, r.r);
      });

      // Ground flowers / decorative items
      ctx.globalAlpha = 0.55;
      ctx.font = "13px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      MAP.flowers.forEach((f) => {
        const sx = f.x - s.camX, sy = f.y - s.camY;
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return;
        ctx.fillText(f.emoji, sx, sy);
      });
      ctx.globalAlpha = 1;

      // Trees (sorted by Y for depth)
      const visibleTrees = MAP.trees.filter((t) => {
        const sx = t.x - s.camX, sy = t.y - s.camY;
        return sx > -t.r * 2 && sx < W + t.r * 2 && sy > -t.r * 3 && sy < H + t.r * 2;
      }).sort((a, b) => a.y - b.y);
      visibleTrees.forEach((t) => { drawTree(ctx, t.x - s.camX, t.y - s.camY, t.r, t.type, T); });

      // Fireflies (only near ground / forest)
      if (stageIdx <= 2) {
        MAP.fireflies.forEach((ff) => {
          const sx = ff.x - s.camX, sy = ff.y - s.camY;
          if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return;
          drawFirefly(ctx, sx, sy, ff.phase, T);
        });
      }

      // Food particles (bobbing)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      s.food.forEach((f) => {
        const sx = f.x - s.camX;
        const sy = f.y - s.camY + Math.sin(T * 0.04 + f.bob) * 2.5;
        if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) return;

        // Glow
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, f.r * 2);
        glow.addColorStop(0, f.color + "44");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(sx, sy, f.r * 2, 0, Math.PI * 2); ctx.fill();

        ctx.globalAlpha = 0.92;
        ctx.font = `${f.r * 1.5}px serif`;
        ctx.fillText(f.emoji, sx, sy);
        ctx.globalAlpha = 1;
      });

      // Particles (boost trail / eat effects)
      s.particles.forEach((p) => {
        const sx = p.x - s.camX, sy = p.y - s.camY;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, p.r);
        g.addColorStop(0, p.color + "cc");
        g.addColorStop(1, p.color + "00");
        ctx.fillStyle = g;
        ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(sx, sy, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Enemies
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      s.enemies.forEach((e) => {
        const sx = e.x - s.camX;
        const sy = e.y - s.camY + Math.sin(e.wobble) * 1.5;
        if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) return;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.ellipse(sx, sy + e.size * 0.9, e.size * 0.7, e.size * 0.2, 0, 0, Math.PI * 2); ctx.fill();

        // Glow
        const stage = EVOLUTION_STAGES.find(st => st.color === e.color);
        if (stage) {
          ctx.shadowColor = stage.glow;
          ctx.shadowBlur = 10;
        }

        ctx.globalAlpha = 0.9;
        ctx.font = `${e.size * 1.8}px serif`;
        ctx.fillText(e.emoji, sx, sy);
        ctx.shadowBlur = 0;

        // Mass label
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = e.color;
        ctx.font = "bold 9px 'Cinzel', serif";
        ctx.fillText(`${Math.floor(e.mass)}`, sx, sy + e.size + 10);
        ctx.globalAlpha = 1;
      });

      // Remote players (other users online)
      s.remotePlayers.forEach((rp) => {
        const sx = rp.x - s.camX;
        const sy = rp.y - s.camY;
        if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) return;
        const rSize = 18 + rp.stage * 9;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.ellipse(sx, sy + rSize * 0.85, rSize * 0.7, rSize * 0.2, 0, 0, Math.PI * 2); ctx.fill();

        // Glow (purple to distinguish from bots)
        ctx.shadowColor = "rgba(167,139,250,0.7)";
        ctx.shadowBlur = 14;
        ctx.globalAlpha = 0.92;
        ctx.font = `${rSize * 2}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(rp.emoji, sx, sy);
        ctx.shadowBlur = 0;

        // Name tag
        ctx.font = "bold 10px 'Cinzel', serif";
        ctx.fillStyle = "#c4b5fd";
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 3;
        ctx.fillText(rp.name, sx, sy - rSize - 12);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = rp.color;
        ctx.font = "9px 'Cinzel', serif";
        ctx.fillText(`${Math.floor(rp.mass)}`, sx, sy + rSize + 12);
        ctx.globalAlpha = 1;
      });

      // Player
      const pStage = EVOLUTION_STAGES[stageIdx];
      const px = s.player.x - s.camX;
      const py = s.player.y - s.camY;

      // Player shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.ellipse(px, py + s.player.size * 0.85, s.player.size * 0.75, s.player.size * 0.22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // Outer glow ring
      ctx.shadowColor = pStage.glow;
      ctx.shadowBlur = s.boost && s.energy > 0 ? 35 : 18;

      // Player emoji
      ctx.font = `${s.player.size * 2.1}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 1;
      ctx.fillText(pStage.emoji, px, py);
      ctx.shadowBlur = 0;

      // Player name
      ctx.font = "bold 11px 'Cinzel', serif";
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText("ТЫ", px, py - s.player.size - 12);

      // Player mass under
      ctx.fillStyle = pStage.color;
      ctx.font = "bold 10px 'Cinzel', serif";
      ctx.fillText(`${Math.floor(s.player.mass)}`, px, py + s.player.size + 14);
      ctx.shadowBlur = 0;

      // Atmosphere / post-processing
      drawAtmosphere(ctx, W, H, stageIdx, T);

      ctx.restore();

      // Update UI
      if (T % 5 === 0) {
        const myMass = Math.floor(s.player.mass);
        const remoteLb = s.remotePlayers.map(rp => ({ name: rp.name, mass: Math.floor(rp.mass), isMe: false }));
        const allLb = [{ name: "ты", mass: myMass, isMe: true }, ...remoteLb]
          .sort((a, b) => b.mass - a.mass)
          .slice(0, 6);
        setUi((prev) => ({
          ...prev,
          mass: myMass,
          stageIdx,
          energy: Math.floor(s.energy),
          score: s.score,
          alive: s.alive,
          onlineCount: s.onlineCount,
          leaderboard: allLb,
        }));
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current!);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      stateRef.current.mouseX = e.clientX - r.left;
      stateRef.current.mouseY = e.clientY - r.top;
    };
    const onDown = () => { stateRef.current.boost = true; };
    const onUp   = () => { stateRef.current.boost = false; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mouseup",   onUp);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mouseup",   onUp);
    };
  }, []);

  const stage = EVOLUTION_STAGES[ui.stageIdx];
  const nextStage = EVOLUTION_STAGES[ui.stageIdx + 1];
  const massProgress = nextStage
    ? ((ui.mass - stage.minMass) / (nextStage.minMass - stage.minMass)) * 100
    : 100;

  const handleRestart = () => {
    const s = stateRef.current;
    s.player = { x: WORLD / 2, y: WORLD / 2, vx: 0, vy: 0, size: 18, mass: 0, stageIdx: 0, angle: 0 };
    s.energy = 100; s.score = 0; s.alive = true; s.tick = 0;
    s.particles = [];
    setUi(prev => ({ ...prev, mass: 0, stageIdx: 0, energy: 100, score: 0, alive: true }));
    animRef.current = requestAnimationFrame(() => {});
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="block cursor-none"
      />

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
          <div className="text-foreground/50 text-xs mb-1">Масса: <span className="font-semibold" style={{ color: stage.color }}>{ui.mass}</span></div>
          <div className="progress-bar mt-1.5">
            <div className="progress-fill" style={{ width: `${Math.min(massProgress, 100)}%`, background: `linear-gradient(90deg, ${stage.color}88, ${stage.color})` }} />
          </div>
          {nextStage && <div className="text-foreground/30 text-xs mt-1.5">→ {nextStage.emoji} {nextStage.name}</div>}
        </div>

        <div className="card-dark rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-cinzel text-xs text-sky-400">⚡ Энергия</span>
            <span className="font-cinzel text-xs text-foreground/50">{ui.energy}%</span>
          </div>
          <div className="progress-bar">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${ui.energy}%`, background: "linear-gradient(90deg, #2563eb, #60a5fa)" }} />
          </div>
        </div>

        <div className="card-dark rounded-xl px-4 py-2 flex items-center gap-2">
          <Icon name="Star" size={13} className="text-gold-400 opacity-70" />
          <span className="font-cinzel text-xs text-foreground/40">Счёт </span>
          <span className="font-cinzel text-sm text-gold-400">{ui.score}</span>
        </div>
      </div>

      {/* Leaderboard — top right */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        {/* Online indicator */}
        <div className="card-dark rounded-xl px-4 py-2 flex items-center gap-2 justify-end">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-cinzel text-xs text-emerald-400 tracking-wider">{ui.onlineCount} онлайн</span>
        </div>

        <div className="card-dark rounded-xl p-4 min-w-[185px]">
          <div className="font-cinzel text-xs text-gold-400 tracking-wider mb-3 flex items-center gap-2">
            <Icon name="Trophy" size={12} />Лидеры
          </div>
          {ui.leaderboard.slice(0, 6).map((p, i) => (
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
          {ui.leaderboard.length === 0 && (
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
      {!ui.alive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="card-dark rounded-2xl p-10 text-center max-w-sm animate-scale-in">
            <div className="text-5xl mb-4">💀</div>
            <h2 className="font-cinzel-deco text-2xl mb-2" style={{ color: "#ef4444" }}>Ты погиб</h2>
            <p className="font-crimson text-foreground/60 mb-1">Счёт: <span className="text-gold-400 font-semibold">{ui.score}</span></p>
            <p className="font-crimson text-foreground/60 mb-6">Масса: <span className="text-gold-400 font-semibold">{ui.mass}</span></p>
            <div className="flex gap-3">
              <button onClick={handleRestart} className="btn-gold flex-1 py-3 rounded-xl text-sm">Заново</button>
              <button onClick={() => onNavigate("menu")} className="btn-outline-gold flex-1 py-3 rounded-xl text-sm">Меню</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}