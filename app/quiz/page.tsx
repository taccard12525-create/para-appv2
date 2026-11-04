'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_QUESTIONS } from '@/lib/questions';

type Phase = 'intro' | 'quiz' | 'handoff' | 'final';
type PartnerKey = 'partner1' | 'partner2';

export default function QuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('intro');
  const [partner, setPartner] = useState<PartnerKey>('partner1');
  const [index, setIndex] = useState(0);
  const [closed, setClosed] = useState<Record<number, number>>({});
  const [open, setOpen] = useState<Record<number, string>>({});

  const total = ALL_QUESTIONS.length;
  const q = ALL_QUESTIONS[index];
  const progress = ((index + 1) / total) * 100;

  const canProceed = () => {
    if (q.type === 'open') return (open[q.id] || '').trim().length >= 10;
    return closed[q.id] !== undefined;
  };

  const next = () => {
    if (!canProceed()) return;
    if (index + 1 < total) {
      setIndex(index + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finishPartner();
    }
  };

  const back = () => {
    if (index > 0) {
      setIndex(index - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const finishPartner = () => {
    const data = { closed, open };
    if (partner === 'partner1') {
      localStorage.setItem('para_p1', JSON.stringify(data));
      setPhase('handoff');
    } else {
      localStorage.setItem('para_p2', JSON.stringify(data));
      setPhase('final');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startPartner2 = () => {
    setPartner('partner2');
    setIndex(0);
    setClosed({});
    setOpen({});
    setPhase('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // === INTRO ===
  if (phase === 'intro') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-md w-full text-center animate-fadeUp relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 w-32 h-32 bg-rose/30 rounded-full blur-2xl -z-10" />
          
          <div className="text-7xl mb-8 animate-float">🤍</div>
          
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
            Познакомимся<br/>с вашими <span className="italic text-terra">отношениями</span>
          </h1>
          
          <p className="text-inkSoft text-lg leading-relaxed mb-10">
            Сейчас отвечает <b className="text-ink font-medium">первый партнёр</b> — тот, кто держит устройство.
            Затем оно переходит второму.
          </p>
          
          <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl p-6 text-left mb-10 space-y-4 text-sm text-ink/80 shadow-soft">
            <div className="flex gap-3 items-center"><span className="text-terra text-lg">✦</span><span>{total} вопросов, около 7–8 минут</span></div>
            <div className="flex gap-3 items-center"><span className="text-terra text-lg">✦</span><span>Отвечайте честно — это только для вас двоих</span></div>
            <div className="flex gap-3 items-center"><span className="text-terra text-lg">✦</span><span>В конце есть вопросы, где можно писать свободно</span></div>
          </div>
          
          <button onClick={() => setPhase('quiz')} className="btn-primary w-full text-lg">
            Начать · Партнёр 1
          </button>
        </div>
      </main>
    );
  }

  // === HANDOFF ===
  if (phase === 'handoff') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-md w-full text-center animate-fadeUp relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 w-40 h-40 bg-terra/20 rounded-full blur-3xl -z-10" />
          
          <div className="text-7xl mb-8 animate-float" style={{ animationDelay: '0.5s' }}>🤝</div>
          
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6">Спасибо</h1>
          
          <p className="text-inkSoft text-lg leading-relaxed mb-10">
            Теперь передайте устройство тому, кого <span className="italic text-terra">любите</span>.<br/>
            Ему предстоит ответить на те же вопросы — но уже со своей стороны.
          </p>
          
          <button onClick={startPartner2} className="btn-primary w-full text-lg">
            Партнёр 2 готов →
          </button>
        </div>
      </main>
    );
  }

  // === FINAL ===
  if (phase === 'final') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-md w-full text-center animate-fadeUp">
          <div className="text-7xl mb-8 animate-float">✨</div>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6">Анкета заполнена</h1>
          <p className="text-inkSoft text-lg leading-relaxed mb-10">
            Сейчас мы объединим ваши ответы, найдём совпадения и расхождения,
            и подготовим персональный разбор для вас двоих.
          </p>
          <button onClick={() => router.push('/payment')} className="btn-primary w-full">
            Перейти к анализу
          </button>
        </div>
      </main>
    );
  }

  // === QUIZ ===
  const isOpen = q.type === 'open';
  const openValue = open[q.id] || '';
  const openCharCount = openValue.trim().length;

  return (
    <main className="min-h-screen flex flex-col relative z-10">
      <div className="container-narrow pt-6 pb-4 flex justify-between items-center">
        <button onClick={back} disabled={index === 0} className="text-sm text-inkSoft hover:text-ink disabled:opacity-30 transition-colors">← Назад</button>
        <div className="text-xs uppercase tracking-widest text-inkSoft bg-white/50 backdrop-blur-sm border border-white/80 rounded-full px-3 py-1 shadow-sm">
          Партнёр {partner === 'partner1' ? '1' : '2'}
        </div>
      </div>

      <div className="container-narrow pb-6">
        <div className="progress-track bg-white/50"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <div className="flex justify-between text-xs text-inkSoft mt-2">
          <span>{isOpen ? 'Личные размышления' : 'Ваши отношения'}</span>
          <span>{index + 1} / {total}</span>
        </div>
      </div>

      <div className="flex-1 container-narrow py-8">
        <div key={q.id} className="animate-fadeUp">
          <h1 className={`font-serif text-3xl md:text-4xl leading-tight mb-3 ${isOpen ? 'md:text-3xl' : ''}`}>
            {q.text}
          </h1>
          {isOpen && q.hint && (
            <p className="text-inkSoft mb-8 text-sm italic">{q.hint}</p>
          )}
          {!isOpen && <div className="mb-8" />}

          {q.type === 'scale' && (
            <div className="space-y-3">
              {[
                { v: 1, l: 'Совсем нет' },
                { v: 2, l: 'Скорее нет' },
                { v: 3, l: 'Иногда' },
                { v: 4, l: 'Скорее да' },
                { v: 5, l: 'Полностью да' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setClosed({ ...closed, [q.id]: v })}
                  className={`w-full text-left px-6 py-4 rounded-2xl border transition-all ${
                    closed[q.id] === v
                      ? 'border-ink bg-ink text-cream shadow-md scale-[1.01]'
                      : 'border-white/60 bg-white/60 backdrop-blur-sm hover:border-terra/50 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}

          {q.type === 'multi' && (
            <div className="space-y-3">
              {q.options!.map((o) => (
                <button
                  key={o.label}
                  onClick={() => setClosed({ ...closed, [q.id]: o.value })}
                  className={`w-full text-left px-6 py-4 rounded-2xl border transition-all ${
                    closed[q.id] === o.value
                      ? 'border-ink bg-ink text-cream shadow-md scale-[1.01]'
                      : 'border-white/60 bg-white/60 backdrop-blur-sm hover:border-terra/50 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}

          {isOpen && (
            <div className="relative">
              <textarea
                value={openValue}
                onChange={(e) => setOpen({ ...open, [q.id]: e.target.value })}
                placeholder="Пишите свободно. Это прочитает только нейросеть — и использует для вашего персонального разбора."
                className="w-full bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-6 text-lg leading-relaxed
                           focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all min-h-[200px] resize-none shadow-sm"
                maxLength={1200}
              />
              <div className="flex justify-between text-xs text-inkSoft mt-2 px-1">
                <span>Минимум 10 символов</span>
                <span>{openCharCount} / 1200</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-narrow py-8">
        <button onClick={next} disabled={!canProceed()} className="btn-primary w-full">
          {index + 1 === total ? 'Завершить' : 'Далее →'}
        </button>
      </div>
    </main>
  );
}