import { Button } from "@/components/ui/button";

interface LearNioHeaderProps {
  currentPlayer?: string;
  avatar?: string;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
}

const avatarEmojis = {
  student: '👩‍🎓',
  scientist: '🔬', 
  explorer: '🧭'
};

export function LearNioHeader({ currentPlayer, avatar, onToggleDarkMode, isDarkMode }: LearNioHeaderProps) {
  return (
    <header className="flex items-center justify-between w-full max-w-6xl mx-auto mb-8 p-6 bg-gradient-card rounded-2xl shadow-card backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="text-6xl">🎓</div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            LearNio
          </h1>
          <p className="text-muted-foreground font-medium">
            Learn & Play — Interactive Education Platform
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {currentPlayer && (
          <div className="text-right">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span>Player: {currentPlayer}</span>
              {avatar && (
                <span className="text-2xl">
                  {avatarEmojis[avatar as keyof typeof avatarEmojis] || '👤'}
                </span>
              )}
            </div>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleDarkMode}
          className="gap-2"
        >
          {isDarkMode ? '☀️' : '🌙'}
          {isDarkMode ? 'Light' : 'Dark'}
        </Button>
      </div>
    </header>
  );
}