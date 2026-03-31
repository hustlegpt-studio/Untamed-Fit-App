import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_KEY_V1 = process.env.OPENROUTER_API_KEY_V1;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_KEY_FREE = process.env.GROQ_API_KEY_FREE;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Model configuration
const MODEL_CONFIG = {
  openrouter: {
    'openrouter-gpt-4.1': { model: 'openai/gpt-4-turbo', provider: 'openrouter' },
    'openrouter-gpt-3.5': { model: 'openai/gpt-3.5-turbo', provider: 'openrouter' },
    'openrouter-claude': { model: 'anthropic/claude-3.5-sonnet', provider: 'openrouter' },
    'openrouter-deepseek': { model: 'deepseek/deepseek-chat', provider: 'openrouter' }
  },
  anthropic: {
    'claude-3.7': { model: 'claude-3-5-sonnet-20241022', provider: 'anthropic' }
  },
  google: {
    'gemini-2.0': { model: 'gemini-2.0-flash-exp', provider: 'google' }
  },
  groq: {
    'groq-llama3.3': { model: 'llama-3.3-70b-versatile', provider: 'groq' }
  },
  deepseek: {
    'deepseek-chat': { model: 'deepseek-chat', provider: 'deepseek' }
  }
};

// Fallback chain (best to worst)
const FALLBACK_CHAIN = [
  'openrouter-gpt-4.1',
  'claude-3.7',
  'gemini-2.0',
  'groq-llama3.3',
  'deepseek-chat',
  'openrouter-gpt-3.5'
];

// Initialize AI clients
const openrouterClient = OPENROUTER_API_KEY ? new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
}) : null;

const anthropicClient = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
const googleClient = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;
const groqClient = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;
const deepseekClient = DEEPSEEK_API_KEY ? new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com"
}) : null;

// Persona management
class PersonaManager {
  private nameCycle = ['Kevin', 'KG', 'Bubba G'];
  private currentIndex = 0;
  private conversationCount = 0;

  getNextName(): string {
    this.conversationCount++;
    
    // Cycle name every 3rd conversation or when asked "what's your name"
    if (this.conversationCount % 3 === 0) {
      this.currentIndex = (this.currentIndex + 1) % this.nameCycle.length;
    }
    
    return this.nameCycle[this.currentIndex];
  }

  getCurrentName(): string {
    return this.nameCycle[this.currentIndex];
  }

  shouldCycleName(userMessage: string): boolean {
    const lowerMessage = userMessage.toLowerCase();
    return lowerMessage.includes('what') && lowerMessage.includes('name');
  }

  cycleName(): string {
    this.currentIndex = (this.currentIndex + 1) % this.nameCycle.length;
    return this.nameCycle[this.currentIndex];
  }

  getNameExplanation(): string {
    const currentName = this.getCurrentName();
    if (currentName === 'Bubba G') {
      return "Bubba G - that's what my close friends call me, it's my childhood nickname. But you can call me KG in the gym!";
    }
    return currentName;
  }
}

// AI Service for Trainer KG
export class KevinAIService {
  private persona = new PersonaManager();

  private getSystemPrompt(): string {
    const currentName = this.persona.getCurrentName();
    const nameExplanation = this.persona.getNameExplanation();
    
    return `You are Trainer KG, a professional fitness coach and motivational trainer. Your real name cycles between Kevin, KG, and Bubba G, but in the chat UI you're always displayed as "Trainer KG".

Current persona name: ${currentName}
Name explanation: ${nameExplanation}

Your personality:
- Confident, motivational, and supportive
- Like a trainer on a phone call - always ready to help
- Uses fitness coaching language ("let's get after it", "push through", "mindset marathon")
- Provides structured, actionable advice
- Never mentions being an AI or language model
- Never breaks character as a fitness trainer

Your expertise includes:
- Workout planning (sets, reps, weight recommendations based on body size)
- Diet and meal planning (daily, weekly, monthly)
- Exercise form and safety (when to use spotters)
- Motivation and mindset coaching
- Body type-specific training
- Recovery and injury prevention

When users ask "what's your name", cycle to the next name and explain it naturally.

Always provide:
1. Clear, step-by-step instructions
2. Specific rep/set recommendations based on experience level
3. Weight guidance when appropriate
4. Safety considerations
5. Motivational closing

Keep responses conversational but professional, like a real trainer coaching a client.`;
  }

