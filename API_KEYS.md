# Untamed Fit - API Keys Reference Guide

**Last Updated:** March 31, 2026  
**Purpose:** Comprehensive reference for all AI service API keys, locations, and configurations

## 📋 Overview
This document serves as the master reference for all API keys used in the Untamed Fit application, specifically for the Train With Kevin AI panel. It includes installation locations, fallback order, usage limits, and integration details.

---

## 🔑 API Keys Configuration

### 1. OpenRouter (Primary AI Gateway)
**Environment Variables:**
- `OPENROUTER_API_KEY="sk-95cb352be8dab4d0ca34cea9b8752c000582668657504c4f9f8689c639d3147e"`
- `OPENROUTER_API_KEY_V1="v1-95cb352be8dab4d0ca34cea9b8752c000582668657504c4f9f8689c639d3147e"`

**Installation Location:**
- **File:** `.env` (root directory)
- **Lines:** 2-3
- **Code Location:** `server/ai/kevin.ts` (lines 7-8, 48-51)

**Models Available:**
- `openai/gpt-4-turbo` (GPT-4.1 equivalent)
- `openai/gpt-3.5-turbo`
- `anthropic/claude-3.5-sonnet`
- `deepseek/deepseek-chat`

**Usage Limits:**
- Free tier: $5 credit per month
- Rate limits: 200 requests/minute
- Vision capabilities: ✅ Yes
- Trading analysis: ✅ Excellent
- Body type analysis: ✅ Excellent

**Fallback Priority:** #1 (Primary)

---

### 2. Anthropic Claude
**Environment Variable:**
- `ANTHROPIC_API_KEY="YOUR_ANTHROPIC_KEY_HERE"`

**Installation Location:**
- **File:** `.env` (root directory)
- **Line:** 6
- **Code Location:** `server/ai/kevin.ts` (line 9, 53)

**Models Available:**
- `claude-3-5-sonnet-20241022`

**Usage Limits:**
- Free tier: Limited credits
- Rate limits: 1000 requests/minute
- Vision capabilities: ✅ Yes
- Trading analysis: ✅ Very Good
- Body type analysis: ✅ Very Good

**Fallback Priority:** #2

---

### 3. Google Gemini
**Environment Variable:**
- `GOOGLE_API_KEY="AIzaSyBRnUT3cFXKhgtNi7N4nkLMBfEAqpamJ2U"`

**Installation Location:**
- **File:** `.env` (root directory)
- **Line:** 9
- **Code Location:** `server/ai/kevin.ts` (line 10, 54)

**Models Available:**
- `gemini-2.0-flash-exp`

**Usage Limits:**
- Free tier: 15 requests/minute
- Rate limits: 15 requests/minute
- Vision capabilities: ✅ Yes
- Trading analysis: ✅ Good
- Body type analysis: ✅ Good

**Fallback Priority:** #3

---

### 4. Groq (High-Speed Inference)
**Environment Variables:**
- `GROQ_API_KEY="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"`
- `GROQ_API_KEY_FREE="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"`

**Installation Location:**
- **File:** `.env` (root directory)
- **Lines:** 12-13
- **Code Location:** `server/ai/kevin.ts` (lines 11-12, 55)

**Models Available:**
- `llama-3.3-70b-versatile`

**Usage Limits:**
- Free tier: 30 requests/minute
- Rate limits: 30 requests/minute
- Vision capabilities: ❌ No
- Trading analysis: ✅ Good
- Body type analysis: ✅ Fair

**Fallback Priority:** #4

---

### 5. DeepSeek
**Environment Variable:**
- `DEEPSEEK_API_KEY="sk-b9d74d38c180437b81ad277f1f7c855f"`

**Installation Location:**
- **File:** `.env` (root directory)
- **Line:** 16
- **Code Location:** `server/ai/kevin.ts` (line 13, 56)

**Models Available:**
- `deepseek-chat`

**Usage Limits:**
- Free tier: Unlimited (with rate limits)
- Rate limits: 100 requests/minute
- Vision capabilities: ❌ No
- Trading analysis: ✅ Fair
- Body type analysis: ✅ Fair

**Fallback Priority:** #5

---

## 🔄 Fallback Chain Order (Optimized for Free Usage & Capabilities)

### Current Fallback Priority:
1. **OpenRouter GPT-4.1** (Best overall, vision capable, $5 free credit)
2. **Anthropic Claude 3.7** (High accuracy, vision capable, limited free)
3. **Google Gemini 2.0** (Fast, vision capable, 15 req/min free)
4. **Groq Llama 3.3** (High-speed, no vision, 30 req/min free)
5. **DeepSeek Chat** (Cost-effective, no vision, unlimited free)
6. **OpenRouter GPT-3.5** (Reliable fallback, uses same OpenRouter key)

