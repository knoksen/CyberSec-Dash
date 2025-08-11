
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { GoogleGenAI, Chat as GeminiChat } from "@google/genai";
import { ChatMessage } from '../types';
import { Bot, User, Send } from 'lucide-react';

const AiChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<GeminiChat | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialization Effect
  useEffect(() => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: "You are a friendly and helpful cybersecurity assistant for the Cyber Agents Dashboard. Your goal is to answer user questions about online safety, security best practices, and the roles of the agents. Keep your answers concise, informative, and easy to understand. Do not use markdown.",
        },
      });
      setHistory([{ id: self.crypto.randomUUID(), role: 'model', content: "Hello! I'm the security AI assistant. Ask me anything about cybersecurity or our agents." }]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not initialize the AI chat service.";
      console.error("Failed to initialize chat:", message);
      setError(message);
    }
  }, []);

  // Scroll-to-bottom Effect
  useEffect(() => {
    chatHistoryRef.current?.scrollTo({ top: chatHistoryRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, streamingMessage]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !chatRef.current) return;

    setIsSending(true);
    setError(null);

    const userMessage: ChatMessage = { id: self.crypto.randomUUID(), role: 'user', content: input };
    setHistory(prev => [...prev, userMessage]);

    const messageToSend = input;
    setInput('');
    
    const modelPlaceholder: ChatMessage = { id: self.crypto.randomUUID(), role: 'model', content: '', streaming: true };
    setStreamingMessage(modelPlaceholder);

    let finalContent = '';
    let streamError = null;

    try {
      const stream = await chatRef.current.sendMessageStream({ message: messageToSend });
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          finalContent += chunkText;
          setStreamingMessage(prev => prev ? { ...prev, content: finalContent } : null);
        }
      }
    } catch (err) {
        streamError = err;
        const errorMessage = "An error occurred while sending the message. Please try again.";
        console.error("Error sending message:", err);
        setError(errorMessage);
        finalContent = errorMessage;
    } finally {
      const finalMessage: ChatMessage = {
          id: modelPlaceholder.id,
          role: 'model',
          content: finalContent || (streamError ? "My apologies, I couldn't generate a response." : "Sorry, I seem to be having trouble connecting."),
      };
      setHistory(prev => [...prev, finalMessage]);
      setStreamingMessage(null);
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const renderMessage = (msg: ChatMessage) => (
    <div key={msg.id} className={`flex items-start gap-3 max-w-xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {msg.role === 'model' ? <Bot size={20} /> : <User size={20} />}
        </div>
        <div className={`rounded-lg px-4 py-2 text-gray-800 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {msg.streaming && msg.content === '' ? (
                 <div className="flex items-center h-6">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1.5" style={{animationDelay: '0s'}}></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1.5" style={{animationDelay: '0.1s'}}></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                  </div>
            ) : (
                 <p className="whitespace-pre-wrap">{msg.content}</p>
            )}
        </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-[600px] ring-1 ring-gray-900/5">
        <div ref={chatHistoryRef} className="flex-grow overflow-y-auto p-6 space-y-6">
            {history.map(renderMessage)}
            {streamingMessage && renderMessage(streamingMessage)}
        </div>
      <div className="border-t p-4 bg-white rounded-b-xl">
        <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
            }}
            placeholder={error || "Ask about online safety..."}
            aria-label="Chat input"
            disabled={isSending}
            className={`flex-1 bg-gray-100 border-2 border-transparent rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${error ? 'placeholder-red-500' : 'placeholder-gray-500'}`}
            />
            <button
            type="submit"
            disabled={isSending || !input.trim()}
            aria-label="Send message"
            className="bg-blue-600 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
            <Send size={20} />
            </button>
        </form>
      </div>
    </div>
  );
};

export default AiChat;