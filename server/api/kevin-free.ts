import express from 'express';
import { kevinFreeAIService } from '../ai/kevin-free';

const router = express.Router();

// Export function to register routes
export function registerKevinFreeRoutes(app: express.Application) {
  // Main chat endpoint for Train With Kevin AI panel
  app.post('/api/kevin-free/chat', async (req, res) => {
    try {
      console.log('📨 Received chat request:', req.body);
      const { message, conversationHistory } = req.body;

      // Validate request
      if (!message || typeof message !== 'string') {
        console.log('❌ Invalid message format');
        return res.status(400).json({
          success: false,
          error: 'Message is required and must be a string'
        });
      }

      if (!conversationHistory || !Array.isArray(conversationHistory)) {
        console.log('❌ Invalid conversation history format');
        return res.status(400).json({
          success: false,
          error: 'Conversation history is required and must be an array'
        });
      }

      console.log('🤖 Calling AI service with message:', message);
      console.log('📚 Conversation history length:', conversationHistory.length);

      // Validate conversation history format
      const isValidHistory = conversationHistory.every(msg => 
        typeof msg === 'object' && 
        typeof msg.role === 'string' && 
        typeof msg.content === 'string' &&
        ['user', 'assistant', 'system'].includes(msg.role)
      );

      if (!isValidHistory) {
        return res.status(400).json({
          success: false,
          error: 'Conversation history must be an array of objects with role and content properties'
        });
      }

      // Generate AI response
      console.log('🧠 Calling kevinFreeAIService.generateResponse...');
      const aiResponse = await kevinFreeAIService.generateResponse({
        message: message.trim(),
        conversationHistory
      });
      
      console.log('✅ AI Service Response:', aiResponse);

      // Return successful response
      console.log('📤 Sending response to client:', {
        success: true,
        response: aiResponse.response,
        modelName: aiResponse.modelName,
        personaName: aiResponse.personaName,
        profileUpdated: aiResponse.profileUpdated || false,
        needsProfileConfirmation: aiResponse.needsProfileConfirmation || false
      });
      
      res.json({
        success: true,
        response: aiResponse.response,
        modelName: aiResponse.modelName,
        personaName: aiResponse.personaName,
        profileUpdated: aiResponse.profileUpdated || false,
        needsProfileConfirmation: aiResponse.needsProfileConfirmation || false,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Kevin Free AI Chat Error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate response from Trainer KG',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Health check endpoint for all free AI providers
  app.get('/api/kevin-free/health', async (req, res) => {
    try {
      const healthStatus = await kevinFreeAIService.healthCheck();
      
      const allHealthy = Object.values(healthStatus).every(status => status === true);
      const statusCode = allHealthy ? 200 : 503;

      res.status(statusCode).json({
        success: allHealthy,
        status: allHealthy ? 'healthy' : 'degraded',
        services: healthStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });

    } catch (error) {
      console.error('Health Check Error:', error);
      
      res.status(500).json({
        success: false,
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get current persona information
  app.get('/api/kevin-free/persona', (req, res) => {
    try {
      const personaInfo = kevinFreeAIService.getPersonaInfo();
      
      res.json({
        success: true,
        persona: personaInfo,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Persona Info Error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to get persona information',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Reset persona (for testing purposes)
  app.post('/api/kevin-free/persona/reset', (req, res) => {
    try {
      kevinFreeAIService.resetPersona();
      
      const newPersonaInfo = kevinFreeAIService.getPersonaInfo();
      
      res.json({
        success: true,
        message: 'Persona reset successfully',
        persona: newPersonaInfo,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Persona Reset Error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to reset persona',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get profile status
  app.get('/api/kevin-free/profile', async (req, res) => {
    try {
      // Get profile data from frontend (passed in query or session)
      const profileData = req.query.profile ? JSON.parse(req.query.profile as string) : {};
      const profileStatus = await kevinFreeAIService.getProfileStatus(profileData);
      
      res.json({
        success: true,
        ...profileStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Profile status error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to get profile status",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Update profile directly (for testing/admin purposes)
  app.post('/api/kevin-free/profile/update', async (req, res) => {
    try {
      const { profileUpdates } = req.body;

      if (!profileUpdates || typeof profileUpdates !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Profile updates are required and must be an object'
        });
      }

      // This would integrate with the profile manager
      // For now, return success for testing
      res.json({
        success: true,
        message: 'Profile updates received',
        updates: profileUpdates,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Profile Update Error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Test endpoint to verify AI service is working
  app.get('/api/kevin-free/test', async (req, res) => {
    try {
      const testMessage = "Hello, this is a test message";
      const testResponse = await kevinFreeAIService.generateResponse({
        message: testMessage,
        conversationHistory: []
      });

      res.json({
        success: true,
        test: {
          input: testMessage,
          output: testResponse.response,
          modelName: testResponse.modelName,
          personaName: testResponse.personaName,
          responseTime: Date.now()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Test Endpoint Error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Test endpoint failed',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  });
}

// Middleware to log all requests (for debugging)
router.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('User-Agent');
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  next();
});

// Error handling middleware
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Kevin Free Route Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

export default router;
