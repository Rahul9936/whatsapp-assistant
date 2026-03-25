import { env } from "./config";
import { createServer } from "./server";

const app = createServer();

app.listen(env.port, () => {
  console.log(`[server] WhatsApp AI Agent running on port ${env.port}`);
  console.log(`[server] Webhook endpoint: POST /webhook`);
  console.log(`[server] Health check:     GET  /health`);
});