### Optimization Strategy:
- **Vision Capabilities First:** Prioritize models that can analyze images for body type assessment
- **Trading Analysis:** Models with strong reasoning and analytical capabilities
- **Free Tier Optimization:** Models with best free usage limits prioritized
- **Reliability:** Stable models with consistent performance

---

## 📁 File Locations & Integration

### Core AI Service Files:
```
server/ai/kevin.ts              - Main AI service with all model integrations
server/api/kevin.ts             - API routes for chat, health, persona
client/src/pages/AskKevin.tsx   - UI component using AI service
server/routes.ts                - Route registration
```

### Configuration Files:
```
.env                           - All API keys and environment variables
config/api-keys/README.md      - API key setup documentation
package.json                   - AI SDK dependencies
```

### Dependencies in package.json:
```json
"openai": "^4.28.4",                    // OpenRouter compatibility
"@anthropic-ai/sdk": "^0.24.3",         // Claude integration
"@google/generative-ai": "^0.21.0",     // Gemini integration
"groq-sdk": "^0.9.0"                   // Groq integration
```

---

## 🌐 Web Browser Integration

### Browser API Keys:
- **OpenRouter:** Works in browser environment
- **Claude:** Requires server-side only
- **Gemini:** Works in browser environment
- **Groq:** Works in browser environment
- **DeepSeek:** Works in browser environment

### CORS Configuration:
- All API endpoints configured for cross-origin requests
- Browser-based API calls supported for compatible providers

---

## 🎯 App Integration Points

### Train With Kevin Panel:
- **Page:** `/ask-kevin` (Coaching From KG)
- **Component:** `AskKevin.tsx`
- **API Endpoint:** `/api/kevin/chat`
- **Health Check:** `/api/kevin/health`

### Persona Management:
- **Name Cycling:** Kevin → KG → Bubba G
- **Trigger:** "what's your name" questions
- **UI Display:** Always "Trainer KG"

### Conversation Features:
- **History Tracking:** Maintains context
- **Workout Integration:** Preserves existing workout features
- **Error Handling:** Graceful fallback to motivational responses

---

## 🔧 Installation & Setup Commands

### Environment Setup:
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### API Key Testing:
```bash
# Health check
curl http://localhost:3000/api/kevin/health

# Test chat endpoint
curl -X POST http://localhost:3000/api/kevin/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "conversationHistory": []}'
```

---

## 📊 Usage Analytics & Monitoring

### Health Monitoring:
- **Endpoint:** `/api/kevin/health`
- **Returns:** Service availability for each provider
- **Frequency:** Real-time status checks

### Fallback Tracking:
- **Automatic:** Logs model switches
- **Manual:** Persona state tracking
- **Debug:** Detailed error logging

### Performance Metrics:
- **Response Time:** Per-model latency tracking
- **Success Rate:** API call success/failure ratios
- **Usage Limits:** Free tier consumption monitoring

---

## 🚀 Future Expansions Planned

### Additional Providers:
- **Hugging Face:** 1000+ free models
- **Cohere:** Enterprise AI solutions
- **Mistral:** European AI models
- **Perplexity:** Search-enhanced AI

### Enhanced Capabilities:
- **Image Analysis:** Body type assessment from photos
- **Video Analysis:** Exercise form correction
- **Voice Integration:** Real-time coaching feedback
- **Trading Analysis:** Market trend predictions

### Optimization Goals:
- **Cost Efficiency:** Maximize free tier usage
- **Performance:** Minimize latency
- **Reliability:** Ensure 99.9% uptime
- **Accuracy:** Maintain high-quality responses

---

## 📞 Support & Troubleshooting

### Common Issues:
1. **API Key Errors:** Verify keys in `.env` file
2. **Rate Limits:** Check provider dashboards
3. **Network Issues:** Verify internet connectivity
4. **Model Unavailable:** Automatic fallback to next provider

### Debug Commands:
```bash
# Check service status
curl http://localhost:3000/api/kevin/health

# Test specific model
curl -X POST http://localhost:3000/api/kevin/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message", "conversationHistory": []}'
```

### Log Locations:
- **Server Logs:** Console output from `npm run dev`
- **API Errors:** Detailed error responses
- **Fallback Events:** Model switch notifications

---

**Last Review:** March 31, 2026  
**Next Review:** April 7, 2026  
**Maintenance:** Weekly API key validation and usage monitoring
