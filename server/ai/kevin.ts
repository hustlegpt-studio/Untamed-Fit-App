import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { HfInference } from '@huggingface/inference';
import Cohere from 'cohere-ai';
import MistralClient from '@mistralai/mistralai';
import { fireworks } from '@ai-sdk/fireworks';
import { generateText } from 'ai';
import Together from 'together-ai';

// Environment variables - Using same keys as kevin-free
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_KEY_V1 = process.env.OPENROUTER_API_KEY_V1;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_KEY_FREE = process.env.GROQ_API_KEY_FREE;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const AI21_API_KEY = process.env.AI21_API_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Add debugging for API keys
console.log('🔑 Original Kevin AI - API Key Status:');
console.log('OPENROUTER_API_KEY:', OPENROUTER_API_KEY ? '✅ Present' : '❌ Missing');
console.log('GOOGLE_API_KEY:', GOOGLE_API_KEY ? '✅ Present' : '❌ Missing');
console.log('GROQ_API_KEY:', GROQ_API_KEY ? '✅ Present' : '❌ Missing');
console.log('DEEPSEEK_API_KEY:', DEEPSEEK_API_KEY ? '✅ Present' : '❌ Missing');
console.log('FIREWORKS_API_KEY:', FIREWORKS_API_KEY ? '✅ Present' : '❌ Missing');
console.log('TOGETHER_API_KEY:', TOGETHER_API_KEY ? '✅ Present' : '❌ Missing');

// Model configuration
const MODEL_CONFIG = {
  openrouter: {
    'openrouter-gpt-4.1': { model: 'openai/gpt-4-turbo', provider: 'openrouter' },
    'openrouter-gpt-3.5': { model: 'openai/gpt-3.5-turbo', provider: 'openrouter' },
    'openrouter-claude': { model: 'anthropic/claude-3.5-sonnet', provider: 'openrouter' },
    'openrouter-deepseek': { model: 'deepseek/deepseek-chat', provider: 'openrouter' },
    'openrouter-mistral': { model: 'mistralai/mistral-7b-instruct', provider: 'openrouter' },
    'openrouter-cohere': { model: 'cohere/command-r-plus', provider: 'openrouter' }
  },
  anthropic: {
    'anthropic-claude-3.7': { model: 'claude-3-5-sonnet-20241022', provider: 'anthropic' }
  },
  google: {
    'google-gemini-2.0': { model: 'gemini-2.0-flash-exp', provider: 'google' }
  },
  groq: {
    'groq-llama3.3': { model: 'llama-3.3-70b-versatile', provider: 'groq' }
  },
  deepseek: {
    'deepseek-chat': { model: 'deepseek-chat', provider: 'deepseek' }
  },
  cohere: {
    'cohere-command': { model: 'command-r-plus', provider: 'cohere' }
  },
  mistral: {
    'mistral-mixtral': { model: 'mistral-large-latest', provider: 'mistral' }
  },
  huggingface: {
    'huggingface-mixtral': { model: 'mistralai/Mixtral-8x7B-Instruct-v0.1', provider: 'huggingface' },
    'huggingface-llama': { model: 'meta-llama/Llama-2-70b-chat-hf', provider: 'huggingface' },
    'huggingface-vision': { model: 'Salesforce/blip-image-captioning-base', provider: 'huggingface' }
  },
  perplexity: {
    'perplexity-sonar': { model: 'sonar-pro', provider: 'perplexity' },
    'perplexity-sonar-reasoning': { model: 'sonar-reasoning-pro', provider: 'perplexity' }
  },
  ai21: {
    'ai21-jamba': { model: 'jamba-instruct', provider: 'ai21' }
  }
};

