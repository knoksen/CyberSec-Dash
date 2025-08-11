import { app, HttpRequest, HttpResponseInit } from "@azure/functions";

app.http("alerts", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (_req: HttpRequest): Promise<HttpResponseInit> => {
    const stream = new ReadableStream({
      start(controller) {
        const send = (event: any) => controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
        const timer = setInterval(() => {
          const evt = {
            agentId: Math.floor(Math.random() * 8) + 1,
            delta: Math.random() < 0.5 ? 1 : -1,
          };
          send(evt);
        }, 2500);
        // @ts-ignore
        controller.close = () => clearInterval(timer);
      },
    });
    return {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*"
      },
      body: stream as any,
    };
  },
});
