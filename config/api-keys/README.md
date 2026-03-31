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
