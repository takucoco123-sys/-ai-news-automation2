import { useEffect, useRef, useState } from 'react';
import { createTransaction, getCategories } from '../api/client';
import type { Category } from '../types';

type ApiMessage = { role: 'user' | 'assistant'; content: string };

interface ChatMessage extends ApiMessage {
  savedTx?: { amount: number; type: 'income' | 'expense'; category_name: string } | null;
}

const today = new Date().toISOString().slice(0, 10);

const GREETING =
  'こんにちは！\n今日はお金を使いましたか？\n\n「コンビニで480円」「スタバで650円使った」のように教えてもらえると自動で記録します 😊';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const apiMessages: ApiMessage[] = history.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          categories: categories.map((c) => ({ name: c.name, type: c.type })),
          today,
        }),
      });

      const data = await res.json() as {
        reply: string;
        transaction: {
          amount: number;
          type: 'income' | 'expense';
          category_name: string;
          description: string;
          date: string;
        } | null;
      };

      let savedTx: ChatMessage['savedTx'] = null;

      if (data.transaction) {
        const tx = data.transaction;
        const cat =
          categories.find((c) => c.name === tx.category_name) ??
          categories.find((c) => tx.category_name.includes(c.name)) ??
          categories.find((c) => c.type === tx.type);

        if (cat) {
          await createTransaction({
            amount: Math.abs(tx.amount),
            type: tx.type,
            category_id: cat.id,
            description: tx.description || null,
            date: tx.date || today,
          });
          savedTx = { amount: Math.abs(tx.amount), type: tx.type, category_name: cat.name };
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply ?? 'もう一度お試しください。', savedTx },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'エラーが発生しました。もう一度お試しください。' },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col max-w-xl mx-auto h-full">
      <h1 className="text-xl font-bold text-gray-900 mb-4 hidden md:block flex-shrink-0">
        AIアシスタント
      </h1>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-3 pb-3 max-h-[calc(100vh-200px)]"
        style={{ maxHeight: 'calc(100dvh - 200px)' }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <span className="text-xl mr-2 mt-1 flex-shrink-0">🤖</span>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
              }`}
            >
              {m.content}
              {m.savedTx && (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-700">
                  ✅ {m.savedTx.type === 'expense' ? '支出' : '収入'} ¥{m.savedTx.amount.toLocaleString()}{' '}
                  ({m.savedTx.category_name}) を保存しました
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <span className="text-xl mr-2">🤖</span>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <span className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-gray-100 mt-2 flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="例: コンビニで500円使った"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          送信
        </button>
      </div>
    </div>
  );
}
