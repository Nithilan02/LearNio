import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  imagePrompt?: string;
  explanation?: string;
}

export interface QuestionRequest {
  subject: 'science' | 'social';
  level: number;
  count: number;
}

export class GeminiQuestionService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initializeWithKey(apiKey);
    }
  }

  initializeWithKey(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  private getTopicsByLevel(subject: 'science' | 'social', level: number): string {
    const topics = {
      science: {
        0: "Animals (cats, dogs, birds), plants (trees, flowers), body parts (eyes, nose, hands), basic concepts (hot/cold, big/small)",
        1: "Animals (farm animals, wild animals), plants (parts of plants, what plants need), body parts (all basic parts), basic concepts (living/non-living)",
        2: "Weather (sunny, rainy, cloudy), basic ecosystems (forest, pond), simple life cycles (butterfly, plant growth)",
        3: "Weather patterns, ecosystems (desert, ocean, forest), complete life cycles, basic physics (push/pull, float/sink)",
        4: "Advanced biology (human body systems, animal habitats), basic physics (light, sound, magnetism), earth science (rocks, soil)",
        5: "Complex biology (digestive system, respiratory system), physics (forces, energy, simple machines), earth science (water cycle, solar system)"
      },
      social: {
        0: "Family (mom, dad, siblings), community helpers (doctor, teacher, police), basic social concepts (sharing, helping)",
        1: "Family relationships, community (neighborhood, school), basic social concepts (rules, friendship)",
        2: "Geography (maps, directions), transportation (car, bus, airplane), cultural awareness (festivals, traditions)",
        3: "Geography (states, countries), transportation systems, cultural diversity, basic economics (needs vs wants)",
        4: "Government (local leaders, rules and laws), world geography (continents, oceans), global awareness (different countries)",
        5: "Government systems (democracy, voting), world geography (capitals, major landmarks), global awareness (cultures, languages, international cooperation)"
      }
    };

    return topics[subject][level] || topics[subject][0];
  }

  private getLevelName(level: number): string {
    const levels = ['LKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
    return levels[level] || 'LKG';
  }

  async generateQuestions({ subject, level, count }: QuestionRequest): Promise<GeneratedQuestion[]> {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please provide an API key.');
    }

    const topics = this.getTopicsByLevel(subject, level);
    const levelName = this.getLevelName(level);
    const subjectName = subject === 'science' ? 'Science' : 'Social Studies';

    const prompt = `Generate ${count} educational ${subjectName} questions for ${levelName} students (age ${4 + level}-${6 + level}).

Topics to cover: ${topics}

Requirements:
1. Questions should be age-appropriate and engaging
2. Each question should have 4 multiple choice options (A, B, C, D)
3. Provide a brief image description that would help visualize the concept
4. Include a simple explanation for the correct answer
5. Make questions interactive and fun for young learners

Format your response as a JSON array with this structure:
[
  {
    "question": "What color is the sky on a clear day?",
    "options": ["Red", "Blue", "Green", "Yellow"],
    "correctAnswer": "Blue",
    "imagePrompt": "A clear blue sky with white fluffy clouds on a sunny day",
    "explanation": "The sky appears blue because of how sunlight interacts with our atmosphere."
  }
]

Make sure questions are varied and cover different aspects of the topics. Keep language simple and appropriate for the age group.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse Gemini response');
      }

      const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);
      
      // Validate questions
      return questions.filter(q => 
        q.question && 
        q.options && 
        q.options.length === 4 && 
        q.correctAnswer &&
        q.options.includes(q.correctAnswer)
      ).slice(0, count);

    } catch (error) {
      console.error('Error generating questions with Gemini:', error);
      throw new Error('Failed to generate questions. Please check your API key and try again.');
    }
  }
}

// Singleton instance
let geminiService: GeminiQuestionService | null = null;

export function getGeminiService(apiKey?: string): GeminiQuestionService {
  if (!geminiService || apiKey) {
    geminiService = new GeminiQuestionService(apiKey);
  }
  return geminiService;
}

export function setGeminiApiKey(apiKey: string) {
  geminiService = new GeminiQuestionService(apiKey);
}