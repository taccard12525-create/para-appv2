'use client';
import { useEffect, useRef, useState } from 'react';

export default function SbpPage() {
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initSbp = async () => {
      // Получаем подпись с сервера
      const res = await fetch('/api/create-sbp', { method: 'POST' });
      const data = await res.json();

      if (window.Robokassa && qrRef.current) {
        window.Robokassa.pay.startOp({
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
      setLoading(false);
    };
    initSbp();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-romantic-glow">
      <div className="card text-center max-w-md w-full p-8">
        <h1 className="font-serif text-2xl mb-4">Оплата через СБП</h1>
        <p className="text-inkSoft mb-6">Отсканируйте QR-код в приложении банка</p>
        <div id="qr-container" ref={qrRef} className="flex justify-center mb-6"></div>
        {loading && <p className="text-sm text-inkSoft">Генерация QR-кода...</p>}
      </div>
    </main>
  );
}