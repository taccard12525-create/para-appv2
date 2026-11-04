'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p1 = localStorage.getItem('para_p1');
    const p2 = localStorage.getItem('para_p2');
    
    if (!p1 || !p2) { 
      router.replace('/quiz'); 
      return; 
    }

    // Генерируем временный ID для страницы результата
    const tempId = 'PAY_' + Date.now();
    localStorage.setItem('para_payment_id', tempId);
    
    setReady(true);
  }, [router]);

  // Функция для тестового обхода оплаты
  const goToMockResult = () => {
    const mockId = 'MOCK_BYPASS_' + Date.now();
    localStorage.setItem('para_payment_id', mockId);
    router.push(`/result?paymentId=${mockId}`);
  };

  if (!ready) return <main className="min-h-screen flex items-center justify-center text-inkSoft bg-romantic-glow">Загрузка…</main>;

  // HTML-код вашей формы
  const iframeHtml = `
    <div id="intellectmoney-payform" style="min-height: 550px; width: 100%;">
      <iframe width="100%" height="100%" style="min-height: 550px; border: none;" frameBorder="0" src="https://merchant.intellectmoney.ru/v2/ru/prepareForm/?EshopId=473381&ServiceName=%D0%9F%D1%81%D0%B8%D1%85%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BE%D1%82%D1%87%D1%91%D1%82%20%D0%B4%D0%BB%D1%8F%20%D0%BF%D0%B0%D1%80%D1%8B&ServiceNameAuthor=0&PaymentAmount=199&PaymentCurrency=RUB&PaymentAmountIsReadonly=true&ButtonName=0&OpenNewWindow=true&UserFullName=&UserEmail=true&PhoneNumber=&SuccessUrl=https%3A%2F%2Fpara.layero.app%2Fresult&MerchantReceipt=&Comment=&CommentTip=&Hash=bb6caa1304e0d0479fa9e8676d396322&PayerData=&Email="></iframe>
    </div>
  `;

  return (
    <main className="min-h-screen container-narrow py-16 bg-romantic-glow">
      <div className="card text-center animate-fadeUp max-w-2xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blush/40 rounded-full blur-3xl -z-10" />
        
        <div className="text-6xl mb-6 animate-float">📄</div>
        <h1 className="font-serif text-3xl md:text-4xl mb-4">Анализ <span className="italic text-terra">готов</span></h1>
        <p className="text-inkSoft leading-relaxed mb-8 max-w-md mx-auto">
          Мы обработали ответы обоих партнёров. Чтобы увидеть персональный разбор, оплатите доступ.
        </p>

        {/* Блок с формой оплаты */}
        <div 
          className="w-full bg-white rounded-2xl overflow-hidden border border-ink/5 shadow-inner" 
          dangerouslySetInnerHTML={{ __html: iframeHtml }} 
        />

        {/* --- ТЕСТОВАЯ КНОПКА --- */}
        <div className="mt-10 pt-6 border-t border-ink/10">
          <button 
            onClick={goToMockResult}
            className="text-sm text-inkSoft hover:text-terra transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            🧪 Тестовый доступ: посмотреть результат бесплатно
          </button>
        </div>
        {/* ----------------------- */}

      </div>
    </main>
  );
}