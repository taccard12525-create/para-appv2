'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем, прошел ли пользователь тест
    const p1 = localStorage.getItem('para_p1');
    const p2 = localStorage.getItem('para_p2');
    
    if (!p1 || !p2) { 
      router.replace('/quiz'); 
      return; 
    }
    
    setReady(true);
  }, [router]);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Запрашиваем у сервера ссылку на оплату
      const res = await fetch('/api/create-payment', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }

      // Сохраняем ID платежа для страницы результатов
      localStorage.setItem('para_payment_id', data.paymentId);
      
      // Перекидываем пользователя на страницу оплаты Robokassa
      window.location.href = data.paymentUrl;
    } catch (e: any) {
      setError(e.message || 'Что-то пошло не так. Попробуйте еще раз.');
      setLoading(false);
    }
  };

  // Пока идет проверка данных, показываем экран загрузки
  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center text-inkSoft bg-romantic-glow">
        Загрузка…
      </main>
    );
  }

  return (
    <main className="min-h-screen container-narrow py-16 relative z-10 flex flex-col justify-center">
      <div className="card text-center animate-fadeUp max-w-2xl mx-auto w-full">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blush/30 rounded-full blur-3xl -z-10" />
        
        <div className="text-6xl mb-6 animate-float">💌</div>
        <h1 className="font-serif text-3xl md:text-4xl mb-4">
          Ваш разбор <span className="italic text-terra">почти готов</span>
        </h1>
        <p className="text-inkSoft leading-relaxed mb-8 max-w-md mx-auto">
          Мы бережно объединили ответы обоих партнёров. Чтобы открыть персональное послание для вашей пары, подтвердите доступ.
        </p>

        <div className="bg-sand/50 rounded-2xl p-6 mb-8 border border-white">
            <div className="text-4xl font-serif mb-2">199 ₽</div>
            <div className="text-sm text-inkSoft">Полный психологический разбор</div>
        </div>

        <button 
          onClick={handlePay} 
          disabled={loading} 
          className="btn-primary w-full text-lg shadow-lg"
        >
          {loading ? 'Переходим к оплате…' : 'Оплатить и увидеть разбор'}
        </button>
        
        <p className="text-xs text-inkSoft mt-4">
          Безопасная оплата через Robokassa · чек придёт на email
        </p>
        
        {/* Блок для вывода ошибки, если что-то пойдет не так */}
        {error && <p className="text-danger mt-4 text-sm font-medium">{error}</p>}
      </div>
    </main>
  );
}