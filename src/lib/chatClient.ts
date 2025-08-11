// src/lib/chatClient.ts
// Centralized chat API client for AI chat

/**
 * Sends a chat message to the AI backend and returns the reply.
 * Replace this stub with your actual API call.
 */
/**
 * Sends a chat message to the backend API, which securely calls Gemini.
 * @param input The user input string
 * @param history Optional chat history (array of {role, content})
 */
export async function sendChat(input: string, history: Array<{ role: 'user' | 'model'; content: string }> = []): Promise<string> {
  const messages = [...history, { role: 'user', content: input }];
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Chat API error');
  }
  const data = await res.json();
  return data.content || '';
}
