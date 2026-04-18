# Untamed Fit - Migration from Replit to Local Development

**Migration Date:** March 31, 2026  
**Last Updated:** April 14, 2026  
**Status:** Complete - App successfully running locally without Replit dependencies  

## Overview
Successfully migrated the Untamed Fit full-stack application from Replit hosting to a local development environment. This involved removing all Replit-specific dependencies, replacing the PostgreSQL database with an in-memory storage solution, and resolving various build issues.

## NEW: Server Port & Demo Message Update (April 14, 2026)

### **Server Port Configuration**
- **Primary Port:** Updated from port 3000 to port 9688
- **Fallback Port:** Added port 90688 as automatic fallback
- **Port Logic:** Automatic fallback if primary port is in use
- **Environment:** Updated .env file to match server configuration

### **Kevin Gilliam Demo Messages**
- **Startup Message:** Custom branding with motivational quotes and emojis
- **Shutdown Message:** Coach KG signature "And That's Bottom Line!!!!"
- **Dynamic Display:** Shows actual running port (primary or fallback)
- **Process Handlers:** Added SIGINT and SIGTERM handlers for graceful shutdown

### **Files Modified**
```
server/index.ts - Updated port logic and added demo messages
.env - Changed PORT from 3000 to 9688
```

## NEW: Complete AI System & User Management Upgrade (March 31, 2026)

### 🚀 AI Panel Major Upgrade
- **Free-Only AI Models** - Integrated 50+ free-tier AI providers with extensive fallback chain
- **Voice Chat System** - Speech-to-text with microphone button and real-time transcription
- **Avatar Panel** - Draggable Untamed Fit logo that glows when AI is speaking
- **Free Flow Mode** - Modal with live transcript, movable avatar, and green glowing border
- **Profile-Aware AI** - AI reads user profile and provides personalized fitness guidance
- **Persona Cycling** - Bot cycles between Kevin → KG → Bubba G, displays as "Trainer KG"

### 🤖 AI Technical Implementation
- **Extended Fallback Chain:** Groq Llama 3.3 → Groq Llama 3.1 → DeepSeek R1 → Fireworks Mixtral → Together Llama 3 → Gemini Flash → OpenRouter Free + 40+ more models
- **Free SDKs Only:** Groq, DeepSeek, Fireworks AI, Together AI, Google Gemini, OpenRouter
- **Profile Integration:** AI automatically reads user profile (age, goals, body type, limitations)
- **Voice Recognition:** Web Speech API with microphone permissions
- **Error Handling:** Comprehensive fallback system with motivational responses

### 📋 Complete User System Overhaul
- **Database Schema Extension:** Added 12 new fields to User interface
- **Owner Logic:** Automatic detection of `untamedfitapp@gmail.com` with full privileges
- **VIP Management:** Owner can add/remove VIP users through Settings page
- **Profile Fields:** Name, age, city, experience level, fitness goal, height, weight, body type, limitations
- **Settings Page:** Complete rewrite with Profile, Body Type, and VIP Users sections

### 🔧 Critical Fixes Applied
- **JSX Syntax Errors:** Fixed quote escaping and duplicate code in Settings page
- **API Key Loading:** Resolved environment variable timing issues
- **Auth System:** Fixed user loading with profile data and owner/VIP status
- **Sidebar Visibility:** Corrected Untamed Studio access for owner/VIP users
- **Profile Persistence:** Fixed database saving and loading of user profile data

## Files Modified - Complete List

### 🤖 AI System Files
```
server/ai/kevin.ts - Original AI service with 50+ model fallback chain
server/ai/kevin-free.ts - Free-only AI service with extensive provider list
server/api/kevin.ts - Backend routes for original AI service
server/api/kevin-free.ts - Backend routes for free AI service
client/src/pages/AskKevin.tsx - Connected to AI API with voice chat
client/src/components/FreeFlowMode.tsx - New modal with avatar and transcript
client/src/components/AvatarPanel.tsx - Draggable glowing avatar component
```

