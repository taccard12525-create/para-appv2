'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Robokassa: any;
  }
}

export default function SbpPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initSbp = async () => {
      try {
        const res = await fetch('/api/create-sbp', { method: 'POST' });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Ошибка при создании платежа');
        }
        const data = await res.json();

        if (!window.Robokassa) {
          throw new Error('Скрипт Robokassa не загружен. Попробуйте обновить страницу.');
        }

        if (qrRef.current) {
          window.Robokassa.pay.startOp({
            merchantLogin: data.login,
            outSum: data.outSum,
            invId: data.invId,
            receipt: data.receipt, // строка JSON
            email: data.email,
            signature: data.signature,
            paymentMethod: 'SBP',
            IncCurrLabel: 'SBP',
            qrContainerId: 'qr-container',
            qrContainerSize: 250,
            onpaymentlink: (link: string) => {
              console.log('Ссылка на оплату СБП:', link);
            },
          });
        } else {
          throw new Error('Контейнер для QR-кода не найден.');
        }
      } catch (err: any) {
        console.error('Ошибка инициализации СБП:', err);
        setError(err.message || 'Не удалось сгенерировать QR-код.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(initSbp, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-romantic-glow">
      <div className="card text-center max-w-md w-full p-8">
        <h1 className="font-serif text-2xl mb-4">Оплата через СБП</h1>
        <p className="text-inkSoft mb-6">Отсканируйте QR-код в приложении банка</p>
        <div id="qr-container" ref={qrRef} className="flex justify-center mb-6 min-h-[250px]"></div>
        {loading && <p className="text-sm text-inkSoft animate-pulse">Генерация QR-кода...</p>}
        {error && <p className="text-sm text-danger mt-4">{error}</p>}
      </div>
    </main>
  );
}