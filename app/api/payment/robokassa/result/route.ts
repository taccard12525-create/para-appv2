import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const outSum = formData.get('OutSum') as string;
    const invId = formData.get('InvId') as string;
    const signatureValue = formData.get('SignatureValue') as string;

    if (!outSum || !invId || !signatureValue) {
      return new Response('Missing parameters', { status: 400 });
    }

    const pass2 = process.env.ROBOKASSA_PASS2;
    if (!pass2) {
      return new Response('Password 2 not configured', { status: 500 });
    }

    // В боевом режиме база для подписи: OutSum:InvId:Пароль#2
    const checkBase = `${outSum}:${invId}:${pass2}`;
    const expectedSignature = crypto.createHash('md5').update(checkBase).digest('hex');

    if (signatureValue.toUpperCase() !== expectedSignature.toUpperCase()) {
      console.error('Неверная подпись от Robokassa');
      return new Response('Invalid signature', { status: 400 });
    }

    console.log(`✅ Оплата подтверждена! Заказ: ${invId}, Сумма: ${outSum}`);

    // Обязательный ответ для Robokassa
    return new Response(`OK${invId}`, { status: 200 });

  } catch (e) {
    console.error('Robokassa webhook error:', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}