import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

app.http("chat", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") {
      return {
        status: 204,
        headers: cors(),
      };
    }

    const body = await req.json();
    const { messages } = body as { messages: Array<{ role: "user" | "model"; content: string }> };

    if (!process.env.GEMINI_API_KEY) {
      return { status: 500, body: "Missing GEMINI_API_KEY", headers: cors() };
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Convert chat history into prompt content
      const parts = messages.map(m => `${m.role}: ${m.content}`).join("\n");
      const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: parts }] }] });

      const text = result.response.text();
      return {
        status: 200,
        jsonBody: { role: "model", content: text },
        headers: cors(),
      };
    } catch (e: any) {
      return { status: 500, body: e?.message ?? "Chat error", headers: cors() };
    }
  },
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
