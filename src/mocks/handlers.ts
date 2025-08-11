import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/chat", async () => HttpResponse.json({ role: "model", content: "Acknowledged." })),
  http.get("/api/alerts", async () => new HttpResponse("data: {\"agentId\":1,\"delta\":1}\n\n", { headers: { "Content-Type": "text/event-stream" } })),
];