// Optimized fallback chain (same as kevin-free - best free models first)
const FALLBACK_CHAIN = [
  'groq-llama3.3',             // Best: Fastest, 30 req/min free
  'deepseek-chat',             // Great: Unlimited free
  'google-gemini-2.0',         // Good: 15 req/min free
  'openrouter-gpt-4.1',        // Backup: $5 free credit
  'openrouter-gpt-3.5',        // Backup: Same OpenRouter key
  'anthropic-claude-3.7',      // If Anthropic key available
  'mistral-mixtral',           // If Mistral key available
  'cohere-command',            // If Cohere key available
  'huggingface-mixtral',       // If HuggingFace key available
  'perplexity-sonar'           // If Perplexity key available
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

const cohereClient = COHERE_API_KEY ? new Cohere({ apiKey: COHERE_API_KEY }) : null;
const mistralClient = MISTRAL_API_KEY ? new MistralClient({ apiKey: MISTRAL_API_KEY }) : null;
const huggingfaceClient = HUGGINGFACE_API_KEY ? new HfInference(HUGGINGFACE_API_KEY) : null;
const perplexityClient = PERPLEXITY_API_KEY ? new OpenAI({
  apiKey: PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai"
}) : null;

// Add Fireworks and Together clients
const fireworksClient = FIREWORKS_API_KEY ? fireworks() : null;
const togetherClient = TOGETHER_API_KEY ? new Together({ apiKey: TOGETHER_API_KEY }) : null;

const ai21Client = AI21_API_KEY ? new Cohere({ 
  apiKey: AI21_API_KEY,
  baseURL: "https://api.ai21.com"
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

  private async callCohere(messages: any[], model: string): Promise<string> {
    if (!cohereClient) throw new Error('Cohere client not initialized');
    
    const response = await cohereClient.chat({
      model: MODEL_CONFIG.cohere[model as keyof typeof MODEL_CONFIG.cohere].model,
      messages: messages.slice(1).map(m => ({ role: m.role, content: m.content })),
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.text || "Time to focus on your goals! What's our next move?";
  }

  private async callMistral(messages: any[], model: string): Promise<string> {
    if (!mistralClient) throw new Error('Mistral client not initialized');
    
    const response = await mistralClient.chat.complete({
      model: MODEL_CONFIG.mistral[model as keyof typeof MODEL_CONFIG.mistral].model,
      messages: messages.slice(1).map(m => ({ role: m.role, content: m.content })),
      max_tokens: 1000,
    });
    
    return response.choices[0]?.message?.content || "Let's get to work! What are your fitness goals today?";
  }

  private async callHuggingFace(messages: any[], model: string): Promise<string> {
    if (!huggingfaceClient) throw new Error('HuggingFace client not initialized');
    
    const lastMessage = messages[messages.length - 1].content;
    const response = await huggingfaceClient.textGeneration({
      model: MODEL_CONFIG.huggingface[model as keyof typeof MODEL_CONFIG.huggingface].model,
      inputs: lastMessage,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
      }
    });
    
    return response.generated_text || "I'm here to help you reach your fitness goals!";
  }

  private async callPerplexity(messages: any[], model: string): Promise<string> {
    if (!perplexityClient) throw new Error('Perplexity client not initialized');
    
    const response = await perplexityClient.chat.completions.create({
      model: MODEL_CONFIG.perplexity[model as keyof typeof MODEL_CONFIG.perplexity].model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content || "Let's analyze your fitness journey together!";
  }

  private async callAI21(messages: any[], model: string): Promise<string> {
    if (!ai21Client) throw new Error('AI21 client not initialized');
    
    const response = await ai21Client.chat({
      model: MODEL_CONFIG.ai21[model as keyof typeof MODEL_CONFIG.ai21].model,
      messages: messages.slice(1).map(m => ({ role: m.role, content: m.content })),
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.text || "Ready to crush your fitness goals!";
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
          case 'cohere':
            response = await this.callCohere(messages, modelId);
            break;
          case 'mistral':
            response = await this.callMistral(messages, modelId);
            break;
          case 'huggingface':
            response = await this.callHuggingFace(messages, modelId);
            break;
          case 'perplexity':
            response = await this.callPerplexity(messages, modelId);
            break;
          case 'fireworks':
            response = await this.callFireworks(messages, modelId);
            break;
          case 'together':
            response = await this.callTogether(messages, modelId);
            break;
          case 'ai21':
            response = await this.callAI21(messages, modelId);
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

  private async callFireworks(messages: any[], model: string): Promise<string> {
    if (!fireworksClient) throw new Error('Fireworks client not initialized');
    
    const lastMessage = messages[messages.length - 1].content;
    const response = await generateText({
      model: fireworksClient(MODEL_CONFIG.fireworks[model as keyof typeof MODEL_CONFIG.fireworks].model),
      prompt: lastMessage,
      maxTokens: 1000,
      temperature: 0.7,
    });
    
    return response.text || "Ready to build your best self!";
  }

  private async callTogether(messages: any[], model: string): Promise<string> {
    if (!togetherClient) throw new Error('Together client not initialized');
    
    const response = await togetherClient.chat.completions.create({
      model: MODEL_CONFIG.together[model as keyof typeof MODEL_CONFIG.together].model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content || "Let's crush your fitness goals!";
  }

  // Health check for all models
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    results.openrouter = !!openrouterClient;
    results.anthropic = !!anthropicClient;
    results.google = !!googleClient;
    results.groq = !!groqClient;
    results.deepseek = !!deepseekClient;
    results.cohere = !!cohereClient;
    results.mistral = !!mistralClient;
    results.huggingface = !!huggingfaceClient;
    results.perplexity = !!perplexityClient;
    results.fireworks = !!fireworksClient;
    results.together = !!togetherClient;
    results.ai21 = !!ai21Client;
    
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
