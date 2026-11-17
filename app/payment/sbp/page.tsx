'use client';

import { useEffect, useRef, useState } from 'react';

export default function SbpPage() {
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initSbp = async () => {
      try {
        // Получаем подпись с сервера
        const res = await fetch('/api/create-sbp', { method: 'POST' });
        const data = await res.json();

        // ИСПОЛЬЗУЕМ (window as any), ЧТОБЫ TYPESCRIPT НЕ РУГАЛСЯ
        const Robokassa = (window as any).Robokassa;

        if (Robokassa && qrRef.current) {
          Robokassa.pay.startOp({
            merchantLogin: data.login,
            outSum: data.outSum,
            invId: data.invId,
            signature: data.signature,
            paymentMethod: 'SBP',
            qrContainerId: 'qr-container',
            qrContainerSize: 250,
            onpaymentlink: (link: string) => console.log('Ссылка СБП:', link),
          });
        }
      } catch (error) {
        console.error("Ошибка инициализации СБП", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Небольшая задержка, чтобы скрипт Robokassa точно успел загрузиться
    const timer = setTimeout(() => {
      initSbp();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-romantic-glow">
      <div className="card text-center max-w-md w-full p-8">
        <h1 className="font-serif text-2xl mb-4">Оплата через СБП</h1>
        <p className="text-inkSoft mb-6">Отсканируйте QR-код в приложении банка</p>
        
        {/* Контейнер для QR-кода */}
        <div id="qr-container" ref={qrRef} className="flex justify-center mb-6 min-h-[250px]"></div>
        
        {loading && <p className="text-sm text-inkSoft animate-pulse">Генерация QR-кода...</p>}
      </div>
    </main>
  );
}