import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const login = process.env.ROBOKASSA_LOGIN || 'para';
    const pass1 = process.env.ROBOKASSA_PASS1;
    if (!pass1) {
      return NextResponse.json({ error: 'Пароль не настроен' }, { status: 500 });
    }

    const invId = Date.now().toString();
    const outSum = 199.00;
    const email = 'test@test.ru';

    // Формируем чек (Receipt) — обязателен для СБП
    const receipt = {
      sno: 'osn',
      items: [
        {
          name: 'Психологический отчёт для пары',
          quantity: 1,
          sum: 199.00,
          payment_method: 'full_payment',
          payment_object: 'service',
          tax: 'none',
        },
      ],
    };

    // receipt для подписи и для передачи в startOp должен быть строкой
    const receiptString = JSON.stringify(receipt);

    // Подпись: MD5(merchantLogin:outSum:invId:receipt:Пароль#1)
    const signatureBase = `${login}:${outSum}:${invId}:${receiptString}:${pass1}`;
    const signature = crypto.createHash('md5').update(signatureBase).digest('hex');

    return NextResponse.json({
      login,
      outSum,
      invId,
      receipt: receiptString, // передаем строку
      email,
      signature,
    });
  } catch (e) {
    console.error('Ошибка создания СБП:', e);
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}