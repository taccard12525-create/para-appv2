import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Robokassa присылает данные в формате form-data
    const formData = await req.formData();
    const outSum = formData.get('OutSum') as string;
    const invId = formData.get('InvId') as string;
    const signatureValue = formData.get('SignatureValue') as string;

    if (!outSum || !invId || !signatureValue) {
      return new Response('Missing parameters', { status: 400 });
    }

    // В тестовом режиме используем тестовый Пароль #2
    const isTest = process.env.ROBOKASSA_TEST_MODE === 'true';
    const pass2 = isTest ? process.env.ROBOKASSA_PASS2_TEST : process.env.ROBOKASSA_PASS2;

    if (!pass2) {
      return new Response('Password 2 not configured', { status: 500 });
    }

    // Проверяем подпись: MD5(OutSum:InvId:Пароль#2)
    // В тестовом режиме OutSum может приходить с двумя знаками после запятой
    const checkBase = `${outSum}:${invId}:${pass2}`;
    const expectedSignature = crypto.createHash('md5').update(checkBase).digest('hex');

    if (signatureValue.toUpperCase() !== expectedSignature.toUpperCase()) {
      console.error('Неверная подпись от Robokassa');
      return new Response('Invalid signature', { status: 400 });
    }

    // Подпись верна! Здесь можно сохранить статус оплаты в вашу БД.
    // Например: await db.orders.update({ where: { id: invId }, data: { status: 'PAID' } });
    console.log(`✅ Оплата подтверждена! Заказ: ${invId}, Сумма: ${outSum}`);

    // Обязательный ответ для Robokassa — это подтверждение получения уведомления
    return new Response(`OK${invId}`, { status: 200 });

  } catch (e) {
    console.error('Robokassa webhook error:', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}