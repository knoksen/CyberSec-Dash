import { useEffect, useMemo, useRef, useState } from 'react';
import { sendChat } from '../lib/chatClient';

/**
 * Chat message model
 */
export type ChatRole = 'user' | 'ai' | 'system';
export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number; // epoch ms
}

const LS_KEY = 'csd:chat:v1';

function uuid() {
  return (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string;
}

function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as ChatMessage[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(messages));
    } catch {
      // ignore quota
    }
  }, [messages]);

  const clear = () => setMessages([]);

  return { messages, setMessages, clear } as const;
}

export default function Chat() {
  const { messages, setMessages, clear } = useChatHistory();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;

    const userMsg: ChatMessage = { id: uuid(), role: 'user', text: input.trim(), createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setBusy(true);

    try {
      const reply = await sendChat(userMsg.text);
      const aiMsg: ChatMessage = { id: uuid(), role: 'ai', text: reply, createdAt: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      setInput('');
    } catch (err: any) {
      const aiMsg: ChatMessage = {
        id: uuid(),
        role: 'system',
        text: `Error: ${err?.message ?? 'Unknown error'}`,
        createdAt: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // submit via form
      (e.currentTarget.form as HTMLFormElement | undefined)?.requestSubmit();
    }
  }

  async function copyLast() {
    const last = [...messages].reverse().find(m => m.role !== 'system');
    if (last) await navigator.clipboard.writeText(last.text);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `chat-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      data-testid="chat"
      className="flex flex-col max-w-3xl mx-auto gap-4 p-4 border rounded-2xl shadow-sm bg-white"
      aria-label="AI chat"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Assistant Chat</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="copy-last-btn"
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
            onClick={copyLast}
            disabled={messages.length === 0}
            title="Copy last message"
          >
            Copy last
          </button>
          <button
            type="button"
            data-testid="export-btn"
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
            onClick={exportJson}
            disabled={messages.length === 0}
            title="Export chat as JSON"
          >
            Export
          </button>
          <button
            type="button"
            data-testid="clear-btn"
            className="px-3 py-1.5 border rounded-lg text-sm text-red-700 border-red-300 hover:bg-red-50"
            onClick={clear}
            title="Clear chat history"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        data-testid="chat-messages"
        className="min-h-[240px] max-h-[50vh] overflow-y-auto flex flex-col gap-3 pr-1"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 && (
          <div className="text-sm text-neutral-500">Ask anything about the dashboard, security posture, or risks.</div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          ref={inputRef}
          data-testid="chat-input"
          className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ask an agent… (Enter to send)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Chat input"
        />
        <button
          type="submit"
          data-testid="send-btn"
          className="px-4 py-2 rounded-xl border bg-blue-600 text-white disabled:opacity-50"
          disabled={!canSend}
          aria-busy={busy}
        >
          {busy ? 'Sending…' : 'Send'}
        </button>
      </form>
    </section>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';
  return (
    <div
      data-testid="chat-message"
      className={
        'max-w-[85%] rounded-2xl px-4 py-2 shadow ' +
        (isSystem
          ? 'self-center bg-yellow-50 text-yellow-900 text-sm'
          : isUser
          ? 'self-end bg-neutral-100'
          : 'self-start bg-blue-50 text-blue-900')
      }
      title={new Date(msg.createdAt).toLocaleString()}
      role="article"
      aria-label={isUser ? 'User message' : isSystem ? 'System message' : 'Assistant message'}
    >
      <pre className="whitespace-pre-wrap break-words font-sans text-[15px] leading-snug">{msg.text}</pre>
    </div>
  );
}
