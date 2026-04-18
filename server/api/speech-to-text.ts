import { Request, Response } from 'express';

// Lazy initialization of Groq client to handle env loading timing
let groq: any = null;

function getGroqClient() {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('GROQ_API_KEY not found in environment');
      return null;
    }
    
    try {
      // Dynamic import to avoid module loading issues
      const Groq = require('groq-sdk').Groq;
      groq = new Groq({ apiKey });
      console.log('Groq client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Groq client:', error);
      return null;
    }
  }
  return groq;
}

export async function registerSpeechToTextRoutes(app: any) {
  // POST /api/ai/speech-to-text - Main STT endpoint
  app.post('/api/ai/speech-to-text', async (req: Request, res: Response) => {
    try {
      const { audio, audioFormat = 'webm' } = req.body;

      if (!audio) {
        return res.status(400).json({
          success: false,
          error: 'Audio data (base64) is required'
        });
      }

      // Get Groq client
      const client = getGroqClient();
      if (!client) {
        return res.status(500).json({
          success: false,
          error: 'Speech-to-text service not available - API key missing'
        });
      }

      console.log(`🎤 Processing ${audioFormat} audio for transcription...`);

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audio, 'base64');
      
      // Create File object for Groq API
      const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

      console.log(`🎤 Sending audio to Groq Whisper (${audioBuffer.length} bytes)...`);

      // Transcribe using Groq Whisper
      const transcription = await client.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3",
        language: "en",
        response_format: "json"
      });

      const transcript = transcription.text?.trim();
      
      if (!transcript) {
        return res.status(400).json({
          success: false,
          error: 'No speech detected in audio'
        });
      }

      console.log(`✅ Transcription successful: "${transcript}"`);

      res.json({
        success: true,
        transcript,
        metadata: {
          duration: transcription.duration,
          language: transcription.language,
          model: 'whisper-large-v3',
          audioSize: audioBuffer.length,
          audioFormat
        }
      });

    } catch (error) {
      console.error('🎤 STT Error:', error);
      
      // Handle specific error types
      let errorMessage = 'Transcription failed';
      let statusCode = 500;

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'Invalid API key';
          statusCode = 401;
        } else if (error.message.includes('quota')) {
          errorMessage = 'API quota exceeded';
          statusCode = 429;
        } else if (error.message.includes('file too large')) {
          errorMessage = 'Audio file too large (max 25MB)';
          statusCode = 413;
        } else if (error.message.includes('invalid')) {
          errorMessage = 'Invalid audio format';
          statusCode = 400;
        }
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/ai/speech-to-text/health - Health check endpoint
  app.get('/api/ai/speech-to-text/health', async (req: Request, res: Response) => {
    try {
      const client = getGroqClient();
      
      if (!client) {
        return res.json({
          success: true,
          service: 'speech-to-text',
          status: 'misconfigured',
          message: 'GROQ_API_KEY not configured',
          timestamp: new Date().toISOString()
        });
      }

      // Test API connectivity with a simple request
      try {
        const models = await client.models.list();
        const whisperModels = models.data?.filter((model: any) => 
          model.id.includes('whisper')
        );

        res.json({
          success: true,
          service: 'speech-to-text',
          status: 'healthy',
          apiKey: 'configured',
          availableModels: whisperModels?.map((model: any) => model.id) || [],
          timestamp: new Date().toISOString()
        });

      } catch (apiError) {
        res.json({
          success: true,
          service: 'speech-to-text',
          status: 'unhealthy',
          error: 'API connectivity test failed',
          timestamp: new Date().toISOString()
        });
      }

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
