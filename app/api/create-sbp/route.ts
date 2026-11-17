import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const login = process.env.ROBOKASSA_LOGIN || 'para';
    const pass1 = process.env.ROBOKASSA_PASS1;
    if (!pass1) return NextResponse.json({ error: 'Пароль не настроен' }, { status: 500 });

    const invId = Date.now().toString();
    const outSum = 199.00;
    // Подпись для СБП: MD5(merchantLogin:outSum:invId:Пароль#1)
    const signatureBase = `${login}:${outSum}:${invId}:${pass1}`;
    const signature = crypto.createHash('md5').update(signatureBase).digest('hex');

    return NextResponse.json({ login, outSum, invId, signature });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}