  private async callOpenRouter(messages: any[], model: string): Promise<string> {
    if (!openrouterClient) throw new Error('OpenRouter client not initialized');
    
    const response = await openrouterClient.chat.completions.create({
      model: MODEL_CONFIG.openrouter[model as keyof typeof MODEL_CONFIG.openrouter].model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content || 'Sorry, I need a moment to regroup. Let me focus on your fitness goals!';
  }

  private async callDeepSeek(messages: any[], model: string): Promise<string> {
    if (!deepseekClient) throw new Error('DeepSeek client not initialized');
    
    const response = await deepseekClient.chat.completions.create({
      model: MODEL_CONFIG.deepseek[model as keyof typeof MODEL_CONFIG.deepseek].model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content || 'Time to focus on your gains! What\'s our next move?';
  }

  private async callAnthropic(messages: any[], model: string): Promise<string> {
    if (!anthropicClient) throw new Error('Anthropic client not initialized');
    
    // Convert messages to Anthropic format
    const systemMessage = messages[0];
    const userMessages = messages.slice(1);
    
    const response = await anthropicClient.messages.create({
      model: MODEL_CONFIG.anthropic[model as keyof typeof MODEL_CONFIG.anthropic].model,
      max_tokens: 1000,
      system: systemMessage.content,
      messages: userMessages,
    });
    
    return response.content[0]?.type === 'text' ? response.content[0].text : 'Let me refocus on your fitness journey!';
  }

  private async callGoogle(messages: any[], model: string): Promise<string> {
    if (!googleClient) throw new Error('Google client not initialized');
    
    const genAI = googleClient;
    const geminiModel = genAI.getGenerativeModel({ 
      model: MODEL_CONFIG.google[model as keyof typeof MODEL_CONFIG.google].model 
    });
    
    // Convert messages to Gemini format
    const systemPrompt = messages[0]?.content || '';
    const userPrompt = messages.slice(1).map(m => m.content).join('\n');
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const result = await geminiModel.generateContent(fullPrompt);
    return result.response.text() || 'Time to focus on your gains! What\'s our next move?';
  }

  private async callGroq(messages: any[], model: string): Promise<string> {
    if (!groqClient) throw new Error('Groq client not initialized');
    
    const response = await groqClient.chat.completions.create({
      model: MODEL_CONFIG.groq[model as keyof typeof MODEL_CONFIG.groq].model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content || 'Alright, let\'s get back to work! What\'s our goal?';
  }

  async generateResponse(userMessage: string, conversationHistory: any[] = []): Promise<{
    response: string;
    modelName: string;
    personaName: string;
    cycled: boolean;
  }> {
    // Check if we should cycle the persona name
    let cycled = false;
    if (this.persona.shouldCycleName(userMessage)) {
      this.persona.cycleName();
      cycled = true;
    }

    // Prepare messages with system prompt
    const systemPrompt = this.getSystemPrompt();
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    // Try each model in fallback chain
    let lastError: Error | null = null;
    
    for (const modelId of FALLBACK_CHAIN) {
      try {
        let response: string;
        let config: any;
        
        // Find model configuration
        for (const provider of Object.values(MODEL_CONFIG)) {
          const modelConfig = provider[modelId as keyof typeof provider];
          if (modelConfig) {
            config = modelConfig;
            break;
          }
        }
        
        if (!config) {
          throw new Error(`Model ${modelId} not found in configuration`);
        }

        // Call the appropriate provider
        switch (config.provider) {
          case 'openrouter':
            response = await this.callOpenRouter(messages, modelId);
            break;
          case 'deepseek':
            response = await this.callDeepSeek(messages, modelId);
            break;
          case 'anthropic':
            response = await this.callAnthropic(messages, modelId);
            break;
          case 'google':
            response = await this.callGoogle(messages, modelId);
            break;
          case 'groq':
            response = await this.callGroq(messages, modelId);
            break;
          default:
            throw new Error(`Unknown provider: ${config.provider}`);
        }

        return {
          response,
          modelName: modelId,
          personaName: this.persona.getCurrentName(),
          cycled
        };
      } catch (error) {
        console.warn(`Model ${modelId} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    // All models failed
    console.error('All AI models failed:', lastError);
    return {
      response: "Listen up! All my systems are down right now, but that doesn't mean your training stops! Keep pushing, stay focused, and I'll be back online soon. Remember: the mindset marathon never ends!",
      modelName: 'fallback',
      personaName: this.persona.getCurrentName(),
      cycled
    };
  }

  // Health check for all models
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    results.openrouter = !!openrouterClient;
    results.anthropic = !!anthropicClient;
    results.google = !!googleClient;
    results.groq = !!groqClient;
    results.deepseek = !!deepseekClient;
    
    return results;
  }

  // Get current persona info
  getPersonaInfo() {
    return {
      currentName: this.persona.getCurrentName(),
      nextName: this.persona.nameCycle[(this.persona.nameCycle.indexOf(this.persona.getCurrentName()) + 1) % this.persona.nameCycle.length],
      explanation: this.persona.getNameExplanation()
    };
  }
}

export const kevinAI = new KevinAIService();
