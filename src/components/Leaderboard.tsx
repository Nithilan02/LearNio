import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardEntry {
  name: string;
  score: number;
  date: number;
  subject?: string;
  level?: number;
}

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('learnio_leaderboard');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEntries(parsed.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score));
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        setEntries([]);
      }
    }
  }, []);

  const clearLeaderboard = () => {
    localStorage.removeItem('learnio_leaderboard');
    setEntries([]);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getSubjectEmoji = (subject?: string) => {
    switch (subject) {
      case 'math': return '🧮';
      case 'science': return '🔬';
      case 'social': return '🌍';
      default: return '🎯';
    }
  };

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-gradient-card shadow-glow border-0">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Hall of Fame
          </CardTitle>
          <p className="text-muted-foreground">
            Top performers in LearNio challenges
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-lg text-muted-foreground">No scores recorded yet!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete a game to see your score here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.slice(0, 10).map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-lg hover:bg-card/70 transition-all duration-300"
                >
                  <div className="text-2xl">
                    {getRankEmoji(index)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{entry.name}</span>
                      {entry.subject && (
                        <span className="text-sm">
                          {getSubjectEmoji(entry.subject)}
                        </span>
                      )}
                      {entry.level !== undefined && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          Level {entry.level + 1}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(entry.date)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {entry.score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      points
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-center pt-4">
            <Button
              variant="hero"
              onClick={onClose}
              className="flex-1"
            >
              🎮 Back to Game
            </Button>
            
            {entries.length > 0 && (
              <Button
                variant="outline"
                onClick={clearLeaderboard}
              >
                🗑️ Clear All
              </Button>
            )}
          </div>

          {entries.length > 0 && (
            <div className="text-center text-xs text-muted-foreground bg-card/30 p-3 rounded-lg">
              <p>🌟 Keep playing to improve your ranking!</p>
              <p>Scores are saved locally on your device.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function saveScore(name: string, score: number, subject: string, level: number) {
  const entry: LeaderboardEntry = {
    name,
    score,
    date: Date.now(),
    subject,
    level
  };

  const saved = localStorage.getItem('learnio_leaderboard');
  let entries: LeaderboardEntry[] = [];
  
  if (saved) {
    try {
      entries = JSON.parse(saved);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }

  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);
  entries = entries.slice(0, 50); // Keep top 50

  localStorage.setItem('learnio_leaderboard', JSON.stringify(entries));
}