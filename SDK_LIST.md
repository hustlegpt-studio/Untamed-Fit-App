# Untamed Fit - Free-Only AI SDKs Reference Guide

**Last Updated:** March 31, 2026  
**Purpose:** Complete reference for all free-only AI SDKs used in the Train With Kevin AI panel

---

## 🎯 **What Are SDKs?**

**SDKs (Software Development Kits)** are pre-built libraries that make it easy to connect to AI services without writing complex API code from scratch. Think of them as remote controls for different AI models - each SDK gives us buttons to send messages, get responses, and handle errors automatically.

---

## 📋 **Installed Free-Only AI SDKs**

### 1. **Groq SDK** (`groq-sdk: ^0.9.0`)
**Provider:** Groq  
**Free Tier:** 30 requests/minute  
**Model:** Llama 3.3 70B  
**Fallback Position:** #1 (Primary)

#### How It Works:
```javascript
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const response = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: "Hey!" }],
  max_tokens: 1000
});
```

#### Why It's #1:
- **Fastest inference** in the world (under 1 second)
- **Reliable free tier** with generous limits
- **High-quality responses** for fitness coaching
- **No rate limiting headaches**

---

### 2. **DeepSeek SDK** (`deepseek-chat: ^1.0.0`)
**Provider:** DeepSeek  
**Free Tier:** Unlimited requests  
**Model:** DeepSeek R1  
**Fallback Position:** #2 (Secondary)

#### How It Works:
```javascript
import OpenAI from "openai";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com"
});

const response = await deepseek.chat.completions.create({
  model: "deepseek-chat",
  messages: [{ role: "user", content: "Hey!" }],
  max_tokens: 1000
});
```

#### Why It's #2:
- **Unlimited free usage** - no monthly limits
- **Good reasoning** for fitness advice
- **Reliable backup** when Groq is busy
- **Cost-effective** for high volume

---

### 3. **Fireworks AI SDK** (`@ai-sdk/fireworks: ^1.0.30`)
**Provider:** Fireworks AI  
**Free Tier:** Free models available  
**Model:** Mixtral 8x7B  
**Fallback Position:** #3 (Tertiary)

#### How It Works:
```javascript
import { fireworks } from "@ai-sdk/fireworks";
import { generateText } from "ai";

const response = await generateText({
  model: fireworks("accounts/fireworks/models/mixtral-8x7b"),
  prompt: "Hey!",
  maxTokens: 1000
});
```

#### Why It's #3:
- **Specialized in fast inference**
- **Good free model selection**
- **Modern AI toolkit integration**
- **Solid performance** for coaching

---

### 4. **Together AI SDK** (`together-ai: ^0.6.0`)
**Provider:** Together AI  
**Free Tier:** Free tier available  
**Model:** Llama 3 70B  
**Fallback Position:** #4 (Quaternary)

#### How It Works:
```javascript
import Together from "together-ai";

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });
const response = await together.chat.completions.create({
  model: "meta-llama/Llama-3-70b-chat-hf",
  messages: [{ role: "user", content: "Hey!" }],
  max_tokens: 1000
});
```

#### Why It's #4:
- **Open-source model specialist**
- **Good free tier** for development
- **Reliable performance**
- **Community-driven models**

---

### 5. **Google Gemini SDK** (`@google/generative-ai: ^0.21.0`)
**Provider:** Google  
**Free Tier:** 15 requests/minute  
**Model:** Gemini Flash  
**Fallback Position:** #5 (Quinary)

#### How It Works:
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const response = await model.generateContent("Hey!");
const text = response.response.text();
```

#### Why It's #5:
- **Google's AI technology**
- **Fast responses** (Flash model)
- **Good reasoning** capabilities
- **Reliable infrastructure**

---

### 6. **OpenRouter SDK** (`openai: ^4.28.4`)
**Provider:** OpenRouter  
**Free Tier:** $5 credit/month  
**Model:** Free models only  
**Fallback Position:** #6 (Final)

#### How It Works:
```javascript
import OpenAI from "openai";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