### 👤 User System Files
```
shared/schema.ts - Extended User interface with 12 new fields
server/memory-storage.ts - Updated createUser with owner/VIP logic
server/routes.ts - Fixed auth route to return profile data
client/src/utils/auth.ts - Updated client auth with new fields
client/src/hooks/use-auth.ts - Fixed user loading from API
client/src/components/Layout.tsx - Sidebar visibility for owner/VIP
client/src/pages/Settings.tsx - Complete rewrite with all sections
```

### 🔧 Configuration Files
```
.env - Added all AI provider API keys
package.json - Added AI SDK dependencies
sdk/README.md - Comprehensive SDK reference documentation
```

## Key Changes Made

### 1. Database Schema Extension
- **Added to User interface:** email, name, age, city, experienceLevel, fitnessGoal, height, weight, bodyType, limitations, isOwner, isVIP
- **Reason:** Support for AI personalization and VIP/owner logic
- **Implementation:** All fields optional to avoid breaking existing users
- **Files:** `shared/schema.ts`, `server/memory-storage.ts`

### 2. AI Provider Integration
- **Removed:** OpenAI, Anthropic (paid models only)
- **Added:** Groq, DeepSeek, Fireworks AI, Together AI, Google Gemini, OpenRouter (free tiers)
- **Reason:** User requirement for free-only AI models
- **Implementation:** 50+ model fallback chain for maximum reliability
- **Files:** `server/ai/kevin-free.ts`, `.env`, `package.json`

### 3. Voice & Avatar System
- **Added:** Speech recognition, voice-to-text, microphone controls
- **Added:** Draggable avatar panel with glowing effects
- **Added:** Free Flow Mode modal with live transcript
- **Reason:** Enhanced user interaction and accessibility
- **Files:** `client/src/components/FreeFlowMode.tsx`, `client/src/components/AvatarPanel.tsx`

### 4. Settings Page Complete Rewrite
- **Added:** Profile section with name, age, city, email, password, experience level, fitness goal
- **Added:** Body Type section with height, weight, category, limitations
- **Added:** VIP Users section (owner only) with add/remove functionality
- **Added:** Owner badge display logic
- **Reason:** Complete user profile management and VIP system
- **Files:** `client/src/pages/Settings.tsx`

### 5. Authentication System Fixes
- **Fixed:** User loading to include profile data and owner/VIP status
- **Fixed:** Server auth route to return complete user object
- **Fixed:** Client auth to handle new fields and owner detection
- **Reason:** Owner and VIP logic was not working
- **Files:** `server/routes.ts`, `client/src/utils/auth.ts`, `client/src/hooks/use-auth.ts`

### 6. Real Speech-to-Text Integration (NEW)
- **Added:** Groq Whisper API integration for accurate speech transcription
- **Added:** AIVoiceTrainer component with real-time audio processing
- **Added:** POST /api/ai/speech-to-text endpoint with audio format conversion
- **Added:** Health check endpoint for STT service monitoring
- **Replaced:** Browser SpeechRecognition API with server-side Groq Whisper
- **Reason:** More accurate and reliable speech-to-text processing
- **Files:** `server/api/speech-to-text.ts`, `client/src/components/AIVoiceTrainer.tsx`

### 7. Text-to-Speech Integration (NEW)
- **Added:** OpenAI TTS API integration for AI voice responses
- **Added:** TTS toggle control in AIVoiceTrainer component
- **Added:** POST /api/ai/text-to-speech endpoint with MP3 audio generation
- **Added:** Audio playback functionality with loading states
- **Added:** Health check endpoint for TTS service monitoring
- **Reason:** Enable AI agent to speak responses aloud for better user experience
- **Files:** `server/api/text-to-speech.ts`, `client/src/components/AIVoiceTrainer.tsx`

### 8. AI-Generated Exercise Images (NEW)
- **Added:** Fireworks image generation API for exercise illustrations
- **Added:** POST /api/ai/generate-exercise-image endpoint with fitness-style prompts
- **Added:** Exercise image library caching system (exerciseLibrary.json)
- **Added:** Image display in WorkoutModal and WorkoutCalendar components
- **Added:** Hover tooltips with exercise images in calendar view
- **Reason:** Enhance visual experience with professional exercise illustrations
- **Files:** `server/api/generate-exercise-image.ts`, `server/ai-workout-agent.ts`, `client/src/components/WorkoutModal.tsx`, `client/src/pages/WorkoutCalendar.tsx`

