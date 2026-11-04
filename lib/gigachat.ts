import { fetch as undiciFetch, Agent } from 'undici';
import { randomUUID } from 'crypto';

const dispatcher = new Agent({
  connect: { rejectUnauthorized: false },
  headersTimeout: 120_000,
  bodyTimeout: 120_000,
});

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) {
    return cachedToken.token;
  }

  const authKey = process.env.GIGACHAT_AUTH_KEY;
  if (!authKey) throw new Error('GIGACHAT_AUTH_KEY не задан в .env.local');

  const scope = process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS';

  const res = await undiciFetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'RqUID': randomUUID(),
      'Authorization': `Basic ${authKey}`,
    },
    body: `scope=${scope}`,
    dispatcher,
  });

  if (!res.ok) throw new Error(`GigaChat OAuth ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as { access_token: string; expires_at: number };
  cachedToken = { token: data.access_token, expiresAt: data.expires_at };
  return data.access_token;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function gigaChatCompletion(
  messages: ChatMessage[],
  options: { temperature?: number; model?: string; max_tokens?: number; retries?: number } = {},
): Promise<string> {
  const token = await getAccessToken();
  const maxRetries = options.retries ?? 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const res = await undiciFetch('https://api.giga.chat/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'ParaApp/1.0',
      },
      body: JSON.stringify({
        model: options.model || process.env.GIGACHAT_MODEL || 'GigaChat-2',
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens || 1500,
        // ВАЖНО: GigaChat не принимает {"type": "json_object"}.
        // Убираем этот параметр, чтобы избежать ошибки 400.
        // Модель будет генерировать текст, а robustParseJSON извлечёт из него JSON.
      }),
      dispatcher,
    });

    if (res.ok) {
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content || '';
    }

    if (res.status === 429) {
      attempt++;
      const waitMs = attempt * 3000;
      console.warn(`⏳ GigaChat 429 (Too Many Requests). Попытка ${attempt}/${maxRetries}. Ждём ${waitMs / 1000}с...`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    const errText = await res.text();
    throw new Error(`GigaChat API ${res.status}: ${errText}`);
  }

  throw new Error('GigaChat API: превышено максимальное количество попыток из-за лимита 429.');
}