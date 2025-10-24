import { useState } from "react";
import { GameContainer } from "@/components/GameContainer";
import { GeminiSetup } from "@/components/GeminiSetup";

const Index = () => {
  const [geminiConfigured, setGeminiConfigured] = useState(false);

  if (!geminiConfigured) {
    return <GeminiSetup onApiKeySet={() => setGeminiConfigured(true)} />;
  }

  return <GameContainer />;
};

export default Index;
