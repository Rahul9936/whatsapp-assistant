import axios from "axios";
import { env } from "./config";

const BASE_URL = "https://graph.facebook.com/v19.0";

/**
 * Sends a text message to a WhatsApp contact via the Meta Cloud API.
 */
export async function sendMessage(to: string, text: string): Promise<void> {
  const url = `${BASE_URL}/${env.whatsappPhoneNumberId}/messages`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${env.whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Marks an incoming message as read so the sender sees the double-blue-tick.
 */
export async function markAsRead(messageId: string): Promise<void> {
  const url = `${BASE_URL}/${env.whatsappPhoneNumberId}/messages`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    },
    {
      headers: {
        Authorization: `Bearer ${env.whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}