const response = await openrouter.chat.completions.create({
  model: "meta-llama/llama-3.2-3b-instruct:free",
  messages: [{ role: "user", content: "Hey!" }],
  max_tokens: 1000
});
```

#### Why It's #6:
- **Model marketplace** - access to many free models
- **Good backup option**
- **Reliable service**
- **Multiple model choices**

---

## 🔄 **Fallback Order Logic**

### **How Fallback Works:**
1. **Try Groq first** (fastest, most reliable)
2. **If Groq fails → try DeepSeek** (unlimited free)
3. **If DeepSeek fails → try Fireworks** (good performance)
4. **If Fireworks fails → try Together** (reliable)
5. **If Together fails → try Gemini** (Google quality)
6. **If Gemini fails → try OpenRouter** (last resort)

### **Automatic Failover:**
```javascript
// In our AI service, this happens automatically:
try {
  return await callGroq(messages);
} catch (error) {
  console.log("Groq failed, trying DeepSeek...");
  try {
    return await callDeepSeek(messages);
  } catch (error) {
    console.log("DeepSeek failed, trying Fireworks...");
    // ... continues down the chain
  }
}
```

---

## 🎮 **Integration in Train With Kevin Panel**

### **Files Where SDKs Are Used:**

#### 1. **AI Service File** (`server/ai/kevin-free.ts`)
```javascript
// All SDKs imported and initialized here
import Groq from "groq-sdk";
import { fireworks } from "@ai-sdk/fireworks";
import Together from "together-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Provider clients created
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const fireworksClient = fireworks();
const togetherClient = new Together({ apiKey: process.env.TOGETHER_API_KEY });
// etc.
```

#### 2. **Backend Route** (`server/api/kevin-free.ts`)
```javascript
// Route that calls AI service
app.post('/api/kevin-free/chat', async (req, res) => {
  const response = await kevinAIService.generateResponse(req.body);
  res.json(response);
});
```

#### 3. **Frontend Chat** (`client/src/pages/AskKevin.tsx`)
```javascript
// UI that calls the backend API
const response = await fetch('/api/kevin-free/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, conversationHistory })
});
```

---

## 📊 **SDK Performance Comparison**

| SDK | Speed | Free Tier | Reliability | Quality | Position |
|-----|-------|-----------|-------------|---------|----------|
| **Groq** | ⚡⚡⚡⚡⚡ | 30 req/min | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡ | #1 |
| **DeepSeek** | ⚡⚡⚡⚡ | Unlimited | ⚡⚡⚡⚡ | ⚡⚡⚡⚡ | #2 |
| **Fireworks** | ⚡⚡⚡⚡⚡ | Free models | ⚡⚡⚡⚡ | ⚡⚡⚡ | #3 |
| **Together** | ⚡⚡⚡ | Free tier | ⚡⚡⚡⚡ | ⚡⚡⚡ | #4 |
| **Gemini** | ⚡⚡⚡⚡ | 15 req/min | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡ | #5 |
| **OpenRouter** | ⚡⚡⚡ | $5/month | ⚡⚡⚡⚡ | ⚡⚡⚡ | #6 |

---

## 🔧 **Environment Variables Setup**

### **Required API Keys:**
```bash
# Add these to your .env file
GROQ_API_KEY="gsk_your_groq_key_here"
DEEPSEEK_API_KEY="sk_your_deepseek_key_here"
FIREWORKS_API_KEY="your_fireworks_key_here"
TOGETHER_API_KEY="your_together_key_here"
GOOGLE_API_KEY="AIzaSy_your_google_key_here"
OPENROUTER_API_KEY="sk_your_openrouter_key_here"
```

### **Where to Get Keys:**
- **Groq:** https://console.groq.com/keys
- **DeepSeek:** https://platform.deepseek.com/api_keys
- **Fireworks:** https://fireworks.ai/account/api-keys
- **Together:** https://api.together.xyz/settings/api-keys
- **Google:** https://aistudio.google.com/apikey
- **OpenRouter:** https://openrouter.ai/keys

---

## 🚀 **Usage in Coaching From KG Panel**

### **Profile-Aware Conversation:**
1. **AI reads user profile** from Settings
2. **Starts with profile summary:** "Hey, I took a look at your profile..."
3. **Updates profile** if user corrects information
4. **Provides fitness advice** based on profile data

### **Persona System:**
- **Display Name:** Always "Trainer KG" in UI
- **Internal Names:** Cycles Kevin → KG → Bubba G
- **Trigger:** When user asks "What's your name?"

### **Free Flow Mode:**
- **Avatar panel** with Untamed Fit logo
- **Glowing effects** when speaking
- **Live transcript** of conversation
- **Draggable** around screen

---

## 📁 **Files Modified for SDK Integration**

### **Package Dependencies:**
```json
// package.json - Added these dependencies
"@ai-sdk/fireworks": "^1.0.30",
"together-ai": "^0.6.0", 
"deepseek-chat": "^1.0.0",
"groq-sdk": "^0.9.0",
"@google/generative-ai": "^0.21.0",
"openai": "^4.28.4"
```

### **Configuration:**
```bash
# .env - Added these environment variables
GROQ_API_KEY="..."
DEEPSEEK_API_KEY="..."
FIREWORKS_API_KEY="..."
TOGETHER_API_KEY="..."
GOOGLE_API_KEY="..."
OPENROUTER_API_KEY="..."
DEFAULT_FREE_MODEL="groq-llama3.3"
FREE_FALLBACK_ORDER="groq-llama3.3,deepseek-r1,fireworks-mixtral,together-llama3,gemini-flash,openrouter-free"
```

### **Service Files:**
```
server/ai/kevin-free.ts          # Main AI service with all SDKs
server/api/kevin-free.ts         # Backend API routes
client/src/pages/AskKevin.tsx    # Frontend chat interface
```

---

## 🎯 **Why This SDK Stack?**

### **Free-Only Philosophy:**
- **No credit cards required** for any provider
- **Generous free tiers** for development and production
- **Automatic fallback** ensures reliability
- **Cost-effective** for fitness coaching app

### **Performance Optimized:**
- **Fastest responses** possible (Groq is sub-second)
- **Reliable backup chain** if providers are down
- **Quality coaching** responses for fitness advice
- **Scalable** for multiple users

### **Easy Maintenance:**
- **Standardized interfaces** across all SDKs
- **Simple error handling** with automatic fallback
- **Clear documentation** for each provider
- **Easy to add/remove** providers as needed

---

**This SDK stack gives the Train With Kevin panel enterprise-grade AI capabilities at zero cost, with reliable fallback and excellent performance for fitness coaching!** 💪🚀
