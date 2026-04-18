import { Request, Response } from 'express';

// Lazy initialization of TTS clients to handle env loading timing
let googleTTS: any = null;
let openaiTTS: any = null;

function getGoogleTTSClient() {
  if (!googleTTS) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn('GOOGLE_API_KEY not found in environment');
      return null;
    }
    
    try {
      // Dynamic import to avoid module loading issues
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      googleTTS = new GoogleGenerativeAI({ apiKey });
      console.log('Google TTS client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google TTS client:', error);
      return null;
    }
  }
  return googleTTS;
}

function getOpenAITTSClient() {
  if (!openaiTTS) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not found in environment');
      return null;
    }
    
    try {
      // Dynamic import to avoid module loading issues
      const { OpenAI } = require('openai');
      openaiTTS = new OpenAI({ apiKey });
      console.log('OpenAI TTS client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OpenAI TTS client:', error);
      return null;
    }
  }
  return openaiTTS;
}

export async function registerTextToSpeechRoutes(app: any) {
  // POST /api/ai/text-to-speech - Main TTS endpoint
  app.post('/api/ai/text-to-speech', async (req: Request, res: Response) => {
    try {
      const { text, voice = 'alloy' } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text input is required'
        });
      }

      console.log(`🔊 Processing TTS request: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

      let audioBuffer: Buffer;
      let provider: string;

      // Try Google TTS first (preferred for natural voice)
      const googleClient = getGoogleTTSClient();
      if (googleClient) {
        try {
          provider = 'google';
          console.log('🔊 Using Google TTS...');
          
          const { GoogleGenerativeAI } = require('@google/generative-ai');
          const model = GoogleGenerativeAI.getGenerativeModelFromName('gemini-1.5-flash');
          
          const result = await model.generateContent({
            contents: [{
              parts: [
                {
                  text: text
                }
              ]
            }]
          });

          if (result.response?.candidates()?.[0]?.content?.parts?.[0]?.text) {
            // Google TTS doesn't directly support audio generation
            // We'll use OpenAI as fallback
            console.log('Google TTS available but no direct audio generation, falling back to OpenAI');
          } else {
            console.log('Google TTS processed successfully');
          }
        } catch (googleError) {
          console.error('Google TTS error:', googleError);
        }
      }

      // Use OpenAI TTS (primary choice for audio generation)
      const openaiClient = getOpenAITTSClient();
      if (openaiClient) {
        try {
          provider = 'openai';
          console.log('🔊 Using OpenAI TTS...');
          
          const mp3 = await openaiClient.audio.speech.create({
            model: "tts-1",
            voice: voice,
            input: text,
            response_format: "mp3",
            speed: 1.0
          });

          audioBuffer = Buffer.from(await mp3.arrayBuffer());
          console.log(`✅ OpenAI TTS generated successfully (${audioBuffer.length} bytes)`);

        } catch (openaiError) {
          console.error('OpenAI TTS error:', openaiError);
          throw openaiError;
        }
      }

      if (!audioBuffer) {
        return res.status(500).json({
          success: false,
          error: 'No TTS provider available'
        });
      }

      // Convert to base64 for frontend
      const base64Audio = audioBuffer.toString('base64');

      res.json({
        success: true,
        audio: base64Audio,
        format: 'mp3',
        provider,
        metadata: {
          voice,
          textLength: text.length,
          audioSize: audioBuffer.length,
          model: 'tts-1'
        }
      });

    } catch (error) {
      console.error('🔊 TTS Error:', error);
      
      // Handle specific error types
      let errorMessage = 'Text-to-speech failed';
      let statusCode = 500;

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'Invalid API key';
          statusCode = 401;
        } else if (error.message.includes('quota')) {
          errorMessage = 'API quota exceeded';
          statusCode = 429;
        } else if (error.message.includes('invalid')) {
          errorMessage = 'Invalid text input';
          statusCode = 400;
        }
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        provider: 'none',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/ai/text-to-speech/health - Health check endpoint
  app.get('/api/ai/text-to-speech/health', async (req: Request, res: Response) => {
    try {
      const googleClient = getGoogleTTSClient();
      const openaiClient = getOpenAITTSClient();
      
      const availableProviders = [];
      if (googleClient) availableProviders.push('google');
      if (openaiClient) availableProviders.push('openai');

      res.json({
        success: true,
        service: 'text-to-speech',
        status: availableProviders.length > 0 ? 'healthy' : 'misconfigured',
        availableProviders,
        message: availableProviders.length > 0 ? 'TTS providers available' : 'No TTS API keys configured',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });
}