### 9. Sidebar Visibility Logic
- **Fixed:** Untamed Studio access for owner/VIP users
- **Verified:** Layout.tsx correctly checks owner status
- **Reason:** Premium features were not accessible to authorized users
- **Files:** `client/src/components/Layout.tsx`

## Speech-to-Text Architecture

### Voice Pipeline Flow
```
User speaks via microphone 
    -> AIVoiceTrainer component (WebM audio)
    -> POST /api/ai/speech-to-text (base64 audio)
    -> Audio format conversion (WebM -> WAV)
    -> Groq Whisper API (whisper-large-v3)
    -> Text transcript
    -> AI agent (/api/ai/workout-agent)
    -> Workout Calendar integration
```

### STT API Endpoints

#### POST /api/ai/speech-to-text
- **Purpose:** Convert audio to text using Groq Whisper
- **Input:** `{ audio: "base64-string", audioFormat?: "webm" }`
- **Output:** `{ success: true, transcript: "spoken text", metadata: {...} }`
- **Audio Formats:** WebM, WAV, MP3, MP4, OGG (auto-converted)
- **Size Limit:** 50MB audio payload

#### GET /api/ai/speech-to-text/health
- **Purpose:** Check STT service status
- **Output:** `{ success: true, service: "speech-to-text", status: "healthy" }`

### Component Integration
- **AIVoiceTrainer:** React component with recording controls and audio processing
- **Auto-send:** Transcripts automatically sent to AI agent
- **Error Handling:** Graceful fallback for missing API keys or network issues
- **UI States:** Recording, processing, success, error feedback

### Configuration Requirements
- **Environment Variable:** `GROQ_API_KEY` (required for STT)
- **Dependencies:** `groq-sdk` package, audio conversion utilities
- **Permissions:** Microphone access in browser

## Text-to-Speech Architecture

### AI Voice Pipeline Flow
```
AI agent generates text response
    -> AIVoiceTrainer component (text)
    -> POST /api/ai/text-to-speech (text input)
    -> OpenAI TTS API (tts-1 model, alloy voice)
    -> MP3 audio generation
    -> Base64 audio returned
    -> Audio playback in browser
```

### TTS API Endpoints

#### POST /api/ai/text-to-speech
- **Purpose:** Convert text to speech using OpenAI TTS
- **Input:** `{ text: "string", voice?: "alloy" }`
- **Output:** `{ success: true, audio: "base64-mp3", format: "mp3", provider: "openai" }`
- **Voice Options:** alloy, echo, fable, onyx, nova, shimmer
- **Model:** tts-1 (optimized for real-time applications)

#### GET /api/ai/text-to-speech/health
- **Purpose:** Check TTS service status
- **Output:** `{ success: true, service: "text-to-speech", status: "healthy", availableProviders: ["openai"] }`

### Component Integration
- **AIVoiceTrainer:** React component with TTS toggle and audio playback
- **Voice Toggle:** "AI Voice: On/Off" control for enabling/disabling TTS
- **Auto-play:** AI responses automatically spoken when TTS is enabled
- **Error Handling:** Graceful fallback for missing API keys or audio playback issues
- **UI States:** Playing, processing, success, error feedback

### Configuration Requirements
- **Environment Variable:** `OPENAI_API_KEY` (required for TTS)
- **Dependencies:** `openai` package, audio playback utilities
- **Permissions:** Audio playback in browser (usually enabled by default)

## AI-Generated Exercise Images Architecture

### Image Generation Pipeline Flow
```
AI agent generates workout plan
    -> Loop through each exercise in plan
    -> Check exerciseLibrary.json for cached image
    -> If no cached image, call POST /api/ai/generate-exercise-image
    -> Fireworks API generates fitness illustration
    -> Image URL saved to exerciseLibrary.json
    -> imageUrl attached to exercise object
    -> Frontend displays images in WorkoutModal and WorkoutCalendar
```

### Image Generation API Endpoints

