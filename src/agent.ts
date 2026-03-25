import OpenAI from "openai";
import { env, appConfig } from "./config";
import { getHistory, addMessage, ChatMessage } from "./memory";

const openai = new OpenAI({ apiKey: env.openaiApiKey });

/**
 * Generates an AI reply for a given contact's incoming message.
 * Maintains per-contact conversation history for context.
 */
export async function generateReply(
  contactPhone: string,
  incomingText: string
): Promise<string> {
  // Record the incoming message
  addMessage(contactPhone, { role: "user", content: incomingText });

  const history: ChatMessage[] = getHistory(contactPhone);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: appConfig.agent.systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await openai.chat.completions.create({
    model: appConfig.agent.model,
    messages,
    temperature: 0.7,
  });

  const reply = completion.choices[0]?.message?.content;
  if (!reply) {
    throw new Error("OpenAI returned an empty response");
  }

  // Record the assistant's reply into history
  addMessage(contactPhone, { role: "assistant", content: reply });

  return reply;
}
