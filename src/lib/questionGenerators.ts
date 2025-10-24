import { getGeminiService, type GeneratedQuestion } from './geminiService';

// Question Generation System for LearNio
export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: number;
  imagePrompt?: string;
}

export interface MathQuestion {
  question: string;
  answer: string;
  options: string[];
  difficulty: number;
}

// Math Question Generator
export class MathQuestionGenerator {
  static generate(level: number, count: number = 15): MathQuestion[] {
    const questions: MathQuestion[] = [];
    const difficulty = Math.max(1, level);
    
    for (let i = 0; i < count; i++) {
      const questionType = Math.floor(Math.random() * 4); // 0: add, 1: subtract, 2: multiply, 3: divide
      let question: MathQuestion;
      
      switch (questionType) {
        case 0:
          question = this.generateAddition(difficulty);
          break;
        case 1:
          question = this.generateSubtraction(difficulty);
          break;
        case 2:
          question = this.generateMultiplication(difficulty);
          break;
        case 3:
          question = this.generateDivision(difficulty);
          break;
        default:
          question = this.generateAddition(difficulty);
      }
      
      questions.push(question);
    }
    
    return questions;
  }
  
  private static generateAddition(difficulty: number): MathQuestion {
    const max = Math.pow(10, difficulty);
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const answer = a + b;
    
    return {
      question: `${a} + ${b} = ?`,
      answer: answer.toString(),
      options: this.generateOptions(answer, 4),
      difficulty
    };
  }
  
  private static generateSubtraction(difficulty: number): MathQuestion {
    const max = Math.pow(10, difficulty);
    let a = Math.floor(Math.random() * max) + 1;
    let b = Math.floor(Math.random() * max) + 1;
    
    // Ensure positive result
    if (a < b) [a, b] = [b, a];
    const answer = a - b;
    
    return {
      question: `${a} - ${b} = ?`,
      answer: answer.toString(),
      options: this.generateOptions(answer, 4),
      difficulty
    };
  }
  
  private static generateMultiplication(difficulty: number): MathQuestion {
    const max = Math.min(12, difficulty + 2);
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const answer = a * b;
    
    return {
      question: `${a} × ${b} = ?`,
      answer: answer.toString(),
      options: this.generateOptions(answer, 4),
      difficulty
    };
  }
  
  private static generateDivision(difficulty: number): MathQuestion {
    const max = Math.min(12, difficulty + 2);
    const b = Math.floor(Math.random() * max) + 1;
    const answer = Math.floor(Math.random() * max) + 1;
    const a = b * answer;
    
    return {
      question: `${a} ÷ ${b} = ?`,
      answer: answer.toString(),
      options: this.generateOptions(answer, 4),
      difficulty
    };
  }
  
  private static generateOptions(correct: number, count: number): string[] {
    const options = [correct.toString()];
    const used = new Set([correct]);
    
    while (options.length < count) {
      let option: number;
      const variation = Math.max(1, Math.floor(correct * 0.5));
      
      if (Math.random() < 0.5) {
        option = correct + Math.floor(Math.random() * variation) + 1;
      } else {
        option = Math.max(0, correct - Math.floor(Math.random() * variation) - 1);
      }
      
      if (!used.has(option)) {
        used.add(option);
        options.push(option.toString());
      }
    }
    
    return this.shuffle(options);
  }
  
  private static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Science Question Generator
export class ScienceQuestionGenerator {
  static async generate(level: number, count: number = 15): Promise<Question[]> {
    try {
      const geminiService = getGeminiService();
      const questions = await geminiService.generateQuestions({
        subject: 'science',
        level,
        count
      });
      return questions;
    } catch (error) {
      console.error('Failed to generate science questions:', error);
      // Fallback to template-based questions if Gemini fails
      return this.getFallbackQuestions(level, count);
    }
  }

  static getFallbackQuestions(level: number, count: number = 15): Question[] {
    const templates = this.getTemplates(level);
    const questions: Question[] = [];
    
    for (let i = 0; i < count; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      questions.push(this.generateFromTemplate(template, level));
    }
    
    return questions;
  }
  
