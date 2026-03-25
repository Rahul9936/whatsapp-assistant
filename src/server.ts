import express from "express";
import { handleVerification, handleIncoming } from "./webhook";

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

  return app;
}
