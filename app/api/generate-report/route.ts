export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, answers } = body as { paymentId: string; answers: PairAnswers };

    if (!paymentId || !answers?.partner1 || !answers?.partner2) {
      return NextResponse.json({ error: 'Нет данных' }, { status: 400 });
    }

    // 🔥 ВАЖНО: Пропускаем проверку оплаты, если ID начинается с "MOCK_"
    // Это позволяет использовать тестовую кнопку обхода оплаты
    if (!String(paymentId).startsWith('MOCK_')) {
      const shopId = process.env.YOOKASSA_SHOP_ID;
      const secretKey = process.env.YOOKASSA_SECRET_KEY;
      
      // Если вы перешли на IntellectMoney, здесь нужно будет добавить их проверку.
      // Пока оставляем проверку ЮKassa для реальных платежей.
      if (shopId && secretKey) {
        const verify = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
          headers: {
            Authorization: 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64'),
          },
        });
        if (!verify.ok) {
          return NextResponse.json({ error: 'Платёж не найден' }, { status: 400 });
        }
        const pay = await verify.json();
        if (pay.status !== 'succeeded') {
          return NextResponse.json({ error: 'Платёж не оплачен' }, { status: 402 });
        }
      }
    }

    const scores = calculatePairScore(answers);

    // Далее идет ваш код генерации отчета...
    let report;
    if (process.env.GIGACHAT_AUTH_KEY && process.env.GIGACHAT_AUTH_KEY !== 'ваш_новый_ключ_здесь') {
      report = await callGigaChat(scores, answers);
    } else {
      report = mockReport(scores);
    }

    return NextResponse.json({ scores, report });
  } catch (e) {
    // ...