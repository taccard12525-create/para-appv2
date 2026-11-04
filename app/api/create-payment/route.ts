import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // 🔥 УМНОЕ ОПРЕДЕЛЕНИЕ ДОМЕНА
    // Берем домен прямо из заголовков запроса, на котором запущен сайт
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;

    // === MOCK-режим: имитация успешной оплаты для тестов ===
    if (process.env.MOCK_MODE === 'true') {
      const mockId = 'MOCK_' + Date.now();
      return NextResponse.json({
        // Теперь ссылка всегда будет правильной: https://ваш-домен/result...
        confirmationUrl: `${baseUrl}/result?paymentId=${mockId}`,
        paymentId: mockId,
      });
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    
    if (!shopId || !secretKey) {
      console.error('❌ YOOKASSA_SHOP_ID или YOOKASSA_SECRET_KEY не заданы');
      return NextResponse.json(
        { error: 'ЮKassa не настроена' },
        { status: 500 },
      );
    }

    const res = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': crypto.randomUUID(),
        Authorization:
          'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: { value: '199.00', currency: 'RUB' },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${baseUrl}/result`, // Тоже используем умный URL
        },
        description: 'Психологический отчёт для пары',
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('❌ YooKassa API error. Status:', res.status);
      console.error('❌ Response body:', errorBody);
      return NextResponse.json(
        { error: 'Ошибка платёжной системы', details: errorBody },
        { status: 500 },
      );
    }

    const payment = await res.json();
    return NextResponse.json({
      confirmationUrl: payment.confirmation.confirmation_url,
      paymentId: payment.id,
    });
  } catch (e) {
    console.error('❌ create-payment fatal error:', e);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}