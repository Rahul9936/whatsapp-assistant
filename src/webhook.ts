import { Request, Response } from "express";
import { env } from "./config";
import { shouldRespond } from "./filter";
import { generateReply } from "./agent";
import { sendMessage, markAsRead } from "./whatsapp";

// ── Webhook Verification (GET) ────────────────────────────────────────────────
// Meta calls this endpoint when you register the webhook in the developer console.
export function handleVerification(req: Request, res: Response): void {
  const mode = req.query["hub.mode"] as string;
  const token = req.query["hub.verify_token"] as string;
  const challenge = req.query["hub.challenge"] as string;

  if (mode === "subscribe" && token === env.whatsappWebhookVerifyToken) {
    console.log("[webhook] Verification successful");
    res.status(200).send(challenge);
  } else {
    console.warn("[webhook] Verification failed — token mismatch");
    res.sendStatus(403);
  }
}

// ── Incoming Message Handler (POST) ───────────────────────────────────────────
export async function handleIncoming(req: Request, res: Response): Promise<void> {
  // Always respond 200 immediately so Meta doesn't retry the webhook
  res.sendStatus(200);

  try {
    const body = req.body;

    if (body.object !== "whatsapp_business_account") return;

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    for (const message of messages) {
      // Only handle text messages for now
      if (message.type !== "text") {
        console.log(`[webhook] Skipping non-text message (type: ${message.type})`);
        continue;
      }

      const senderPhone: string = message.from;
      const messageId: string = message.id;
      const messageText: string = message.text?.body ?? "";

      console.log(`[webhook] Received from ${senderPhone}: "${messageText}"`);

      // Mark as read (shows blue ticks)
      try {
        await markAsRead(messageId);
      } catch (err) {
        console.warn("[webhook] Failed to mark message as read:", err);
      }

      if (!shouldRespond(senderPhone, messageText)) continue;

      // Generate and send the AI reply
      console.log(`[agent] Generating reply for ${senderPhone}...`);
      const reply = await generateReply(senderPhone, messageText);
      console.log(`[agent] Reply: "${reply}"`);

      await sendMessage(senderPhone, reply);
      console.log(`[whatsapp] Sent reply to ${senderPhone}`);
    }
  } catch (err) {
    console.error("[webhook] Error processing incoming message:", err);
  }
}
