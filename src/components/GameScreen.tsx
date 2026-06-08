import { useEffect, useRef, useState, useCallback } from "react";
import { Screen } from "@/pages/Index";
import {
  API_URL, WORLD, RB,
  EVOLUTION_STAGES, FOOD_ITEMS, ENEMY_DATA,
  RemotePlayer, Creature, Particle, FoodItem,
} from "./game/gameTypes";
import {
  MAP,
  drawGround, drawLake, drawRock, drawTree,
  drawFirefly, drawAtmosphere,
} from "./game/gameMapDraw";
import GameHUD from "./game/GameHUD";

interface Props {
  onNavigate: (s: Screen) => void;
}

export default function GameScreen({ onNavigate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    player: { x: WORLD / 2, y: WORLD / 2, vx: 0, vy: 0, size: 18, mass: 0, stageIdx: 0, angle: 0 },
    food: [] as FoodItem[],
    enemies: [] as Creature[],
    particles: [] as Particle[],
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

  // ── Game loop ─────────────────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;

    for (let i = 0; i < 100; i++) {
      const fi = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
      s.food.push({ x: RB(30, WORLD - 30), y: RB(30, WORLD - 30), emoji: fi.emoji, color: fi.color, r: 10 + Math.random() * 9, bob: Math.random() * Math.PI * 2 });
    }

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

      drawGround(ctx, s.camX, s.camY, W, H);

      MAP.lakes.forEach((l) => {
        const sx = l.x - s.camX, sy = l.y - s.camY;
        if (sx < -l.rx - 20 || sx > W + l.rx + 20 || sy < -l.ry - 20 || sy > H + l.ry + 20) return;
        drawLake(ctx, sx, sy, l.rx, l.ry, T);
      });

      MAP.rocks.forEach((r) => {
        const sx = r.x - s.camX, sy = r.y - s.camY;
        if (sx < -r.r - 5 || sx > W + r.r + 5 || sy < -r.r - 5 || sy > H + r.r + 5) return;
        drawRock(ctx, sx, sy, r.r);
      });

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

      const visibleTrees = MAP.trees.filter((t) => {
        const sx = t.x - s.camX, sy = t.y - s.camY;
        return sx > -t.r * 2 && sx < W + t.r * 2 && sy > -t.r * 3 && sy < H + t.r * 2;
      }).sort((a, b) => a.y - b.y);
      visibleTrees.forEach((t) => { drawTree(ctx, t.x - s.camX, t.y - s.camY, t.r, t.type, T); });

      if (stageIdx <= 2) {
        MAP.fireflies.forEach((ff) => {
          const sx = ff.x - s.camX, sy = ff.y - s.camY;
          if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return;
          drawFirefly(ctx, sx, sy, ff.phase, T);
        });
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      s.food.forEach((f) => {
        const sx = f.x - s.camX;
        const sy = f.y - s.camY + Math.sin(T * 0.04 + f.bob) * 2.5;
        if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) return;

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

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      s.enemies.forEach((e) => {
        const sx = e.x - s.camX;
        const sy = e.y - s.camY + Math.sin(e.wobble) * 1.5;
        if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) return;

        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.ellipse(sx, sy + e.size * 0.9, e.size * 0.7, e.size * 0.2, 0, 0, Math.PI * 2); ctx.fill();

        const stage = EVOLUTION_STAGES.find(st => st.color === e.color);
        if (stage) { ctx.shadowColor = stage.glow; ctx.shadowBlur = 10; }

        ctx.globalAlpha = 0.9;
        ctx.font = `${e.size * 1.8}px serif`;
        ctx.fillText(e.emoji, sx, sy);
        ctx.shadowBlur = 0;

        ctx.globalAlpha = 0.55;
        ctx.fillStyle = e.color;
        ctx.font = "bold 9px 'Cinzel', serif";
        ctx.fillText(`${Math.floor(e.mass)}`, sx, sy + e.size + 10);
        ctx.globalAlpha = 1;
      });

      s.remotePlayers.forEach((rp) => {
        const sx = rp.x - s.camX;
        const sy = rp.y - s.camY;
        if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) return;
        const rSize = 18 + rp.stage * 9;

        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.ellipse(sx, sy + rSize * 0.85, rSize * 0.7, rSize * 0.2, 0, 0, Math.PI * 2); ctx.fill();

        ctx.shadowColor = "rgba(167,139,250,0.7)";
        ctx.shadowBlur = 14;
        ctx.globalAlpha = 0.92;
        ctx.font = `${rSize * 2}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(rp.emoji, sx, sy);
        ctx.shadowBlur = 0;

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

      const pStage = EVOLUTION_STAGES[stageIdx];
      const px = s.player.x - s.camX;
      const py = s.player.y - s.camY;

      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.ellipse(px, py + s.player.size * 0.85, s.player.size * 0.75, s.player.size * 0.22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      ctx.shadowColor = pStage.glow;
      ctx.shadowBlur = s.boost && s.energy > 0 ? 35 : 18;

      ctx.font = `${s.player.size * 2.1}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 1;
      ctx.fillText(pStage.emoji, px, py);
      ctx.shadowBlur = 0;

      ctx.font = "bold 11px 'Cinzel', serif";
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText("ТЫ", px, py - s.player.size - 12);

      ctx.fillStyle = pStage.color;
      ctx.font = "bold 10px 'Cinzel', serif";
      ctx.fillText(`${Math.floor(s.player.mass)}`, px, py + s.player.size + 14);
      ctx.shadowBlur = 0;

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

  // ── Mouse controls ────────────────────────────────────────────────
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
      <GameHUD
        onNavigate={onNavigate}
        onRestart={handleRestart}
        mass={ui.mass}
        stageIdx={ui.stageIdx}
        energy={ui.energy}
        score={ui.score}
        alive={ui.alive}
        onlineCount={ui.onlineCount}
        leaderboard={ui.leaderboard}
      />
    </div>
  );
}