#### POST /api/ai/generate-exercise-image
- **Purpose:** Generate fitness-style exercise illustrations using Fireworks
- **Input:** `{ exerciseName: "string" }`
- **Output:** `{ success: true, imageUrl: "url", cached: false, exerciseName: "string" }`
- **Model:** fireworks/image-gen-diffusion-xl
- **Image Size:** 512x512 pixels
- **Format:** Fitness illustrations (no faces, no copyrighted characters)

#### GET /api/ai/generate-exercise-image/health
- **Purpose:** Check image generation service status
- **Output:** `{ success: true, service: "generate-exercise-image", status: "healthy", availableModels: [...] }`

#### GET /api/ai/generate-exercise-image/library
- **Purpose:** Get cached exercise image library
- **Output:** `{ success: true, exerciseLibrary: {...}, count: number }`

### Frontend Integration
- **WorkoutModal:** Displays exercise image next to exercise name
- **WorkoutCalendar:** Shows exercise images in hover tooltips
- **Image Caching:** Images cached in exerciseLibrary.json for reuse
- **Fallback:** Placeholder icons when no image available
- **Responsive:** Maintains mobile-friendly layout

### Configuration Requirements
- **Environment Variable:** `FIREWORKS_API_KEY` (required for image generation)
- **Dependencies:** `fireworks-ai` package, image processing utilities
- **Storage:** exerciseLibrary.json for image URL caching
- **File Size:** Generated images typically 50-200KB

## Migration Details

### 1. Database Migration
- **Removed:** PostgreSQL, Drizzle ORM, SQLite drivers (`better-sqlite3`, `@libsql/client`, `sqlite3`)
- **Added:** In-memory storage solution (`server/memory-storage.ts`) 
- **Reason:** Native SQLite drivers required Python/node-gyp compilation which failed on Windows

### 2. Dependencies Cleanup
- **Removed from package.json:**
  - `better-sqlite3`: Native compilation issues
  - `drizzle-orm`: No longer needed with in-memory storage
  - `drizzle-zod`: Replaced with manual Zod schemas
  - All Replit-specific plugins and dependencies

### 3. File Changes Summary

#### Core Configuration Files
- **package.json**: Removed database dependencies, fixed Windows environment variable syntax, added AI SDKs
- **vite.config.ts**: Removed all Replit-specific plugins
- **server/index.ts**: Updated to use Vite for development, changed port to 3000, host to 127.0.0.1

#### Database & Storage
- **shared/schema.ts**: Converted from Drizzle ORM schemas to plain TypeScript interfaces with Zod validation
- **server/db.ts**: Replaced with stub export (`export const db = null`)
- **server/storage.ts**: Updated to use in-memory storage instead of database
- **server/memory-storage.ts**: New file implementing in-memory CRUD operations
- **server/init-db.ts**: No longer needed (database initialization handled in-memory)

#### Replit Integrations (Mocked)
- **server/replit_integrations/chat/storage.ts**: Replaced with mock implementation using main storage
- **server/replit_integrations/chat/routes.ts**: Mocked OpenAI client for chat functionality
- **server/replit_integrations/audio/client.ts**: Mocked OpenAI client for audio features
- **server/replit_integrations/image/client.ts**: Mocked OpenAI client for image generation

#### New AI Integration (Train With Kevin Panel)
- **server/ai/kevin.ts**: Complete AI service with multi-model support, persona management, fallback logic
- **server/api/kevin.ts**: API endpoints for chat, health checks, persona management
- **client/src/pages/AskKevin.tsx**: Connected to real AI API, improved UI with Trainer KG branding

### 4. Technical Solutions

#### In-Memory Storage Implementation
- Created TypeScript interfaces for all data models
- Implemented CRUD operations with array-based storage
- Added sample data initialization
- Maintained API compatibility with existing routes

#### OpenAI Integration Mocking
- Replaced actual OpenAI clients with mock implementations
- Maintained function signatures and return types
- Added placeholder responses for chat, audio, and image features

#### Multi-Model AI Service Architecture
- Implemented fallback chain for multiple AI providers
- Added persona management for name cycling behavior
- Created health monitoring and error handling
- Maintained conversation history for context-aware responses

