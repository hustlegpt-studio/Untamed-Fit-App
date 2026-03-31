import Groq from "groq-sdk";
import { fireworks } from "@ai-sdk/fireworks";
import { generateText } from "ai";
import Together from "together-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getCurrentUserProfile, updateUserProfile } from "@/utils/auth";

// Environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Model configuration for free-only providers
const MODEL_CONFIG = {
  groq: {
    'groq-llama3.3': { model: 'llama-3.3-70b-versatile', provider: 'groq' }
  },
  deepseek: {
    'deepseek-r1': { model: 'deepseek-chat', provider: 'deepseek' }
  },
  fireworks: {
    'fireworks-mixtral': { model: 'accounts/fireworks/models/mixtral-8x7b', provider: 'fireworks' }
  },
  together: {
    'together-llama3': { model: 'meta-llama/Llama-3-70b-chat-hf', provider: 'together' }
  },
  google: {
    'gemini-flash': { model: 'gemini-2.0-flash-exp', provider: 'google' }
  },
  openrouter: {
    'openrouter-free': { model: 'meta-llama/llama-3.2-3b-instruct:free', provider: 'openrouter' }
  }
};

// Free-only fallback chain (best to worst)
const FREE_FALLBACK_CHAIN = [
  'groq-llama3.3',        // Best: Fastest, 30 req/min free
  'deepseek-r1',          // Great: Unlimited free
  'fireworks-mixtral',    // Good: Free models available
  'together-llama3',       // Good: Free tier
  'gemini-flash',         // Decent: 15 req/min free
  'openrouter-free'       // Backup: $5 free credit
];

// Initialize AI clients
const groqClient = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;
const deepseekClient = DEEPSEEK_API_KEY ? new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com"
}) : null;
const fireworksClient = FIREWORKS_API_KEY ? fireworks() : null;
const togetherClient = TOGETHER_API_KEY ? new Together({ apiKey: TOGETHER_API_KEY }) : null;
const googleClient = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;
const openrouterClient = OPENROUTER_API_KEY ? new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
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

  cycleName(): string {
    this.currentIndex = (this.currentIndex + 1) % this.nameCycle.length;
    return this.nameCycle[this.currentIndex];
  }

  getNameExplanation(): string {
    const explanations = {
      'Kevin': "Just Kevin - your fitness coach!",
      'KG': "KG stands for Kevin Gilliam - that's me!",
      'Bubba G': "Bubba G's my childhood nickname - old gym friends still call me that!"
    };
    return explanations[this.getCurrentName() as keyof typeof explanations];
  }

  shouldCycleName(message: string): boolean {
    return message.toLowerCase().includes("what's your name") || 
           message.toLowerCase().includes("what is your name") ||
           message.toLowerCase().includes("who are you");
  }
}

// Profile management
class ProfileManager {
  private profile: any = null;
  private profileConfirmed = false;

  loadProfile(): any {
    if (!this.profile) {
      const userProfile = getCurrentUserProfile();
      this.profile = userProfile?.profile || {};
    }
    return this.profile;
  }

  updateProfile(updates: any): void {
    this.profile = { ...this.profile, ...updates };
    try {
      updateUserProfile(this.profile);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }

  confirmProfile(): void {
    this.profileConfirmed = true;
  }

  isProfileConfirmed(): boolean {
    return this.profileConfirmed;
  }

  getProfileSummary(): string {
    const profile = this.loadProfile();
    return `
Height: ${profile.height || 'Not set'}
Weight: ${profile.weight || 'Not set'}
Experience level: ${profile.experienceLevel || 'Not set'}
Main goal: ${profile.mainGoal || 'Not set'}
Body type: ${profile.bodyType || 'Not set'}`.trim();
  }

  detectProfileUpdate(message: string): any | null {
    const profile = this.loadProfile();
    const updates: any = {};

    // Simple pattern matching for profile updates
    const patterns = {
      height: /height.*?(\d+)|(\d+).*?height/i,
      weight: /weight.*?(\d+)|(\d+).*?weight/i,
      experienceLevel: /experience.*?(beginner|intermediate|advanced|expert)|(beginner|intermediate|advanced|expert).*?experience/i,
      mainGoal: /goal.*?(weight-loss|muscle-gain|strength|endurance|flexibility|general-fitness)|(weight-loss|muscle-gain|strength|endurance|flexibility|general-fitness).*?goal/i,
      bodyType: /body.*?(ectomorph|mesomorph|endomorph)|(ectomorph|mesomorph|endomorph).*?body/i
    };

    for (const [field, pattern] of Object.entries(patterns)) {
      const match = message.match(pattern);
      if (match) {
        const value = match[1] || match[2];
        if (value && value !== profile[field]) {
          updates[field] = value;
        }
      }
    }

    return Object.keys(updates).length > 0 ? updates : null;
  }
}

// Main AI Service
class KevinFreeAIService {
  private persona: PersonaManager;
  private profile: ProfileManager;

