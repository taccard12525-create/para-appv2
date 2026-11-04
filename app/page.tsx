import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <nav className="container-wide flex items-center justify-between py-6">
        <span className="font-serif text-2xl tracking-tight">пара<span className="text-clay">.</span></span>
        <Link href="/quiz" className="text-sm text-inkSoft hover:text-ink transition-colors">Начать →</Link>
      </nav>

      <section className="container-narrow text-center pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-inkSoft bg-sand rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-sage" />
          Психология отношений
        </div>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-8">
          Понять друг друга<br/>глубже, чем вчера
        </h1>
        <p className="text-lg md:text-xl text-inkSoft leading-relaxed max-w-2xl mx-auto mb-12">
          Научно-обоснованный чек-ап ваших отношений. Сначала отвечает один партнёр,
          затем второй. Затем — честный разбор, где вы совпадаете, а где нет.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/quiz" className="btn-primary text-lg px-9 py-5">Пройти тест</Link>
          <span className="text-sm text-inkSoft">двое · ~15 минут на обоих</span>
        </div>
      </section>

      <section className="container-wide pb-24 grid md:grid-cols-3 gap-6">
        {[
          { t: 'Ред-флаги', d: 'Покажем тревожные сигналы, которые легко не заметить, когда вы внутри отношений.' },
          { t: 'Грин-флаги', d: 'Опишем ваши сильные стороны — то, на что можно опереться в трудные периоды.' },
          { t: 'Совместимость', d: 'Процент совместимости и расхождения по 7 сферам: от коммуникации до ценностей и границ.' },
        ].map((f) => (
          <div key={f.t} className="card">
            <h3 className="font-serif text-2xl mb-3">{f.t}</h3>
            <p className="text-inkSoft leading-relaxed">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="container-narrow pb-24">
        <h2 className="font-serif text-4xl text-center mb-14">Как это работает</h2>
        <ol className="space-y-8">
          {[
            ['01', 'Отвечает первый партнёр', '17 вопросов о ваших отношениях с его стороны + 3 личных размышления.'],
            ['02', 'Устройство переходит партнёру', 'Второй отвечает на те же вопросы — но уже со своей стороны.'],
            ['03', 'Получаете разбор', 'Персональный отчёт от психолога и нейросети: сильные стороны, тревоги, расхождения и рекомендации.'],
          ].map(([n, t, d]) => (
            <li key={n} className="flex gap-6 items-start">
              <span className="font-serif text-4xl text-clay shrink-0">{n}</span>
              <div>
                <h3 className="text-xl font-medium mb-2">{t}</h3>
                <p className="text-inkSoft leading-relaxed">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-narrow pb-24">
        <div className="bg-ink text-cream rounded-[32px] p-12 md:p-16 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Начните диалог</h2>
          <p className="text-cream/70 mb-10 max-w-lg mx-auto">
            Это не развлекательный тест. Это разговор с собой и партнёром, к которому стоит отнестись серьёзно.
          </p>
          <Link href="/quiz" className="inline-flex items-center justify-center rounded-full bg-cream text-ink px-8 py-4 font-medium hover:bg-blush transition-colors">
            Начать тест
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink/10">
        <div className="container-wide py-10 flex flex-col md:flex-row justify-between gap-4 text-sm text-inkSoft">
          <span>© {new Date().getFullYear()} пара. Сервис не заменяет консультацию психолога.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink">Политика конфиденциальности</a>
            <a href="#" className="hover:text-ink">Оферта</a>
          </div>
        </div>
      </footer>
    </main>
  );
}