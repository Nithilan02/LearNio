import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface GameSettings {
  playerName: string;
  avatar: string;
  playerCount: number;
  subject: string;
  level: number;
}

interface GameSetupProps {
  onStartGame: (settings: GameSettings) => void;
  onShowLeaderboard: () => void;
}

export function GameSetup({ onStartGame, onShowLeaderboard }: GameSetupProps) {
  const [settings, setSettings] = useState<GameSettings>({
    playerName: '',
    avatar: 'student',
    playerCount: 1,
    subject: 'math',
    level: 0
  });

  const handleStartGame = () => {
    onStartGame({
      ...settings,
      playerName: settings.playerName || 'Hero'
    });
  };

  const handleQuickMath = () => {
    onStartGame({
      ...settings,
      playerName: settings.playerName || 'Hero',
      subject: 'math',
      level: 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-gradient-card shadow-glow border-0 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl">🎮</div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Setup Your Adventure
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-sm font-semibold">Hero Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your hero name"
              value={settings.playerName}
              onChange={(e) => setSettings(prev => ({ ...prev, playerName: e.target.value }))}
              className="bg-card/50 backdrop-blur-sm border-border/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Avatar</Label>
              <Select value={settings.avatar} onValueChange={(value) => setSettings(prev => ({ ...prev, avatar: value }))}>
                <SelectTrigger className="bg-card/50 backdrop-blur-sm border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">👩‍🎓 Student</SelectItem>
                  <SelectItem value="scientist">🔬 Scientist</SelectItem>
                  <SelectItem value="explorer">🧭 Explorer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Players</Label>
              <Select value={settings.playerCount.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, playerCount: parseInt(value) }))}>
                <SelectTrigger className="bg-card/50 backdrop-blur-sm border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Single Player</SelectItem>
                  <SelectItem value="2">Two Players</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Subject</Label>
            <Select value={settings.subject} onValueChange={(value) => setSettings(prev => ({ ...prev, subject: value }))}>
              <SelectTrigger className="bg-card/50 backdrop-blur-sm border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="math">🧮 Math (Snake Game)</SelectItem>
                <SelectItem value="science">🔬 Science (Flashcards)</SelectItem>
                <SelectItem value="social">🌍 Social Studies (Flashcards)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Difficulty Level</Label>
            <Select value={settings.level.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, level: parseInt(value) }))}>
              <SelectTrigger className="bg-card/50 backdrop-blur-sm border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">🌱 Beginner (LKG)</SelectItem>
                <SelectItem value="1">📚 Class 1</SelectItem>
                <SelectItem value="2">📖 Class 2</SelectItem>
                <SelectItem value="3">📝 Class 3</SelectItem>
                <SelectItem value="4">🎯 Class 4</SelectItem>
                <SelectItem value="5">🏆 Class 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={handleStartGame}
              className="w-full"
            >
              🎮 Start Adventure
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="game" 
                onClick={handleQuickMath}
                className="w-full"
              >
                ⚡ Quick Math
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={onShowLeaderboard}
                className="w-full"
              >
                🏆 Leaderboard
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-4 p-3 bg-card/30 rounded-lg backdrop-blur-sm">
            💡 <strong>Tip:</strong> Multiplayer mode alternates turns between players for each question!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}