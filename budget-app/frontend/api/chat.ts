import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { messages, categories, today } = req.body as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    categories: { name: string; type: string }[];
    today: string;
  };

  const categoryList = categories
    .map((c) => `${c.name}(${c.type === 'expense' ? '支出' : '収入'})`)
    .join('、');

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `あなたは親しみやすい日本語の家計簿アシスタントです。

今日の日付: ${today}
利用可能なカテゴリ: ${categoryList}

ユーザーが収入・支出について話したとき、必ず以下のJSON形式のみで返答してください:
{"reply":"返答文","transaction":{"amount":金額(数値のみ),"type":"expense"または"income","category_name":"カテゴリ名","description":"説明","date":"YYYY-MM-DD"}}

取引がない通常の会話の場合:
{"reply":"返答文","transaction":null}

重要:
- 必ずJSON形式のみで返答。マークダウンや説明文は不要
- amountは整数で、円記号なし
- category_nameは利用可能なカテゴリからなるべく近いものを選ぶ
- dateは今日の日付を使用（「昨日」なら昨日の日付）`,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : text);
    res.json(parsed);
  } catch (err: any) {
    console.error('Chat API error:', err?.status, err?.message, err?.error);
    const detail = err?.error?.error?.message || err?.message || 'unknown';
    res.status(500).json({
      reply: `エラー: ${detail}`,
      transaction: null,
    });
  }
}
