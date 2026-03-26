import express from "express";
import { handleVerification, handleIncoming } from "./webhook";
import { generateReply } from "./agent";
import OpenAI from "openai";
import { env, appConfig } from "./config";

export function createServer(): express.Application {
  const app = express();

  // Parse JSON bodies from Meta webhook POST requests
  app.use(express.json());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // WhatsApp webhook — GET for verification, POST for incoming messages
  app.get("/webhook", handleVerification);
  app.post("/webhook", handleIncoming);

// OpenAI connectivity check
  app.get("/check_open_ai", async (_req, res) => {
    try {
      const openai = new OpenAI({ apiKey: env.openaiApiKey });
      await openai.chat.completions.create({
        model: appConfig.agent.model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
      });
      res.json({ status: "ok", model: appConfig.agent.model });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  return app;
}
