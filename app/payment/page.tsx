'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p1 = localStorage.getItem('para_p1');
    const p2 = localStorage.getItem('para_p2');
    
    // Если тест не пройден, отправляем на страницу опросника
    if (!p1 || !p2) { 
      router.replace('/quiz'); 
      return; 
    }

    // ВАЖНО: Генерируем временный ID, так как форма IntellectMoney 
    // не передает ID платежа в SuccessUrl. Это нужно, чтобы страница /result не упала.
    const tempId = 'MOCK_INTELLECT_' + Date.now();
    localStorage.setItem('para_payment_id', tempId);
    
    setReady(true);
  }, [router]);

  if (!ready) return <main className="min-h-screen flex items-center justify-center text-inkSoft">Загрузка…</main>;

  // HTML-код вашей формы
  const iframeHtml = `
    <div id="intellectmoney-payform" style="min-height: 550px; width: 100%;">
      <iframe width="100%" height="100%" style="min-height: 550px; border: none;" frameBorder="0" src="https://merchant.intellectmoney.ru/v2/ru/prepareForm/?EshopId=473381&ServiceName=%D0%9F%D1%81%D0%B8%D1%85%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BE%D1%82%D1%87%D1%91%D1%82%20%D0%B4%D0%BB%D1%8F%20%D0%BF%D0%B0%D1%80%D1%8B&ServiceNameAuthor=0&PaymentAmount=10&PaymentCurrency=RUB&PaymentAmountIsReadonly=false&ButtonName=0&OpenNewWindow=true&UserFullName=&UserEmail=true&PhoneNumber=&SuccessUrl=https%3A%2F%2Fpara.layero.app%2Fresult&MerchantReceipt=&Comment=&CommentTip=&Hash=bb6caa1304e0d0479fa9e8676d396322&PayerData=&Email="></iframe>
    </div>
  `;

  return (
    <main className="min-h-screen container-narrow py-12">
      <div className="card text-center animate-fadeUp">
        <div className="text-6xl mb-6">📄</div>
        <h1 className="font-serif text-3xl md:text-4xl mb-4">Анализ готов</h1>
        <p className="text-inkSoft leading-relaxed mb-8 max-w-md mx-auto">
          Мы обработали ответы обоих партнёров. Чтобы увидеть персональный разбор, оплатите доступ.
        </p>

        {/* Блок с формой оплаты */}
        <div 
          className="w-full bg-white rounded-2xl overflow-hidden border border-ink/10 shadow-sm" 
          dangerouslySetInnerHTML={{ __html: iframeHtml }} 
        />
        
        {/* Кнопка возврата на случай, если оплата открылась в новой вкладке */}
        <div className="mt-8">
          <button 
            onClick={() => router.push('/result')} 
            className="text-sm text-clay hover:text-terra hover:underline transition-colors"
          >
            Я уже оплатил(а) — перейти к отчёту →
          </button>
        </div>
      </div>
    </main>
  );
}