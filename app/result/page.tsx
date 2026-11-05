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

  // Состояния для анимаций
  const [displayScore, setDisplayScore] = useState(0);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const loadingTexts = [
    'Собираем пазл ваших отношений...',
    'Анализируем красные и зеленые флаги...',
    'Ищем скрытые точки роста...',
    'Формулируем рекомендации...',
    'Пишем персональное послание...'
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loading, loadingTexts.length]);

  useEffect(() => {
    if (!scores) return;
    let start = 0;
    const end = scores.overall;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayScore(end);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [scores]);

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
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10">
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 border-2 border-terra/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-2 border-2 border-terra/40 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">✨</div>
      </div>
      <h1 className="font-serif text-3xl mb-3">Создаем ваш разбор</h1>
      <p className="text-inkSoft max-w-sm h-12 transition-all duration-500">
        {loadingTexts[loadingTextIndex]}
      </p>
    </main>
  );

  if (error) return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10">
      <h1 className="font-serif text-3xl mb-3 text-danger">Что-то пошло не так</h1>
      <p className="text-inkSoft mb-8">{error}</p>
      <button onClick={() => router.push('/quiz')} className="btn-primary">Пройти тест заново</button>
    </main>
  );

  if (!scores || !report) return null;
  const tier = scores.overall >= 75 ? 'Высокая' : scores.overall >= 50 ? 'Средняя' : 'Низкая';

  return (
    <main className="container-narrow py-12 space-y-6 relative z-10">

      {/* CRITICAL */}
      {scores.criticalWarnings.length > 0 && (
        <div className="bg-danger text-white rounded-3xl p-8 shadow-lg shadow-danger/20">
          <div className="text-xs uppercase tracking-widest mb-3 opacity-80">Важно</div>
          <h2 className="font-serif text-2xl mb-3">В ответах есть сигналы, требующие внимания</h2>
          <p className="opacity-90 leading-relaxed mb-4">Если вы в опасности — обратитесь за помощью:</p>
          <ul className="space-y-1 text-sm opacity-90 font-medium">
            <li>• Телефон доверия: <b>8 800 2000 122</b></li>
            <li>• Экстренные службы: <b>112</b></li>
            <li>• Центр «Насилию.нет»: <b>+7 495 916 30 00</b></li>
          </ul>
        </div>
      )}

      {/* SCORE */}
      <div className="card text-center bg-gradient-to-b from-white/90 to-white/50">
        <div className="text-xs uppercase tracking-widest text-inkSoft mb-6 font-medium">Совместимость</div>
        <div className="font-serif text-8xl md:text-[8rem] leading-none mb-4 text-transparent bg-clip-text bg-gradient-to-br from-terra to-clay">
          {displayScore}
        </div>
        <div className="text-inkSoft mb-4 text-sm font-medium">
            {tier} совместимость <span className="opacity-50 mx-1">|</span> гармония восприятия {scores.harmony}/100
        </div>
        <h1 className="font-serif text-3xl md:text-4xl mt-8 mb-4">{report.headline}</h1>
        <p className="text-inkSoft leading-relaxed max-w-xl mx-auto whitespace-pre-line text-lg">{report.overall_summary}</p>
      </div>

      {/* CATEGORIES с двумя полосками */}
      <div className="card">
        <h2 className="font-serif text-2xl mb-8">По сферам</h2>
        <div className="space-y-8">
          {(Object.keys(scores.combined) as CategoryKey[]).map((k) => {
            const p1 = scores.partner1[k], p2 = scores.partner2[k], div = scores.divergence[k];
            const col1 = p1 >= 70 ? 'bg-sage' : p1 >= 40 ? 'bg-clay' : 'bg-danger';
            const col2 = p2 >= 70 ? 'bg-sage' : p2 >= 40 ? 'bg-clay' : 'bg-danger';
            return (
              <div key={k} className="group">
                <div className="flex justify-between text-sm mb-3 font-medium">
                  <span className="group-hover:text-terra transition-colors">{CATEGORIES[k].title}</span>
                  {div >= 25 && <span className="text-danger text-xs bg-danger/10 px-2 py-0.5 rounded-full">расхождение {div}</span>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-inkSoft w-16 shrink-0 uppercase tracking-wider">П1</span>
                    <div className="h-2 w-full bg-sand rounded-full overflow-hidden">
                        <div className={`h-full ${col1} transition-all duration-1000 ease-out`} style={{ width: `${p1}%` }} />
                    </div>
                    <span className="text-xs text-inkSoft w-8 text-right font-mono">{p1}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-inkSoft w-16 shrink-0 uppercase tracking-wider">П2</span>
                    <div className="h-2 w-full bg-sand rounded-full overflow-hidden">
                        <div className={`h-full ${col2} transition-all duration-1000 ease-out`} style={{ width: `${p2}%` }} />
                    </div>
                    <span className="text-xs text-inkSoft w-8 text-right font-mono">{p2}</span>
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
              <div key={i} className="bg-gradient-to-r from-sand/80 to-transparent rounded-2xl p-6 border-l-4 border-terra">
                <div className="text-xs uppercase tracking-widest text-inkSoft mb-2 font-medium">Партнёр {pi.partner}</div>
                <p className="leading-relaxed text-lg italic text-ink/80">«{pi.insight}»</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GREEN / RED grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {report.green_flags?.length > 0 && (
            <div className="card bg-sage/5 border-sage/20">
            <h2 className="font-serif text-2xl mb-4 text-sage">🌱 Грин-флаги</h2>
            <ul className="space-y-3">
                {report.green_flags.map((g, i) => (
                <li key={i} className="flex gap-3 leading-relaxed text-sm"><span className="text-sage shrink-0 font-bold">✓</span>{g}</li>
                ))}
            </ul>
            </div>
        )}
        {report.red_flags?.length > 0 && (
            <div className="card bg-danger/5 border-danger/20">
            <h2 className="font-serif text-2xl mb-4 text-danger">🚩 Ред-флаги</h2>
            <ul className="space-y-3">
                {report.red_flags.map((g, i) => (
                <li key={i} className="flex gap-3 leading-relaxed text-sm"><span className="text-danger shrink-0 font-bold">!</span>{g}</li>
                ))}
            </ul>
            </div>
        )}
      </div>

      {/* DIVERGENCES */}
      {report.divergences?.length > 0 && (
        <div className="card">
          <h2 className="font-serif text-2xl mb-6">Где вы видите по-разному</h2>
          <div className="space-y-8">
            {report.divergences.map((d, i) => (
              <div key={i}>
                <h3 className="font-serif text-xl mb-2 text-terra">{d.title}</h3>
                <p className="text-inkSoft leading-relaxed mb-4 text-sm">{d.description}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white/60 rounded-xl p-4 border border-white/80 shadow-sm">
                    <div className="text-xs uppercase tracking-widest text-inkSoft mb-2 font-medium">Партнёр 1</div>
                    <p className="text-sm leading-relaxed">{d.partner1_sees}</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-white/80 shadow-sm">
                    <div className="text-xs uppercase tracking-widest text-inkSoft mb-2 font-medium">Партнёр 2</div>
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
                <p className="text-inkSoft leading-relaxed text-sm">{p.description}</p>
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
              <li key={i} className="flex gap-4 items-start">
                <span className="font-serif text-terra text-2xl shrink-0 leading-none">{String(i + 1).padStart(2, '0')}</span>
                <span className="leading-relaxed text-sm">{r}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* NEXT */}
      {report.next_steps && (
        <div className="bg-ink text-cream rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-terra/30 rounded-full blur-3xl" />
          <div className="text-xs uppercase tracking-widest mb-3 opacity-60 relative z-10">С чего начать</div>
          <p className="font-serif text-xl leading-relaxed relative z-10">{report.next_steps}</p>
        </div>
      )}

      <div className="text-center pt-6 pb-12 space-y-4">
        <p className="text-xs text-inkSoft max-w-md mx-auto opacity-70">
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