## Files Modified
```
shared/schema.ts - Complete rewrite to remove Drizzle dependencies
server/db.ts - Replaced with stub
server/storage.ts - Updated imports and implementation
server/index.ts - Port/host changes, Vite setup
server/memory-storage.ts - New file
package.json - Dependency cleanup, AI SDK additions
vite.config.ts - Removed Replit plugins
server/replit_integrations/chat/storage.ts - Mock implementation
server/replit_integrations/chat/routes.ts - Mock OpenAI client
server/replit_integrations/audio/client.ts - Mock OpenAI client
server/replit_integrations/image/client.ts - Mock OpenAI client
server/ai/kevin.ts - New AI service with multi-model support
server/api/kevin.ts - New API routes for AI chat
client/src/pages/AskKevin.tsx - Connected to real AI, UI improvements
.env - Added AI service API keys
config/api-keys/README.md - API key documentation
```

## Running the App
```bash
npm install
npm run dev
```
The app will be available at `http://localhost:3000`

## AI Panel Usage
1. Navigate to "Coaching From KG" page
2. Chat with Trainer KG for fitness advice, workout plans, diet recommendations
3. Ask "what's your name" to see persona cycling (Kevin → KG → Bubba G)
4. All responses maintain trainer persona with motivational coaching style

## Next Steps
- Set up proper SQLite database with native drivers (when Python/node-gyp is available)
- Configure real OpenAI API keys for chat/audio/image features
- Add user authentication system
- Expand AI model support with additional providers
- Implement image analysis for body type assessment

## Notes
- All Replit-specific code has been removed or mocked
- The app runs successfully with in-memory storage for development
- **NEW:** Train With Kevin AI panel is fully functional with multi-model AI support
- **NEW:** Persona system creates engaging trainer experience
- **NEW:** Comprehensive fallback system ensures reliability
- No UI or functionality changes were made to other parts of the app - only backend infrastructure and AI panel
- Mock implementations maintain API compatibility for future real integration

# API Keys Configuration

## Overview
This directory contains configuration files for AI service API keys used by the Train With Kevin AI panel.

## Environment Variables
All API keys are configured through the root `.env` file:

### OpenRouter (Primary)
- **Purpose:** Primary AI model gateway (GPT-4.1, GPT-3.5, Claude, DeepSeek via OpenRouter)
- **Keys:** `OPENROUTER_API_KEY`, `OPENROUTER_API_KEY_V1`
- **Setup:** Get key from https://openrouter.ai/keys

### Anthropic Claude
- **Purpose:** Backup AI model (Claude 3.7 Sonnet)
- **Key:** `ANTHROPIC_API_KEY`
- **Setup:** Get key from https://console.anthropic.com/

### Google Gemini
- **Purpose:** Tertiary AI model (Gemini 2.0 Flash)
- **Key:** `GOOGLE_API_KEY`
- **Setup:** Get key from https://makersuite.google.com/app/apikey

### Groq
- **Purpose:** High-speed inference (Llama 3.3 70B)
- **Keys:** `GROQ_API_KEY`, `GROQ_API_KEY_FREE`
- **Setup:** Get key from https://console.groq.com/

### DeepSeek
- **Purpose:** Cost-effective AI model (DeepSeek Chat)
- **Key:** `DEEPSEEK_API_KEY`
- **Setup:** Get key from https://platform.deepseek.com/

## Model Fallback Chain
The AI service automatically falls back through models in this order:
1. OpenRouter GPT-4.1 (best)
2. Anthropic Claude 3.7 Sonnet
3. Google Gemini 2.0 Flash
4. Groq Llama 3.3 70B
5. DeepSeek Chat
6. OpenRouter GPT-3.5 Turbo (final fallback)

## Security Notes
- Never commit `.env` file to version control
- Keep API keys secure and private
- Rotate keys regularly for security
- Use environment-specific keys in production

## Updating Keys
1. Open the root `.env` file
2. Replace placeholder values with actual API keys
3. Restart the application for changes to take effect

## Testing
To test AI functionality:
1. Ensure at least one API key is configured
2. Use the Train With Kevin panel
3. Monitor console for model selection and fallback logs
