import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // ЖЕСТКО ПРОПИСАННЫЕ ДАННЫЕ (ТЕСТОВЫЙ РЕЖИМ)
    const login = 'para';
    const pass1 = 'VR4Eey1egmlm0komp5U1'; // ТЕСТОВЫЙ Пароль #1
    const isTest = true; 
    const baseUrl = 'https://para.layero.app';

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

    if (isTest) {
      searchParams.append('IsTest', '1');
    }

    const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?${searchParams.toString()}`;

    return NextResponse.json({ 
      paymentUrl, 
      paymentId: invId 
    });

  } catch (e) {
    console.error('Ошибка создания платежа:', e);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}