import { useState } from "react";
import { GameSetup, type GameSettings } from "./GameSetup";
import { MathSnakeGame } from "./MathSnakeGame";
import { FlashcardQuiz } from "./FlashcardQuiz";
import { Leaderboard, saveScore } from "./Leaderboard";
import { LearNioHeader } from "./LearNioHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GameState = 'setup' | 'playing' | 'leaderboard' | 'gameOver';

interface Player {
  name: string;
  avatar: string;
  score: number;
  lives: number;
}

export function GameContainer() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleStartGame = (settings: GameSettings) => {
    setGameSettings(settings);
    
    // Initialize players
    const newPlayers: Player[] = [];
    if (settings.playerCount === 1) {
      newPlayers.push({
        name: settings.playerName,
        avatar: settings.avatar,
        score: 0,
        lives: 3
      });
    } else {
      newPlayers.push(
        {
          name: settings.playerName,
          avatar: settings.avatar,
          score: 0,
          lives: 3
        },
        {
          name: 'Player 2',
          avatar: 'explorer',
          score: 0,
          lives: 3
        }
      );
    }
    
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setGameState('playing');
  };

  const handleScore = (points: number) => {
    setPlayers(prev => 
      prev.map((player, index) => 
        index === currentPlayerIndex
          ? { ...player, score: player.score + points }
          : player
      )
    );
  };

  const handleGameEnd = () => {
    if (gameSettings && players.length > 0) {
      const currentPlayer = players[currentPlayerIndex];
      saveScore(
        currentPlayer.name,
        currentPlayer.score,
        gameSettings.subject,
        gameSettings.level
      );
    }
    setGameState('gameOver');
  };

  const handleShowLeaderboard = () => {
    setGameState('leaderboard');
  };

  const handleBackToMenu = () => {
    setGameState('setup');
    setGameSettings(null);
    setPlayers([]);
    setCurrentPlayerIndex(0);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {gameState !== 'setup' && (
        <LearNioHeader
          currentPlayer={currentPlayer?.name}
          avatar={currentPlayer?.avatar}
          onToggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
        />
      )}

      {gameState === 'setup' && (
        <GameSetup
          onStartGame={handleStartGame}
          onShowLeaderboard={handleShowLeaderboard}
        />
      )}

      {gameState === 'playing' && gameSettings && currentPlayer && (
        <>
          {gameSettings.subject === 'math' ? (
            <MathSnakeGame
              level={gameSettings.level}
              playerName={currentPlayer.name}
              onScore={handleScore}
              onGameEnd={handleGameEnd}
            />
          ) : (
            <FlashcardQuiz
              subject={gameSettings.subject as 'science' | 'social'}
              level={gameSettings.level}
              playerName={currentPlayer.name}
              onScore={handleScore}
              onGameEnd={handleGameEnd}
            />
          )}
        </>
      )}

      {gameState === 'leaderboard' && (
        <Leaderboard onClose={handleBackToMenu} />
      )}

      {gameState === 'gameOver' && gameSettings && currentPlayer && (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
          <Card className="w-full max-w-md bg-gradient-card shadow-glow border-0 text-center">
            <CardHeader>
              <div className="text-6xl mb-4">🎉</div>
              <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Game Complete!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {currentPlayer.name}
                </p>
                <p className="text-3xl font-bold text-primary">
                  {currentPlayer.score} Points
                </p>
                <p className="text-muted-foreground">
                  Subject: {gameSettings.subject.charAt(0).toUpperCase() + gameSettings.subject.slice(1)}
                </p>
                <p className="text-muted-foreground">
                  Level: {gameSettings.level + 1}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="hero"
                  onClick={handleBackToMenu}
                  className="w-full"
                >
                  🎮 Play Again
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleShowLeaderboard}
                  className="w-full"
                >
                  🏆 View Leaderboard
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground bg-card/30 p-3 rounded-lg">
                <p>🌟 Great job! Your score has been saved to the leaderboard.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}