import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeForScam } from "./services/gemini";
import { insertConversationSchema, insertScamDetectionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start a new monitoring session
  app.post("/api/sessions/start", async (req, res) => {
    try {
      const session = await storage.createSession();
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to start session" });
    }
  });

  // End current session
  app.post("/api/sessions/end", async (req, res) => {
    try {
      const { sessionId } = req.body;
      await storage.endSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  // Get active session
  app.get("/api/sessions/active", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active session" });
    }
  });

  // Get session stats
  app.get("/api/sessions/:sessionId/stats", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const stats = await storage.getSessionStats(sessionId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get session stats" });
    }
  });

  // Add conversation and analyze for scam
  app.post("/api/conversations/analyze", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      
      // Analyze the text for scam patterns
      const analysis = await analyzeForScam(conversationData.transcription);
      
      // Create conversation record
      const conversation = await storage.createConversation({
        ...conversationData,
        isScam: analysis.isScam,
        confidence: analysis.confidence,
        scamPatterns: analysis.patterns,
      });

      // If scam detected, create detection record
      if (analysis.isScam && conversation.id) {
        await storage.createScamDetection({
          conversationId: conversation.id,
          scamType: analysis.scamType,
          patterns: analysis.patterns,
          confidence: analysis.confidence,
          analysis: analysis.analysis,
        });
      }

      res.json({
        conversation,
        analysis,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze conversation" });
    }
  });

  // Get conversations for a session
  app.get("/api/conversations/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const conversations = await storage.getConversationsBySession(sessionId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  // Get recent scam detections
  app.get("/api/scam-detections/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const detections = await storage.getRecentScamDetections(limit);
      res.json(detections);
    } catch (error) {
      res.status(500).json({ error: "Failed to get recent detections" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
