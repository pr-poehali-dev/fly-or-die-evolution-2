export const API_URL = "https://functions.poehali.dev/bf3287fb-baee-4c52-b914-2c1ef800ee19";

export const WORLD = 3200;
export const RB = (a: number, b: number) => a + Math.random() * (b - a);

export interface RemotePlayer {
  id: string; name: string;
  x: number; y: number;
  mass: number; stage: number;
  emoji: string; color: string;
}

export interface Creature {
  x: number; y: number; vx: number; vy: number;
  size: number; emoji: string; color: string;
  mass: number; id: number; wobble: number;
}

export interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; r: number;
}

export interface FoodItem {
  x: number; y: number; emoji: string; color: string; r: number; bob: number;
}

export const EVOLUTION_STAGES = [
  { name: "Муха",     emoji: "🦟", minMass: 0,    tier: "Земля",  color: "#6ee7b7", glow: "rgba(110,231,183,0.6)" },
  { name: "Жук",      emoji: "🪲", minMass: 50,   tier: "Земля",  color: "#86efac", glow: "rgba(134,239,172,0.6)" },
  { name: "Ящерица",  emoji: "🦎", minMass: 150,  tier: "Земля",  color: "#4ade80", glow: "rgba(74,222,128,0.6)"  },
  { name: "Стрекоза", emoji: "🪁", minMass: 300,  tier: "Воздух", color: "#93c5fd", glow: "rgba(147,197,253,0.6)" },
  { name: "Ястреб",   emoji: "🦅", minMass: 600,  tier: "Воздух", color: "#60a5fa", glow: "rgba(96,165,250,0.7)"  },
  { name: "Дракон",   emoji: "🐉", minMass: 1200, tier: "Высь",   color: "#fbbf24", glow: "rgba(251,191,36,0.8)"  },
];

export const FOOD_ITEMS = [
  { emoji: "🌿", color: "#4ade80" }, { emoji: "🍄", color: "#fb923c" },
  { emoji: "🫐", color: "#818cf8" }, { emoji: "🌸", color: "#f9a8d4" },
  { emoji: "🍃", color: "#6ee7b7" }, { emoji: "✨", color: "#fde68a" },
  { emoji: "🌺", color: "#f87171" }, { emoji: "🍀", color: "#34d399" },
];

export const ENEMY_DATA = [
  { emoji: "🦟", stage: 0 }, { emoji: "🪲", stage: 1 },
  { emoji: "🦎", stage: 2 }, { emoji: "🪁", stage: 3 },
  { emoji: "🦅", stage: 4 },
];
