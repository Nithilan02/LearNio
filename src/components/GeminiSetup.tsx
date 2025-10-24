import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Key, Sparkles } from "lucide-react";
import { setGeminiApiKey } from "@/lib/geminiService";
import { toast } from "sonner";

interface GeminiSetupProps {
  onApiKeySet: () => void;
}

export function GeminiSetup({ onApiKeySet }: GeminiSetupProps) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Gemini API key");
      return;
    }

    setLoading(true);
    try {
      setGeminiApiKey(apiKey.trim());
      toast.success("Gemini AI connected successfully!");
      onApiKeySet();
    } catch (error) {
      toast.error("Failed to initialize Gemini AI");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-gradient-card shadow-glow border-0">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <Key className="h-6 w-6 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Connect Gemini AI
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Get personalized, AI-generated questions with images
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-accent mb-1">Get your free API key:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
                  <li>Sign in with your Google account</li>
                  <li>Click "Create API key"</li>
                  <li>Copy and paste it below</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-card-foreground mb-2">
                Gemini API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Gemini API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-card/50"
              />
            </div>

            <Button 
              onClick={handleSetApiKey}
              disabled={loading || !apiKey.trim()}
              className="w-full gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Connecting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Connect Gemini AI
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onApiKeySet}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip and use default questions
            </Button>
          </div>

          <div className="bg-card/30 p-3 rounded-lg text-xs text-muted-foreground">
            <p><strong>🔒 Privacy:</strong> Your API key is stored locally and only used to generate educational content.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}