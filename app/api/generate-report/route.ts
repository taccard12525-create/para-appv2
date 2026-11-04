import { NextRequest, NextResponse } from 'next/server';
import { calculatePairScore, PairAnswers, PairScore } from '@/lib/scoring';
import { CATEGORIES, CategoryKey, CLOSED_QUESTIONS, OPEN_QUESTIONS } from '@/lib/questions';
import { gigaChatCompletion } from '@/lib/gigachat';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, answers } = body as { paymentId: string; answers: PairAnswers };

    if (!paymentId || !answers?.partner1 || !answers?.partner2) {
      return NextResponse.json({ error: 'Нет данных' }, { status: 400 });
    }

    if (!(process.env.MOCK_MODE === 'true' && String(paymentId).startsWith('MOCK_'))) {
      const shopId = process.env.YOOKASSA_SHOP_ID;
      const secretKey = process.env.YOOKASSA_SECRET_KEY;
      if (!shopId || !secretKey) return NextResponse.json({ error: 'ЮKassa не настроена' }, { status: 500 });
      
      const verify = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
        headers: { Authorization: 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64') },
      });
      if (!verify.ok) return NextResponse.json({ error: 'Платёж не найден' }, { status: 400 });
      const pay = await verify.json();
      if (pay.status !== 'succeeded') return NextResponse.json({ error: 'Платёж не оплачен' }, { status: 402 });
    }

    const scores = calculatePairScore(answers);

    let report;
    if (process.env.GIGACHAT_AUTH_KEY && process.env.GIGACHAT_AUTH_KEY !== 'ваш_новый_ключ_здесь') {
      report = await callGigaChat(scores, answers);
    } else {
      report = mockReport(scores);
    }

    return NextResponse.json({ scores, report });
  } catch (e) {
    console.error('generate-report error:', e);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}

const SYSTEM_PROMPT = `Ты — психолог. Пиши разбор для пары в формате JSON.
ПРАВИЛА:
- Пиши компактно, чтобы не превышать лимиты.
- overall_summary: ровно 2 абзаца.
- personal_insights: по 1-2 предложения на партнёра.
- green_flags, red_flags, recommendations: короткие тезисы (до 10 слов).
- Никакого markdown, только чистый JSON.
- Внутри строк ЗАПРЕЩЕНЫ переносы строк. Используй пробелы.

ФОРМАТ:
{
  "headline": "короткая фраза",
  "overall_summary": "2 абзаца",
  "green_flags": ["...", "..."],
  "red_flags": ["...", "..."],
  "divergences": [{"title": "...", "description": "...", "partner1_sees": "...", "partner2_sees": "..."}],
  "personal_insights": [{"partner": 1, "insight": "..."}, {"partner": 2, "insight": "..."}],
  "problem_areas": [{"title": "...", "description": "..."}],
  "recommendations": ["...", "..."],
  "next_steps": "1 абзац"
}`;

async function callGigaChat(scores: PairScore, answers: PairAnswers) {
  const catLines = (Object.keys(scores.combined) as CategoryKey[])
    .map((k) => `- ${CATEGORIES[k].title}: П1=${scores.partner1[k]}, П2=${scores.partner2[k]}, разница=${scores.divergence[k]}`)
    .join('\n');

  const closedToText = (closed: Record<number, number>) =>
    CLOSED_QUESTIONS.map((q) => {
      const v = closed[q.id];
      if (v === undefined) return null;
      if (q.type === 'multi') return `• ${q.text} → ${q.options?.find((o) => o.value === v)?.label ?? v}`;
      return `• ${q.text} → ${v}/5`;
    }).filter(Boolean).join('\n');

  const openToText = (open: Record<number, string>) =>
    OPEN_QUESTIONS.map((q) => {
      const a = (open[q.id] || '').trim();
      return a ? `В: ${q.text}\nО: ${a}` : null;
    }).filter(Boolean).join('\n\n');

  const userPrompt = `Совместимость: ${scores.overall}/100. Гармония: ${scores.harmony}/100.
Сферы:
${catLines}

Тревоги: ${scores.redFlags.join('; ') || 'нет'}
Критические: ${scores.criticalWarnings.join('; ') || 'нет'}

П1 закрытые: ${closedToText(answers.partner1.closed)}
П1 открытые: ${openToText(answers.partner1.open) || 'нет'}
П2 закрытые: ${closedToText(answers.partner2.closed)}
П2 открытые: ${openToText(answers.partner2.open) || 'нет'}

Напиши разбор, цитируя открытые ответы.`;

  try {
    const raw = await gigaChatCompletion(
      [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }],
      { temperature: 0.3, max_tokens: 1500 }
    );

    console.log('\n🤖 СЫРОЙ ОТВЕТ GIGACHAT (длина:', raw.length, 'символов)\n');

    const parsed = robustParseJSON(raw);

    if (!parsed.headline || !parsed.overall_summary) {
       throw new Error('Структура JSON не соответствует ожиданиям.');
    }

    return parsed;
  } catch (e) {
    console.error('❌ GigaChat generation failed:', e);
    return mockReport(scores);
  }
}

