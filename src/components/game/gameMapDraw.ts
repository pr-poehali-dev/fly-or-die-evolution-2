import { WORLD, RB, FOOD_ITEMS } from "./gameTypes";

// ─── MAP DATA TYPES ─────────────────────────────────────────────────
export interface MapData {
  trees: { x: number; y: number; r: number; type: number }[];
  rocks: { x: number; y: number; r: number }[];
  flowers: { x: number; y: number; emoji: string }[];
  lakes: { x: number; y: number; rx: number; ry: number }[];
  fireflies: { x: number; y: number; phase: number }[];
}

// ─── MAP GENERATION ─────────────────────────────────────────────────
export function generateMap(): MapData {
  const trees: MapData["trees"] = [];
  const rocks: MapData["rocks"] = [];
  const flowers: MapData["flowers"] = [];
  const lakes: MapData["lakes"] = [];
  const fireflies: MapData["fireflies"] = [];

  for (let i = 0; i < 8; i++) {
    lakes.push({
      x: RB(200, WORLD - 200),
      y: RB(200, WORLD - 200),
      rx: RB(80, 220),
      ry: RB(50, 140),
    });
  }

  for (let i = 0; i < 180; i++) {
    trees.push({
      x: RB(30, WORLD - 30),
      y: RB(30, WORLD - 30),
      r: RB(12, 28),
      type: Math.floor(Math.random() * 4),
    });
  }

  for (let i = 0; i < 80; i++) {
    rocks.push({
      x: RB(20, WORLD - 20),
      y: RB(20, WORLD - 20),
      r: RB(8, 22),
    });
  }

  for (let i = 0; i < 120; i++) {
    const fi = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
    flowers.push({ x: RB(10, WORLD - 10), y: RB(10, WORLD - 10), emoji: fi.emoji });
  }

  for (let i = 0; i < 60; i++) {
    fireflies.push({ x: RB(10, WORLD - 10), y: RB(10, WORLD - 10), phase: Math.random() * Math.PI * 2 });
  }

  return { trees, rocks, flowers, lakes, fireflies };
}

export const MAP = generateMap();

// ─── DRAW HELPERS ───────────────────────────────────────────────────
export function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, type: number, tick: number) {
  const sway = Math.sin(tick * 0.018 + x * 0.01) * 1.5;
  ctx.save();
  ctx.translate(x, y);

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

  const colors = [
    ["#14532d", "#15803d", "#16a34a"],
    ["#1a4a1a", "#1f6b1f", "#25872a"],
    ["#374a1c", "#4a6322", "#5a7a2a"],
    ["#0f3a2a", "#145a40", "#1a7a50"],
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

    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.beginPath();
    ctx.ellipse(-lr * 0.2, ly - lr * 0.25, lr * 0.3, lr * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
  g.addColorStop(0, "#64748b");
  g.addColorStop(0.5, "#475569");
  g.addColorStop(1, "#1e293b");
  ctx.fillStyle = g;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.65, Math.PI * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.2, y - r * 0.2, r * 0.35, r * 0.2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawLake(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, tick: number) {
  const g = ctx.createRadialGradient(x, y - ry * 0.2, ry * 0.1, x, y, Math.max(rx, ry));
  g.addColorStop(0, "rgba(56,189,248,0.55)");
  g.addColorStop(0.5, "rgba(14,165,233,0.45)");
  g.addColorStop(1, "rgba(7,89,133,0.35)");
  ctx.fillStyle = g;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

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

  ctx.strokeStyle = "rgba(186,230,253,0.5)";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(x - rx * 0.1, y - ry * 0.15, rx * 0.9, ry * 0.8, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

export function drawGround(ctx: CanvasRenderingContext2D, camX: number, camY: number, W: number, H: number) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0,   "#071a0b");
  g.addColorStop(0.3, "#0b2211");
  g.addColorStop(0.6, "#0d2a14");
  g.addColorStop(1,   "#091505");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const patchSeed = Math.floor(camX / 200) + Math.floor(camY / 200) * 100;
  for (let px = -1; px <= Math.ceil(W / 200) + 1; px++) {
    for (let py = -1; py <= Math.ceil(H / 200) + 1; py++) {
      const wx = (Math.floor(camX / 200) + px) * 200;
      const wy = (Math.floor(camY / 200) + py) * 200;
      const sx = wx - camX;
      const sy = wy - camY;
      const h = Math.sin(wx * 0.031 + wy * 0.047 + patchSeed) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(${10 + h * 20},${30 + h * 40},${12 + h * 20},0.4)`;
      ctx.beginPath();
      ctx.ellipse(sx + 100, sy + 100, 90 + h * 30, 70 + h * 20, h * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawAtmosphere(ctx: CanvasRenderingContext2D, W: number, H: number, stageIdx: number, tick: number) {
  const fogG = ctx.createLinearGradient(0, 0, 0, H * 0.35);
  fogG.addColorStop(0, "rgba(200,230,210,0.06)");
  fogG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fogG;
  ctx.fillRect(0, 0, W, H);

  const vigG = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
  vigG.addColorStop(0, "rgba(0,0,0,0)");
  vigG.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vigG;
  ctx.fillRect(0, 0, W, H);

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

export function drawFirefly(ctx: CanvasRenderingContext2D, x: number, y: number, phase: number, tick: number) {
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
