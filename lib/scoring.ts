import { CLOSED_QUESTIONS, CATEGORIES, CategoryKey } from './questions';

export interface PartnerAnswers {
  closed: Record<number, number>;
  open: Record<number, string>;
}

export interface PairAnswers {
  partner1: PartnerAnswers;
  partner2: PartnerAnswers;
}

export interface PairScore {
  partner1: Record<CategoryKey, number>;
  partner2: Record<CategoryKey, number>;
  combined: Record<CategoryKey, number>;
  divergence: Record<CategoryKey, number>;
  overall: number;
  harmony: number;
  redFlags: string[];
  criticalWarnings: string[];
}

function scorePartner(closed: Record<number, number>) {
  const acc: Record<CategoryKey, { sum: number; count: number }> = {
    communication: { sum: 0, count: 0 },
    trust: { sum: 0, count: 0 },
    conflict: { sum: 0, count: 0 },
    connection: { sum: 0, count: 0 },
    values: { sum: 0, count: 0 },
    boundaries: { sum: 0, count: 0 },
    redflags: { sum: 0, count: 0 },
  };

  const redFlags: string[] = [];
  const critical: string[] = [];

  for (const q of CLOSED_QUESTIONS) {
    const raw = closed[q.id];
    if (raw === undefined) continue;
    let v: number;
    if (q.type === 'multi') v = raw * 20;
    else {
      v = ((raw - 1) / 4) * 100;
      if (q.reverse) v = 100 - v;
    }
    acc[q.category!].sum += v;
    acc[q.category!].count += 1;
    if (q.category === 'redflags' && v < 40) redFlags.push(q.text);
    if (q.critical && raw <= 1) critical.push(q.text);
  }

  const categories = {} as Record<CategoryKey, number>;
  (Object.keys(acc) as CategoryKey[]).forEach((k) => {
    const c = acc[k];
    categories[k] = c.count ? Math.round(c.sum / c.count) : 0;
  });

  return { categories, redFlags, critical };
}

export function calculatePairScore(answers: PairAnswers): PairScore {
  const p1 = scorePartner(answers.partner1.closed);
  const p2 = scorePartner(answers.partner2.closed);

  const combined = {} as Record<CategoryKey, number>;
  const divergence = {} as Record<CategoryKey, number>;
  let combinedW = 0, divW = 0, totalW = 0;

  (Object.keys(p1.categories) as CategoryKey[]).forEach((k) => {
    const avg = (p1.categories[k] + p2.categories[k]) / 2;
    const div = Math.abs(p1.categories[k] - p2.categories[k]);
    combined[k] = Math.round(avg);
    divergence[k] = Math.round(div);
    combinedW += avg * CATEGORIES[k].weight;
    divW += div * CATEGORIES[k].weight;
    totalW += CATEGORIES[k].weight;
  });

  const avgCombined = combinedW / totalW;
  const avgDiv = divW / totalW;
  const harmony = Math.round(Math.max(0, 100 - avgDiv));
  const overall = Math.round(avgCombined * 0.65 + harmony * 0.35);

  return {
    partner1: p1.categories,
    partner2: p2.categories,
    combined,
    divergence,
    overall,
    harmony,
    redFlags: [...new Set([...p1.redFlags, ...p2.redFlags])],
    criticalWarnings: [...new Set([...p1.critical, ...p2.critical])],
  };
}