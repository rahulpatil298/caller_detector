import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transcription: text("transcription").notNull(),
  speaker: text("speaker").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isScam: boolean("is_scam").default(false),
  confidence: integer("confidence").default(0),
  scamPatterns: jsonb("scam_patterns"),
  sessionId: varchar("session_id").notNull(),
});

export const scamDetections = pgTable("scam_detections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  scamType: text("scam_type").notNull(),
  patterns: jsonb("patterns").notNull(),
  confidence: integer("confidence").notNull(),
  analysis: text("analysis").notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  totalScamsDetected: integer("total_scams_detected").default(0),
  isActive: boolean("is_active").default(true),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  timestamp: true,
});

export const insertScamDetectionSchema = createInsertSchema(scamDetections).omit({
  id: true,
  detectedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  startedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertScamDetection = z.infer<typeof insertScamDetectionSchema>;
export type ScamDetection = typeof scamDetections.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
