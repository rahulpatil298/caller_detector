import { type Conversation, type InsertConversation, type ScamDetection, type InsertScamDetection, type Session, type InsertSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationsBySession(sessionId: string): Promise<Conversation[]>;
  
  // Scam Detections
  createScamDetection(detection: InsertScamDetection): Promise<ScamDetection>;
  getRecentScamDetections(limit?: number): Promise<ScamDetection[]>;
  
  // Sessions
  createSession(): Promise<Session>;
  getActiveSession(): Promise<Session | undefined>;
  endSession(sessionId: string): Promise<void>;
  getSessionStats(sessionId: string): Promise<{
    totalConversations: number;
    totalScams: number;
    protectionRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private conversations: Map<string, Conversation>;
  private scamDetections: Map<string, ScamDetection>;
  private sessions: Map<string, Session>;

  constructor() {
    this.conversations = new Map();
    this.scamDetections = new Map();
    this.sessions = new Map();
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      timestamp: new Date(),
      isScam: insertConversation.isScam ?? false,
      confidence: insertConversation.confidence ?? 0,
      scamPatterns: insertConversation.scamPatterns ?? null,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversationsBySession(sessionId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createScamDetection(insertDetection: InsertScamDetection): Promise<ScamDetection> {
    const id = randomUUID();
    const detection: ScamDetection = {
      ...insertDetection,
      id,
      detectedAt: new Date(),
      conversationId: insertDetection.conversationId ?? null,
    };
    this.scamDetections.set(id, detection);
    return detection;
  }

  async getRecentScamDetections(limit: number = 10): Promise<ScamDetection[]> {
    return Array.from(this.scamDetections.values())
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
      .slice(0, limit);
  }

  async createSession(): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      id,
      startedAt: new Date(),
      endedAt: null,
      totalScamsDetected: 0,
      isActive: true,
    };
    this.sessions.set(id, session);
    return session;
  }

  async getActiveSession(): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(session => session.isActive);
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.endedAt = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  async getSessionStats(sessionId: string): Promise<{
    totalConversations: number;
    totalScams: number;
    protectionRate: number;
  }> {
    const conversations = Array.from(this.conversations.values())
      .filter(conv => conv.sessionId === sessionId);
    
    const totalConversations = conversations.length;
    const totalScams = conversations.filter(conv => conv.isScam).length;
    const protectionRate = totalConversations > 0 ? 
      ((totalConversations - totalScams) / totalConversations) * 100 : 100;

    return {
      totalConversations,
      totalScams,
      protectionRate: Math.round(protectionRate * 10) / 10,
    };
  }
}

export const storage = new MemStorage();
