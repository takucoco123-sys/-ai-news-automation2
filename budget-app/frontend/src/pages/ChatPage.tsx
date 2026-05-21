import { useEffect, useRef, useState } from 'react';
import { createTransaction, getCategories } from '../api/client';
import type { Category } from '../types';

type ApiMessage = { role: 'user' | 'assistant'; content: string };

interface ChatMessage extends ApiMessage {
  savedTx?: { amount: number; type: 'income' | 'expense'; category_name: string } | null;
}

const today = new Date().toISOString().slice(0, 10);

const GREETING =
  'こんにちは。\n今日はお金を使いましたか？\n\n「コンビニで480円」「スタバで650円使った」のように教えてくれれば、自動で記録します。';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getCategories().then(setCategories); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const apiMessages: ApiMessage[] = history
        .map((m) => ({ role: m.role, content: m.content }))
        .filter((m, i) => !(i === 0 && m.role === 'assistant'));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, categories: categories.map((c) => ({ name: c.name, type: c.type })), today }),
      });

      const data = await res.json() as {
        reply: string;
        transaction: { amount: number; type: 'income' | 'expense'; category_name: string; description: string; date: string } | null;
      };

      let savedTx: ChatMessage['savedTx'] = null;

      if (data.transaction) {
        const tx = data.transaction;
        const cat = categories.find((c) => c.name === tx.category_name) ?? categories.find((c) => tx.category_name.includes(c.name)) ?? categories.find((c) => c.type === tx.type);
        if (cat) {
          await createTransaction({ amount: Math.abs(tx.amount), type: tx.type, category_id: cat.id, description: tx.description || undefined, date: tx.date || today });
          savedTx = { amount: Math.abs(tx.amount), type: tx.type, category_name: cat.name };
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? 'もう一度お試しください。', savedTx }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'エラーが発生しました。もう一度お試しください。' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto h-full">
      {/* Desktop header */}
      <div className="hidden md:flex items-center gap-3 mb-6 flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold-border)' }}>
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">AIアシスタント</h1>
          <p className="text-xs" style={{ color: '#7a6f5e' }}>Claude Haiku · 自然言語で記録</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3" style={{ maxHeight: 'calc(100dvh - 180px)' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 mt-1" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold-border)' }}>
                <span className="text-sm">🤖</span>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words ${
                m.role === 'user'
                  ? 'text-[#1a1410] rounded-br-sm'
                  : 'glass text-[#e8e4da] rounded-bl-sm'
              }`}
              style={m.role === 'user' ? { background: 'linear-gradient(135deg, #dfc17a, #c9a84c)', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' } : {}}
            >
              {m.content}
              {m.savedTx && (
                <div className="mt-3 rounded-xl px-3 py-2 text-xs flex items-center gap-2" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid var(--gold-border)', color: '#c9a84c' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#c9a84c', boxShadow: '0 0 8px rgba(201,168,76,0.8)' }} />
                  {m.savedTx.type === 'expense' ? '支出' : '収入'} ¥{m.savedTx.amount.toLocaleString()} ({m.savedTx.category_name}) を記録しました
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-2" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold-border)' }}>
              <span className="text-sm">🤖</span>
            </div>
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: '#c9a84c' }} />
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: '#c9a84c' }} />
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: '#c9a84c' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 mt-2 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="例: コンビニで500円使った"
          className="flex-1 rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all"
          style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#e8e4da' }}
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()} className="btn-gold px-5 py-3 rounded-2xl text-sm">
          送信
        </button>
      </div>
    </div>
  );
}
