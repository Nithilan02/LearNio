import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MathQuestionGenerator, type MathQuestion } from "@/lib/questionGenerators";

interface Position {
  x: number;
  y: number;
}

interface FoodOption {
  position: Position;
  value: string;
}

interface MathSnakeGameProps {
  level: number;
  playerName: string;
  onScore: (points: number) => void;
  onGameEnd: () => void;
}

const GRID_SIZE = 20;
const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 420;

export function MathSnakeGame({ level, playerName, onScore, onGameEnd }: MathSnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 300, y: 200 }]);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [foodOptions, setFoodOptions] = useState<FoodOption[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const generateQuestion = useCallback(() => {
    const questions = MathQuestionGenerator.generate(level, 1);
    const question = questions[0];
    setCurrentQuestion(question);

    // Generate food positions
    const newFoodOptions: FoodOption[] = question.options.map(option => ({
      position: {
        x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE,
        y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE
      },
      value: option
    }));

    setFoodOptions(newFoodOptions);
  }, [level]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw snake
    ctx.fillStyle = '#4ade80';
    snake.forEach(segment => {
      ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    });

    // Draw food options
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    foodOptions.forEach(food => {
      // Food circle
      ctx.beginPath();
      ctx.fillStyle = '#f97316';
      ctx.arc(food.position.x + GRID_SIZE/2, food.position.y + GRID_SIZE/2, GRID_SIZE/2 - 2, 0, Math.PI * 2);
      ctx.fill();

      // Food text
      ctx.fillStyle = 'white';
      ctx.fillText(food.value, food.position.x + GRID_SIZE/2, food.position.y + GRID_SIZE/2 + 5);
    });

    // Draw question
    if (currentQuestion) {
      ctx.fillStyle = 'white';
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(currentQuestion.question, 10, 25);
    }

    // Draw score
    ctx.fillStyle = '#4ade80';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, CANVAS_WIDTH - 10, 25);
  }, [snake, foodOptions, currentQuestion, score]);

  const checkCollision = useCallback((head: Position) => {
    return foodOptions.find(food => 
      head.x === food.position.x && head.y === food.position.y
    );
  }, [foodOptions]);

  const moveSnake = useCallback(() => {
    if (!isRunning || isPaused) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      switch (direction) {
        case 'UP':
          head.y -= GRID_SIZE;
          break;
        case 'DOWN':
          head.y += GRID_SIZE;
          break;
        case 'LEFT':
          head.x -= GRID_SIZE;
          break;
        case 'RIGHT':
          head.x += GRID_SIZE;
          break;
      }

      // Wrap around screen
      if (head.x < 0) head.x = CANVAS_WIDTH - GRID_SIZE;
      if (head.x >= CANVAS_WIDTH) head.x = 0;
      if (head.y < 0) head.y = CANVAS_HEIGHT - GRID_SIZE;
      if (head.y >= CANVAS_HEIGHT) head.y = 0;

      // Check food collision
      const collidedFood = checkCollision(head);
      if (collidedFood && currentQuestion) {
        const isCorrect = collidedFood.value === currentQuestion.answer;
        
        if (isCorrect) {
          const points = 10;
          setScore(prev => prev + points);
          onScore(points);
          
          // Grow snake slightly
          newSnake.push({ ...newSnake[newSnake.length - 1] });
        }

        setQuestionsAnswered(prev => prev + 1);
        generateQuestion();
      }

      newSnake.unshift(head);
      if (!collidedFood || collidedFood.value !== currentQuestion?.answer) {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, isRunning, isPaused, checkCollision, currentQuestion, onScore, generateQuestion]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isRunning || isPaused) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
        break;
      case ' ':
        e.preventDefault();
        setIsPaused(prev => !prev);
        break;
    }
  }, [isRunning, isPaused]);

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameSpeed = Math.max(100, 200 - level * 20);
    const gameLoop = setInterval(() => {
      moveSnake();
    }, gameSpeed);

    return () => clearInterval(gameLoop);
  }, [moveSnake, level]);

  useEffect(() => {
    drawGame();
  }, [drawGame]);

  useEffect(() => {
    if (questionsAnswered >= 15) {
      setIsRunning(false);
      setTimeout(() => {
        onGameEnd();
      }, 2000);
    }
  }, [questionsAnswered, onGameEnd]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <Card className="bg-gradient-card shadow-glow border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            🐍 Math Snake Adventure
          </CardTitle>
          <p className="text-muted-foreground">
            Guide the snake to eat the correct answer! Use arrow keys to move.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span>Player: {playerName}</span>
            <span>Questions: {questionsAnswered}/15</span>
            <span className="text-game-correct">Score: {score}</span>
          </div>
          
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-primary rounded-lg shadow-card bg-game-bg"
          />
          
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={handlePause}
              className="gap-2"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onGameEnd}
              className="gap-2"
            >
              🏁 End Game
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground bg-card/30 p-3 rounded-lg">
            <p>🎮 <strong>Controls:</strong> Arrow keys to move, Space to pause</p>
            <p>🎯 <strong>Goal:</strong> Eat the food with the correct answer!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}