import { useState } from "react";
import MainMenu from "@/components/MainMenu";
import GameScreen from "@/components/GameScreen";
import ProfilePage from "@/components/ProfilePage";
import ShopPage from "@/components/ShopPage";
import GuidePage from "@/components/GuidePage";
import CoopMissions from "@/components/CoopMissions";

export type Screen = "menu" | "game" | "profile" | "shop" | "guide" | "coop";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("menu");

  const navigate = (s: Screen) => setScreen(s);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {screen === "menu" && <MainMenu onNavigate={navigate} />}
      {screen === "game" && <GameScreen onNavigate={navigate} />}
      {screen === "profile" && <ProfilePage onNavigate={navigate} />}
      {screen === "shop" && <ShopPage onNavigate={navigate} />}
      {screen === "guide" && <GuidePage onNavigate={navigate} />}
      {screen === "coop" && <CoopMissions onNavigate={navigate} />}
    </div>
  );
}
