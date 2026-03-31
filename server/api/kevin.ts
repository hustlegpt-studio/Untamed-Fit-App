import type { Express, Request, Response } from "express";
import { kevinAI } from "../ai/kevin";

export function registerKevinRoutes(app: Express): void {
  // Chat endpoint for Train With Kevin AI
  app.post("/api/kevin/chat", async (req: Request, res: Response) => {
    try {
      const { message, conversationHistory = [] } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          error: "Message is required and must be a string"
        });
      }

      // Validate conversation history format
      if (!Array.isArray(conversationHistory)) {
        return res.status(400).json({
          error: "conversationHistory must be an array"
        });
      }

      // Generate AI response
      const aiResponse = await kevinAI.generateResponse(message, conversationHistory);

      // Return the AI response with metadata
      res.json({
        success: true,
        response: aiResponse.response,
        metadata: {
          modelName: aiResponse.modelName,
          personaName: aiResponse.personaName,
          nameCycled: aiResponse.cycled,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error("Kevin AI chat error:", error);
      res.status(500).json({
        error: "Failed to generate response from Trainer KG",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
      });
    }
  });

  // Health check endpoint for AI services
  app.get("/api/kevin/health", async (req: Request, res: Response) => {
    try {
      const healthStatus = await kevinAI.healthCheck();
      const personaInfo = kevinAI.getPersonaInfo();

      res.json({
        success: true,
        status: "healthy",
        services: healthStatus,
        persona: personaInfo,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Kevin AI health check error:", error);
      res.status(500).json({
        error: "Health check failed",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
      });
    }
  });

  // Get current persona info
  app.get("/api/kevin/persona", (req: Request, res: Response) => {
    try {
      const personaInfo = kevinAI.getPersonaInfo();

      res.json({
        success: true,
        persona: personaInfo,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Kevin AI persona error:", error);
      res.status(500).json({
        error: "Failed to get persona info",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
      });
    }
  });

  // Reset persona cycle (for testing purposes)
  app.post("/api/kevin/persona/reset", (req: Request, res: Response) => {
    try {
      // Note: This would require adding a reset method to the KevinAIService class
      // For now, we'll just return current persona info
      const personaInfo = kevinAI.getPersonaInfo();

      res.json({
        success: true,
        message: "Persona reset not implemented yet",
        currentPersona: personaInfo,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Kevin AI persona reset error:", error);
      res.status(500).json({
        error: "Failed to reset persona",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
      });
    }
  });
}