  constructor() {
    this.persona = new PersonaManager();
    this.profile = new ProfileManager();
  }

  private async callGroq(messages: any[]): Promise<string> {
    if (!groqClient) throw new Error('Groq client not initialized');
    
    const response = await groqClient.chat.completions.create({
      model: MODEL_CONFIG.groq['groq-llama3.3'].model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content || "Let's crush your fitness goals!";
  }

  private async callDeepSeek(messages: any[]): Promise<string> {
    if (!deepseekClient) throw new Error('DeepSeek client not initialized');
    
    const response = await deepseekClient.chat.completions.create({
      model: MODEL_CONFIG.deepseek['deepseek-r1'].model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content || "Time to focus on your gains!";
  }

  private async callFireworks(messages: any[]): Promise<string> {
    if (!fireworksClient) throw new Error('Fireworks client not initialized');
    
    const lastMessage = messages[messages.length - 1].content;
    const response = await generateText({
      model: fireworksClient(MODEL_CONFIG.fireworks['fireworks-mixtral'].model),
      prompt: lastMessage,
      maxTokens: 1000,
      temperature: 0.7,
    });
    
    return response.text || "Ready to build your best self!";
  }

  private async callTogether(messages: any[]): Promise<string> {
    if (!togetherClient) throw new Error('Together client not initialized');
    
    const response = await togetherClient.chat.completions.create({
      model: MODEL_CONFIG.together['together-llama3'].model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content || "Let's get stronger together!";
  }

  private async callGoogle(messages: any[]): Promise<string> {
    if (!googleClient) throw new Error('Google client not initialized');
    
    const model = googleClient.getGenerativeModel({ 
      model: MODEL_CONFIG.google['gemini-flash'].model 
    });
    
    const lastMessage = messages[messages.length - 1].content;
    const response = await model.generateContent(lastMessage);
    
    return response.response.text() || "Your fitness journey starts now!";
  }

  private async callOpenRouter(messages: any[]): Promise<string> {
    if (!openrouterClient) throw new Error('OpenRouter client not initialized');
    
    const response = await openrouterClient.chat.completions.create({
      model: MODEL_CONFIG.openrouter['openrouter-free'].model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content || "Let's work towards your goals!";
  }

  private async tryAllProviders(messages: any[]): Promise<string> {
    let lastError: Error | null = null;

    for (const modelId of FREE_FALLBACK_CHAIN) {
      try {
        const config = Object.values(MODEL_CONFIG).find(provider => 
          Object.values(provider).find(model => model.model === modelId)
        );
        
        if (!config) continue;

        const provider = Object.values(config)[0];
        let response: string;

        switch (provider.provider) {
          case 'groq':
            response = await this.callGroq(messages);
            break;
          case 'deepseek':
            response = await this.callDeepSeek(messages);
            break;
          case 'fireworks':
            response = await this.callFireworks(messages);
            break;
          case 'together':
            response = await this.callTogether(messages);
            break;
          case 'google':
            response = await this.callGoogle(messages);
            break;
          case 'openrouter':
            response = await this.callOpenRouter(messages);
            break;
          default:
            throw new Error(`Unknown provider: ${provider.provider}`);
        }

        console.log(`✅ Successfully used ${modelId}`);
        return response;

      } catch (error) {
        lastError = error as Error;
        console.log(`❌ ${modelId} failed: ${(error as Error).message}`);
        continue;
      }
    }

    throw lastError || new Error('All AI providers failed');
  }

  private createSystemMessage(): string {
    const personaName = this.persona.getCurrentName();
    return `You are ${personaName}, a passionate and motivational fitness coach for Untamed Fit. 

Your coaching style:
- High energy and encouraging
- Uses fitness motivation and "hustle" language
- Focuses on mindset, consistency, and pushing limits
- Calls users "champion", "warrior", "beast" etc.
- Always ends with motivational push
- Never gives medical advice
- Never analyzes images or photos
- Keeps responses fitness-focused and actionable

Current persona: ${personaName}
${this.persona.getNameExplanation()}`;
  }

  private getProfileIntroduction(): string {
    const summary = this.profile.getProfileSummary();
    return `Hey, I took a look at your profile so I can coach you properly. Here's what I've got for you:

${summary}

Does all of that look right?`;
  }

  private handleProfileConfirmation(message: string): string | null {
    if (!this.profile.isProfileConfirmed()) {
      const lowerMessage = message.toLowerCase();
      
      // Check for corrections
      const updates = this.profile.detectProfileUpdate(message);
      if (updates) {
        this.profile.updateProfile(updates);
        const updateList = Object.entries(updates)
          .map(([field, value]) => `${field}: ${value}`)
          .join(', ');
        
        return `Got it! Updated your profile: ${updateList}. 

Now that we have your details locked in, tell me — what do you want to focus on today?`;
      }
      
      // Check for confirmation
      if (lowerMessage.includes('yes') || lowerMessage.includes('correct') || 
          lowerMessage.includes('looks good') || lowerMessage.includes('right')) {
        this.profile.confirmProfile();
        return "Perfect! Now tell me — what do you want to focus on today?";
      }
      
      // Check for corrections
      if (lowerMessage.includes('no') || lowerMessage.includes('wrong') || 
          lowerMessage.includes('change') || lowerMessage.includes('update')) {
        return "No problem! Tell me what needs to be updated - just say something like 'height is 180' or 'goal is muscle-gain' and I'll fix it.";
      }
    }
    
    return null;
  }

  async generateResponse(request: {
    message: string;
    conversationHistory?: Array<{role: string, content: string}>;
  }): Promise<{
    response: string;
    modelName: string;
    personaName: string;
    profileUpdated?: boolean;
    needsProfileConfirmation?: boolean;
  }> {
    const { message, conversationHistory = [] } = request;
    
    // Check if user is asking about persona name
    if (this.persona.shouldCycleName(message)) {
      const newName = this.persona.cycleName();
      return {
        response: `I'm ${newName}! ${this.persona.getNameExplanation()} Now, let's get back to crushing your fitness goals! What are we working on today?`,
        modelName: 'persona-response',
        personaName: newName
      };
    }

    // Handle profile confirmation on first interaction
    if (conversationHistory.length === 0 && !this.profile.isProfileConfirmed()) {
      return {
        response: this.getProfileIntroduction(),
        modelName: 'profile-introduction',
        personaName: this.persona.getCurrentName(),
        needsProfileConfirmation: true
      };
    }

    // Handle profile confirmation responses
    const profileResponse = this.handleProfileConfirmation(message);
    if (profileResponse) {
      return {
        response: profileResponse,
        modelName: 'profile-update',
        personaName: this.persona.getCurrentName(),
        profileUpdated: true
      };
    }

    // Only proceed with AI if profile is confirmed
    if (!this.profile.isProfileConfirmed()) {
      return {
        response: "Let's get your profile sorted first! Does the information I shared look correct, or do you need to update anything?",
        modelName: 'profile-pending',
        personaName: this.persona.getCurrentName(),
        needsProfileConfirmation: true
      };
    }

    // Prepare messages for AI
    const systemMessage = this.createSystemMessage();
    const profileContext = this.profile.getProfileSummary();
    
    const messages = [
      { role: "system", content: `${systemMessage}\n\nUser Profile:\n${profileContext}` },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message }
    ];

    try {
      const response = await this.tryAllProviders(messages);
      
      return {
        response,
        modelName: 'free-ai-response',
        personaName: this.persona.getCurrentName()
      };

    } catch (error) {
      console.error('All AI providers failed:', error);
      
      // Fallback motivational response
      const fallbackResponses = [
        "Listen up! All my AI systems might be down, but that doesn't mean your training stops! Keep pushing, stay focused, and I'll be back online soon. Remember: the mindset marathon never ends!",
        "Champion! Even when tech fails, your hustle doesn't! Keep grinding, stay consistent, and let's get back to business. What's your next move?",
        "Warrior! Sometimes systems go down, but legends never quit! Keep that fire burning and stay locked in on your goals. We'll be back stronger than ever!"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return {
        response: randomResponse,
        modelName: 'fallback-motivation',
        personaName: this.persona.getCurrentName()
      };
    }
  }

  // Health check for all free models
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    results.groq = !!groqClient;
    results.deepseek = !!deepseekClient;
    results.fireworks = !!fireworksClient;
    results.together = !!togetherClient;
    results.google = !!googleClient;
    results.openrouter = !!openrouterClient;
    
    return results;
  }

  // Get current persona info
  getPersonaInfo() {
    return {
      currentName: this.persona.getCurrentName(),
      nextName: this.persona.nameCycle[(this.persona.nameCycle.indexOf(this.persona.getCurrentName()) + 1) % this.persona.nameCycle.length],
      explanation: this.persona.getNameExplanation(),
      conversationCount: this.persona['conversationCount']
    };
  }

  // Reset persona (for testing)
  resetPersona() {
    this.persona = new PersonaManager();
  }

  // Get profile status
  getProfileStatus() {
    return {
      profile: this.profile.loadProfile(),
      isConfirmed: this.profile.isProfileConfirmed(),
      summary: this.profile.getProfileSummary()
    };
  }
}

export default KevinFreeAIService;
export const kevinFreeAIService = new KevinFreeAIService();
