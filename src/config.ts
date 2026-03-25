import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  whatsappPhoneNumberId: requireEnv("WHATSAPP_PHONE_NUMBER_ID"),
  whatsappAccessToken: requireEnv("WHATSAPP_ACCESS_TOKEN"),
  whatsappWebhookVerifyToken: requireEnv("WHATSAPP_WEBHOOK_VERIFY_TOKEN"),
  openaiApiKey: requireEnv("OPENAI_API_KEY"),
  port: parseInt(process.env["PORT"] ?? "3000", 10),
};

export interface AppConfig {
  filters: {
    mode: "allowlist" | "blocklist" | "all";
    allowedContacts: string[];
    blockedContacts: string[];
    keywords: {
      enabled: boolean;
      matchAny: string[];
    };
  };
  agent: {
    model: string;
    systemPrompt: string;
    maxHistoryMessages: number;
  };
}

const configPath = path.resolve(process.cwd(), "config.json");
const raw = fs.readFileSync(configPath, "utf-8");
export const appConfig: AppConfig = JSON.parse(raw);
