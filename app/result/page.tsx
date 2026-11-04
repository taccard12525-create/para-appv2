'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORIES, CategoryKey } from '@/lib/questions';
import type { PairScore } from '@/lib/scoring';

interface Report {
  headline: string;
  overall_summary: string;
  green_flags: string[];
  red_flags: string[];
  divergences: { title: string; description: string; partner1_sees: string; partner2_sees: string }[];
  personal_insights: { partner: number; insight: string }[];
  problem_areas: { title: string; description: string }[];
  recommendations: string[];
  next_steps: string;
}

function ResultInner() {
  const router = useRouter();
  const params = useSearchParams();
  const urlId = params.get('paymentId');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<PairScore | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const id = urlId || (typeof window !== 'undefined' ? localStorage.getItem('para_payment_id') : null);
    setPaymentId(id);
    if (!id) { setError('Не указан платёж'); setLoading(false); return; }

    const cached = localStorage.getItem('para_report_' + id);
    if (cached) {
      try {
        const d = JSON.parse(cached);
        setScores(d.scores); setReport(d.report); setLoading(false); return;
      } catch {}
    }

    const raw1 = localStorage.getItem('para_p1');
    const raw2 = localStorage.getItem('para_p2');
    if (!raw1 || !raw2) { setError('Ответы не найдены. Пройдите тест заново.'); setLoading(false); return; }

    const answers = { partner1: JSON.parse(raw1), partner2: JSON.parse(raw2) };

    (async () => {
      try {
        const res = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: id, answers }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка генерации');
        setScores(data.scores); setReport(data.report);
        localStorage.setItem('para_report_' + id, JSON.stringify(data));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [urlId]);

  if (loading) return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="w-12 h-12 border-2 border-ink/20 border-t-ink rounded-full animate-spin mb-8" />
      <h1 className="font-serif text-3xl mb-3">Собираем ваш разбор</h1>
      <p className="text-inkSoft max-w-sm">Нейросеть читает ваши ответы — включая личные. Это займёт около 20–30 секунд.</p>
    </main>
  );

  if (error) return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-serif text-3xl mb-3">Что-то пошло не так</h1>
      <p className="text-inkSoft mb-8">{error}</p>
      <button onClick={() => router.push('/quiz')} className="btn-primary">Пройти тест заново</button>
    </main>
  );

  if (!scores || !report) return null;
  const tier = scores.overall >= 75 ? 'Высокая' : scores.overall >= 50 ? 'Средняя' : 'Низкая';

  return (
    <main className="container-narrow py-12 space-y-6">

      {/* CRITICAL */}
      {scores.criticalWarnings.length > 0 && (
        <div className="bg-danger text-cream rounded-3xl p-8">
          <div className="text-xs uppercase tracking-widest mb-3 opacity-80">Важно</div>
          <h2 className="font-serif text-2xl mb-3">В ответах есть сигналы, требующие внимания</h2>
          <p className="opacity-90 leading-relaxed mb-4">Если вы в опасности — обратитесь за помощью:</p>
          <ul className="space-y-1 text-sm opacity-90">
            <li>• Телефон доверия: <b>8 800 2000 122</b></li>
            <li>• Экстренные службы: <b>112</b></li>
            <li>• Центр «Насилию.нет»: <b>+7 495 916 30 00</b></li>
          </ul>
        </div>
      )}

      {/* SCORE */}
      <div className="card text-center">
        <div className="text-xs uppercase tracking-widest text-inkSoft mb-6">Совместимость</div>
        <div className="font-serif text-7xl md:text-8xl mb-2">{scores.overall}<span className="text-3xl text-inkSoft">/100</span></div>
        <div className="text-inkSoft mb-2">{tier} совместимость · гармония восприятия {scores.harmony}/100</div>
        <h1 className="font-serif text-2xl md:text-3xl mt-6 mb-4">{report.headline}</h1>
        <p className="text-inkSoft leading-relaxed max-w-xl mx-auto whitespace-pre-line">{report.overall_summary}</p>
      </div>

      {/* CATEGORIES с двумя полосками */}
      <div className="card">
        <h2 className="font-serif text-2xl mb-6">По сферам</h2>
        <div className="space-y-6">
          {(Object.keys(scores.combined) as CategoryKey[]).map((k) => {
            const p1 = scores.partner1[k], p2 = scores.partner2[k], div = scores.divergence[k];
            const col1 = p1 >= 70 ? 'bg-sage' : p1 >= 40 ? 'bg-clay' : 'bg-danger';
            const col2 = p2 >= 70 ? 'bg-sage' : p2 >= 40 ? 'bg-clay' : 'bg-danger';
            return (
              <div key={k}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{CATEGORIES[k].title}</span>
                  {div >= 25 && <span className="text-danger text-xs">расхождение {div}</span>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-inkSoft w-20 shrink-0">Партнёр 1</span>
                    <div className="progress-track flex-1"><div className={`h-full ${col1} transition-all duration-700`} style={{ width: `${p1}%` }} /></div>
                    <span className="text-xs text-inkSoft w-8 text-right">{p1}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-inkSoft w-20 shrink-0">Партнёр 2</span>
                    <div className="progress-track flex-1"><div className={`h-full ${col2} transition-all duration-700`} style={{ width: `${p2}%` }} /></div>
                    <span className="text-xs text-inkSoft w-8 text-right">{p2}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERSONAL INSIGHTS */}
      {report.personal_insights?.length > 0 && (
        <div className="card">
          <h2 className="font-serif text-2xl mb-6">Что заметил психолог в ваших словах</h2>
          <div className="space-y-6">
            {report.personal_insights.map((pi, i) => (
              <div key={i} className="bg-sand rounded-2xl p-5">
                <div className="text-xs uppercase tracking-widest text-inkSoft mb-2">Партнёр {pi.partner}</div>
                <p className="leading-relaxed">{pi.insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GREEN */}
      {report.green_flags?.length > 0 && (
        <div className="card">
          <h2 className="font-serif text-2xl mb-4">🌱 Грин-флаги</h2>
          <ul className="space-y-3">
            {report.green_flags.map((g, i) => (
              <li key={i} className="flex gap-3 leading-relaxed"><span className="text-sage shrink-0">✓</span>{g}</li>
            ))}
          </ul>
        </div>
      )}

      {/* RED */}
      {report.red_flags?.length > 0 && (
        <div className="card">
          <h2 className="font-serif text-2xl mb-4">🚩 Ред-флаги</h2>
          <ul className="space-y-3">
            {report.red_flags.map((g, i) => (
              <li key={i} className="flex gap-3 leading-relaxed"><span className="text-danger shrink-0">!</span>{g}</li>
            ))}
          </ul>
        </div>
      )}

      {/* DIVERGENCES */}
      {report.divergences?.length > 0 && (
        <div className="card">
          <h2 className="font-serif text-2xl mb-6">Где вы видите по-разному</h2>
          <div className="space-y-8">
            {report.divergences.map((d, i) => (
              <div key={i}>
                <h3 className="font-serif text-xl mb-2">{d.title}</h3>
                <p className="text-inkSoft leading-relaxed mb-4">{d.description}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-sand rounded-xl p-4">
                    <div className="text-xs uppercase tracking-widest text-inkSoft mb-2">Партнёр 1</div>
                    <p className="text-sm leading-relaxed">{d.partner1_sees}</p>
                  </div>
                  <div className="bg-sand rounded-xl p-4">
                    <div className="text-xs uppercase tracking-widest text-inkSoft mb-2">Партнёр 2</div>
                    <p className="text-sm leading-relaxed">{d.partner2_sees}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROBLEMS */}
      {report.problem_areas?.length > 0 && (
        <div className="card">
          <h2 className="font-serif text-2xl mb-6">Проблемные зоны</h2>
          <div className="space-y-5">
            {report.problem_areas.map((p, i) => (
              <div key={i}>
                <h3 className="font-medium mb-1">{p.title}</h3>
                <p className="text-inkSoft leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      {report.recommendations?.length > 0 && (
        <div className="card">
          <h2 className="font-serif text-2xl mb-6">Рекомендации</h2>
          <ol className="space-y-4">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-serif text-clay text-xl shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* NEXT */}
      {report.next_steps && (
        <div className="bg-ink text-cream rounded-3xl p-8">
          <div className="text-xs uppercase tracking-widest mb-3 opacity-60">С чего начать</div>
          <p className="font-serif text-xl leading-relaxed">{report.next_steps}</p>
        </div>
      )}

      <div className="text-center pt-6 pb-12 space-y-4">
        <p className="text-xs text-inkSoft max-w-md mx-auto">
          Отчёт носит рекомендательный характер и не является медицинским заключением.
          При серьёзных сложностях обратитесь к семейному психологу.
        </p>
        <button onClick={() => { localStorage.removeItem('para_p1'); localStorage.removeItem('para_p2'); router.push('/quiz'); }} className="btn-ghost text-sm">
          Пройти заново
        </button>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return <Suspense fallback={<main className="min-h-screen flex items-center justify-center text-inkSoft">Загрузка…</main>}><ResultInner /></Suspense>;
}