// === УМНЫЙ ЛЕКАРЬ JSON (Auto-Healer) ===
function robustParseJSON(raw: string) {
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  
  // Если GigaChat оборвался, end может быть меньше start или вообще отсутствовать
  if (start >= 0) {
    cleaned = end > start ? cleaned.slice(start, end + 1) : cleaned.slice(start);
  }

  // 1. Первая попытка
  try { return JSON.parse(cleaned); } catch (e) {}

  // 2. Чистим невидимые символы
  let sanitized = cleaned.replace(/[\n\r\t]+/g, ' ');
  try { return JSON.parse(sanitized); } catch (e) {}

  // 3. ЛЕКАРЬ: Автоматически закрываем незакрытые кавычки и скобки
  console.warn('⚠️ JSON оборван. Запускаю авто-восстановление...');
  let inString = false;
  let escapeNext = false;
  const stack: string[] = [];

  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\') { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (!inString) {
      if (char === '{' || char === '[') stack.push(char);
      else if (char === '}' || char === ']') stack.pop();
    }
  }

  let healed = sanitized;
  if (inString) healed += '"'; // Закрываем оборванную строку
  healed = healed.replace(/,\s*$/, ''); // Убираем висячую запятую в конце

  // Закрываем все открытые скобки в обратном порядке
  while (stack.length > 0) {
    const open = stack.pop();
    if (open === '{') healed += '}';
    if (open === '[') healed += ']';
  }

  try {
    return JSON.parse(healed);
  } catch (finalError) {
    throw new Error('Не удалось восстановить JSON после всех попыток: ' + finalError);
  }
}

// === ЗАГЛУШКА (без изменений) ===
function mockReport(scores: PairScore) {
  const strongKeys = (Object.keys(scores.combined) as CategoryKey[]).filter((k) => scores.combined[k] >= 70);
  const weakKeys = (Object.keys(scores.combined) as CategoryKey[]).filter((k) => scores.combined[k] < 50);
  const divergedKeys = (Object.keys(scores.divergence) as CategoryKey[]).filter((k) => scores.divergence[k] >= 25);

  const strong = strongKeys.map((k) => CATEGORIES[k].title);
  const weak = weakKeys.map((k) => CATEGORIES[k].title);
  const diverged = divergedKeys.map((k) => CATEGORIES[k].title);

  return {
    headline: scores.overall >= 70 ? 'У вас крепкая связь — с точками роста' : scores.overall >= 45 ? 'Есть любовь. Есть над чем поработать' : 'Отношениям нужна бережная поддержка',
    overall_summary: `Это демонстрационный отчёт. Совместимость — ${scores.overall}/100, гармония — ${scores.harmony}/100.\n\nСильные стороны: ${strong.join(', ') || 'пока не выявлены'}.\n\nПроблемные зоны: ${weak.join(', ') || 'не обнаружены'}.\n\nРасхождения: ${diverged.join(', ') || 'нет'}.`,
    green_flags: strong.length ? strong.map((s) => `Сфера «${s}» — ваша опора`) : ['Пока не выявлены явно'],
    red_flags: scores.redFlags,
    divergences: divergedKeys.map((k) => ({ title: CATEGORIES[k].title, description: `Вы видите эту сферу по-разному.`, partner1_sees: `Оценка П1: ${scores.partner1[k]}`, partner2_sees: `Оценка П2: ${scores.partner2[k]}` })),
    personal_insights: [
      { partner: 1, insight: 'В демо-режиме личные ответы не анализируются.' },
      { partner: 2, insight: 'В демо-режиме личные ответы не анализируются.' },
    ],
    problem_areas: weakKeys.map((k) => ({ title: CATEGORIES[k].title, description: `Средняя оценка ${scores.combined[k]}/100.` })),
    recommendations: ['Выделяйте 15 минут в день на разговор без телефонов', 'Говорите через «я-сообщения»', 'Раз в неделю — совместное занятие'],
    next_steps: 'Начните с одного честного разговора о том, что вас беспокоит.',
  };
}