'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p1 = localStorage.getItem('para_p1');
    const p2 = localStorage.getItem('para_p2');
    if (!p1 || !p2) { router.replace('/quiz'); return; }
    setReady(true);
  }, [router]);

  const pay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true }),
      });
      if (!res.ok) throw new Error('Не удалось создать платёж');
      const data = await res.json();
      localStorage.setItem('para_payment_id', data.paymentId);
      window.location.href = data.confirmationUrl;
    } catch (e: any) {
      setError(e.message || 'Ошибка');
      setLoading(false);
    }
  };

  if (!ready) return <main className="min-h-screen flex items-center justify-center text-inkSoft">Загрузка…</main>;

  return (
    <main className="min-h-screen container-narrow py-16">
      <div className="card text-center animate-fadeUp">
        <div className="text-6xl mb-6">📄</div>
        <h1 className="font-serif text-3xl md:text-4xl mb-4">Анализ готов</h1>
        <p className="text-inkSoft leading-relaxed mb-10 max-w-md mx-auto">
          Мы обработали ответы обоих партнёров и подготовили персональный разбор.
          Чтобы увидеть результат — оформите доступ.
        </p>

        <div className="bg-sand rounded-2xl p-6 mb-8 text-left space-y-3">
          {[
            'Совместимость по 7 сферам — с двух сторон',
            'Ред-флаги и грин-флаги',
            'Расхождения во взглядах — и что они значат',
            'Персональные инсайты по вашим личным ответам',
            'Рекомендации психолога и следующий шаг',
          ].map((t) => (
            <div key={t} className="flex items-start gap-3 text-ink">
              <span className="w-5 h-5 rounded-full bg-sage/30 flex items-center justify-center text-sage text-xs shrink-0 mt-0.5">✓</span>
              <span className="text-sm leading-relaxed">{t}</span>
            </div>
          ))}
        </div>

        <div className="text-4xl font-serif mb-6">199 ₽</div>

        <button onClick={pay} disabled={loading} className="btn-primary w-full mb-4">
          {loading ? 'Переходим к оплате…' : 'Оплатить и увидеть разбор'}
        </button>
        <p className="text-xs text-inkSoft">
          Безопасная оплата через ЮKassa · чек придёт на email
        </p>
        {error && <p className="text-danger mt-4 text-sm">{error}</p>}
      </div>
    </main>
  );
}