  private static getTemplates(level: number) {
    const baseTemplates = [
      {
        type: 'animals',
        questions: [
          'Which animal is known as the king of the jungle?',
          'Which animal gives us milk?',
          'Which animal can fly?',
          'Which animal lives in water?',
          'Which animal has stripes?',
        ],
        optionSets: [
          ['Lion', 'Tiger', 'Elephant', 'Monkey'],
          ['Cow', 'Dog', 'Cat', 'Horse'],
          ['Bird', 'Fish', 'Snake', 'Rabbit'],
          ['Fish', 'Lion', 'Dog', 'Cat'],
          ['Zebra', 'Horse', 'Cow', 'Sheep'],
        ]
      },
      {
        type: 'plants',
        questions: [
          'What do plants need to grow?',
          'Which part of the plant makes food?',
          'What color are most leaves?',
          'What do plants produce that we breathe?',
          'Where do plants get energy from?',
        ],
        optionSets: [
          ['Water and sunlight', 'Only water', 'Only soil', 'Only air'],
          ['Leaves', 'Roots', 'Flowers', 'Bark'],
          ['Green', 'Red', 'Blue', 'Yellow'],
          ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
          ['The sun', 'The moon', 'The stars', 'The earth'],
        ]
      },
      {
        type: 'body',
        questions: [
          'How many bones are in an adult human body approximately?',
          'Which organ pumps blood?',
          'What do we use to see?',
          'How many fingers do we have on both hands?',
          'What protects our brain?',
        ],
        optionSets: [
          ['206', '156', '306', '106'],
          ['Heart', 'Liver', 'Stomach', 'Lungs'],
          ['Eyes', 'Nose', 'Ears', 'Mouth'],
          ['10', '8', '12', '20'],
          ['Skull', 'Ribs', 'Spine', 'Skin'],
        ]
      }
    ];
    
    if (level >= 3) {
      baseTemplates.push({
        type: 'space',
        questions: [
          'Which planet is closest to the sun?',
          'What do we call a group of stars?',
          'How long does it take Earth to orbit the sun?',
          'What is the largest planet in our solar system?',
          'What causes day and night on Earth?',
        ],
        optionSets: [
          ['Mercury', 'Venus', 'Earth', 'Mars'],
          ['Constellation', 'Galaxy', 'Meteor', 'Comet'],
          ['One year', 'One month', 'One week', 'One day'],
          ['Jupiter', 'Saturn', 'Earth', 'Mars'],
          ['Earth\'s rotation', 'Moon\'s orbit', 'Sun\'s movement', 'Star\'s light'],
        ]
      });
    }
    
    return baseTemplates;
  }
  
  private static generateFromTemplate(template: any, level: number): Question {
    const index = Math.floor(Math.random() * template.questions.length);
    const question = template.questions[index];
    const options = template.optionSets[index];
    const correctAnswer = options[0];
    
    return {
      question,
      options: this.shuffle([...options]),
      correctAnswer,
      difficulty: level,
      imagePrompt: this.generateImagePrompt(template.type, question)
    };
  }
  
  private static generateImagePrompt(type: string, question: string): string {
    const prompts: Record<string, string> = {
      animals: "Educational illustration of animals in their natural habitat, colorful and child-friendly",
      plants: "Beautiful botanical illustration showing plants and leaves, educational style",
      body: "Clean medical illustration of human anatomy, educational and appropriate for children",
      space: "Beautiful space illustration with planets and stars, educational astronomy art"
    };
    
    return prompts[type] || "Educational science illustration, colorful and engaging for students";
  }
  
  private static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Social Studies Question Generator
export class SocialQuestionGenerator {
  static async generate(level: number, count: number = 15): Promise<Question[]> {
    try {
      const geminiService = getGeminiService();
      const questions = await geminiService.generateQuestions({
        subject: 'social',
        level,
        count
      });
      return questions;
    } catch (error) {
      console.error('Failed to generate social questions:', error);
      // Fallback to template-based questions if Gemini fails
      return this.getFallbackQuestions(level, count);
    }
  }

