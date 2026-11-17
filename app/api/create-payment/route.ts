import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const login = process.env.ROBOKASSA_LOGIN || 'para';
    const pass1 = process.env.ROBOKASSA_PASS1;
    // В боевом режиме isTest = false, поэтому параметр IsTest не передается
    const isTest = false; 
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://para.layero.app';

    if (!pass1) {
      return NextResponse.json({ error: 'Пароль Robokassa #1 не настроен' }, { status: 500 });
    }

    const invId = Date.now().toString();
    const outSum = '199.00';
    const description = 'Психологический отчёт для пары';

    // Формируем подпись: MD5(MerchantLogin:OutSum:InvId:Пароль#1)
    const signatureBase = `${login}:${outSum}:${invId}:${pass1}`;
    const signatureValue = crypto.createHash('md5').update(signatureBase).digest('hex');

    const searchParams = new URLSearchParams({
      MerchantLogin: login,
      OutSum: outSum,
      InvId: invId,
      Description: description,
      SignatureValue: signatureValue,
      Culture: 'ru',
    });

    // Параметр IsTest не добавляем для боевого режима
    const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?${searchParams.toString()}`;

    return NextResponse.json({ paymentUrl, paymentId: invId });

  } catch (e) {
    console.error('Ошибка создания платежа:', e);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}