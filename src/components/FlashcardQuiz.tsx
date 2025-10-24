import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScienceQuestionGenerator, SocialQuestionGenerator, type Question } from "@/lib/questionGenerators";

interface FlashcardQuizProps {
  subject: 'science' | 'social';
  level: number;
  playerName: string;
  onScore: (points: number) => void;
  onGameEnd: () => void;
}

export function FlashcardQuiz({ subject, level, playerName, onScore, onGameEnd }: FlashcardQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    const generateQuestions = async () => {
      try {
        let questions: Question[];
        if (subject === 'science') {
          questions = await ScienceQuestionGenerator.generate(level, 15);
        } else {
          questions = await SocialQuestionGenerator.generate(level, 15);
        }
        setQuestions(questions);
      } catch (error) {
        console.error('Failed to generate questions:', error);
        // Fallback to static questions
        const fallbackQuestions = subject === 'science' 
          ? ScienceQuestionGenerator.getFallbackQuestions(level, 15)
          : SocialQuestionGenerator.getFallbackQuestions(level, 15);
        setQuestions(fallbackQuestions);
      }
    };

    generateQuestions();
  }, [subject, level]);

  useEffect(() => {
    if (!isPaused && !answered && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered) {
      handleTimeout();
    }
  }, [timeLeft, answered, isPaused]);

  const handleTimeout = () => {
    setAnswered(true);
    setCorrectAnswer(currentQuestion.correctAnswer);
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleAnswer = (answer: string) => {
    if (answered) return;

    setAnswered(true);
    setSelectedAnswer(answer);
    setCorrectAnswer(currentQuestion.correctAnswer);

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      const points = 10;
      setScore(prev => prev + points);
      onScore(points);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(15);
      setAnswered(false);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
    } else {
      onGameEnd();
    }
  };

  const skipQuestion = () => {
    if (score > 0) {
      setScore(prev => Math.max(0, prev - 5));
    }
    nextQuestion();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  const getButtonVariant = (option: string) => {
    if (!answered) return "outline";
    
    if (option === correctAnswer) return "default";
    if (option === selectedAnswer && option !== correctAnswer) return "destructive";
    return "ghost";
  };

  const subjectEmoji = subject === 'science' ? '🔬' : '🌍';
  const subjectName = subject === 'science' ? 'Science' : 'Social Studies';

  return (
    <div className="min-h-screen bg-gradient-hero p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-gradient-card shadow-glow border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            {subjectEmoji} {subjectName} Quiz
          </CardTitle>
          
          <div className="flex justify-between items-center text-sm">
            <span>Player: {playerName}</span>
            <span>Question {currentQuestionIndex + 1} / {totalQuestions}</span>
            <span className="text-game-correct font-bold">Score: {score}</span>
          </div>
          
          <Progress value={progress} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            {currentQuestion.imagePrompt && (
              <div className="bg-card/50 rounded-lg p-4 text-muted-foreground text-sm">
                💡 Imagine: {currentQuestion.imagePrompt}
              </div>
            )}
            
            <h3 className="text-xl font-semibold text-card-foreground">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={getButtonVariant(option)}
                size="lg"
                onClick={() => handleAnswer(option)}
                disabled={answered || isPaused}
                className="h-12 text-left justify-start transition-all duration-300"
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className={timeLeft <= 5 ? "text-game-wrong font-bold" : "text-muted-foreground"}>
                ⏰ Time: {timeLeft}s
              </span>
              {isPaused && (
                <span className="text-accent font-bold">⏸️ PAUSED</span>
              )}
            </div>
            
            {answered && selectedAnswer === correctAnswer && (
              <span className="text-game-correct font-bold animate-bounce">
                ✅ Correct! +10 points
              </span>
            )}
            
            {answered && selectedAnswer !== correctAnswer && (
              <span className="text-game-wrong font-bold">
                ❌ Wrong! Correct: {correctAnswer}
              </span>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={togglePause}
              className="gap-2"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </Button>
            
            <Button
              variant="outline"
              onClick={skipQuestion}
              disabled={answered || isPaused}
              className="gap-2"
            >
              ⏭️ Skip (-5 pts)
            </Button>
            
            <Button
              variant="destructive"
              onClick={onGameEnd}
              className="gap-2"
            >
              🏁 End Quiz
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground bg-card/30 p-3 rounded-lg">
            <p>💡 <strong>Tip:</strong> Answer quickly for bonus points! Wrong answers show the correct answer.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}