  static getFallbackQuestions(level: number, count: number = 15): Question[] {
    const templates = this.getTemplates(level);
    const questions: Question[] = [];
    
    for (let i = 0; i < count; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      questions.push(this.generateFromTemplate(template, level));
    }
    
    return questions;
  }
  
  private static getTemplates(level: number) {
    const baseTemplates = [
      {
        type: 'geography',
        questions: [
          'What is the capital of our country?',
          'Which is the largest continent?',
          'What do we call a large body of water?',
          'Which direction does the sun rise from?',
          'What are the seven large land masses called?',
        ],
        optionSets: [
          ['New Delhi', 'Mumbai', 'Kolkata', 'Chennai'],
          ['Asia', 'Africa', 'Europe', 'Australia'],
          ['Ocean', 'Mountain', 'Desert', 'Forest'],
          ['East', 'West', 'North', 'South'],
          ['Continents', 'Countries', 'Islands', 'Planets'],
        ]
      },
      {
        type: 'culture',
        questions: [
          'What is a festival of lights?',
          'What do we call the national bird of India?',
          'Which monument is known as a symbol of love?',
          'What are the colors of the Indian flag?',
          'Who do we call the Father of the Nation?',
        ],
        optionSets: [
          ['Diwali', 'Holi', 'Eid', 'Christmas'],
          ['Peacock', 'Parrot', 'Eagle', 'Crow'],
          ['Taj Mahal', 'Red Fort', 'India Gate', 'Qutub Minar'],
          ['Saffron, White, Green', 'Red, White, Blue', 'Yellow, Red, Green', 'Blue, White, Red'],
          ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Subhash Chandra Bose', 'Sardar Patel'],
        ]
      },
      {
        type: 'community',
        questions: [
          'Who helps us when we are sick?',
          'Who teaches us in school?',
          'Who protects us from fire?',
          'Where do we go to borrow books?',
          'Who delivers our mail?',
        ],
        optionSets: [
          ['Doctor', 'Teacher', 'Police', 'Farmer'],
          ['Teacher', 'Doctor', 'Driver', 'Cook'],
          ['Firefighter', 'Police', 'Doctor', 'Teacher'],
          ['Library', 'Hospital', 'School', 'Market'],
          ['Postman', 'Teacher', 'Doctor', 'Cook'],
        ]
      }
    ];
    
    if (level >= 3) {
      baseTemplates.push({
        type: 'history',
        questions: [
          'Who was the first Prime Minister of India?',
          'In which year did India gain independence?',
          'Which freedom fighter is known for non-violence?',
          'What was the ancient name of India?',
          'Which empire built the Taj Mahal?',
        ],
        optionSets: [
          ['Jawaharlal Nehru', 'Mahatma Gandhi', 'Sardar Patel', 'Subhash Bose'],
          ['1947', '1950', '1942', '1945'],
          ['Mahatma Gandhi', 'Bhagat Singh', 'Chandrashekhar Azad', 'Rani Laxmi Bai'],
          ['Bharat', 'Hindustan', 'India', 'All of these'],
          ['Mughal', 'British', 'Mauryan', 'Gupta'],
        ]
      });
    }
    
    return baseTemplates;
  }
  
  private static generateFromTemplate(template: any, level: number): Question {
    const index = Math.floor(Math.random() * template.questions.length);
    const question = template.questions[index];
    const options = template.optionSets[index];
    const correctAnswer = options[0];
    
    return {
      question,
      options: this.shuffle([...options]),
      correctAnswer,
      difficulty: level,
      imagePrompt: this.generateImagePrompt(template.type, question)
    };
  }
  
  private static generateImagePrompt(type: string, question: string): string {
    const prompts: Record<string, string> = {
      geography: "Educational world map illustration with countries and continents, colorful and child-friendly",
      culture: "Beautiful illustration of Indian culture and traditions, educational and vibrant",
      community: "Illustration of community helpers and their roles, educational and diverse",
      history: "Historical illustration of Indian independence and freedom fighters, educational style"
    };
    
    return prompts[type] || "Educational social studies illustration, engaging and informative for students";
  }
  
  private static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}