import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative z-10">
      <nav className="container-wide flex items-center justify-between py-6">
        <span className="font-serif text-2xl tracking-tight">пара<span className="text-terra">.</span></span>
        <Link href="/quiz" className="text-sm text-inkSoft hover:text-terra transition-colors">Начать →</Link>
      </nav>

      <section className="container-narrow text-center pt-20 pb-24 relative">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-inkSoft bg-white/50 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 border border-white/80 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-terra" />
          Психология отношений
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-tight mb-8">
          Понять друг друга<br/>
          <span className="italic text-terra">глубже</span>, чем вчера
        </h1>
        
        <p className="text-lg md:text-xl text-inkSoft leading-relaxed max-w-2xl mx-auto mb-12">
          Научно-обоснованный чек-ап ваших отношений. Сначала отвечает один партнёр,
          затем второй. Затем — честный разбор, где вы совпадаете, а где нет.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/quiz" className="btn-primary text-lg px-10 py-5 hover:scale-[1.02]">
            Пройти тест
          </Link>
          <span className="text-sm text-inkSoft italic font-serif">двое · ~15 минут на обоих</span>
        </div>
      </section>

      <section className="container-wide pb-24 grid md:grid-cols-3 gap-6 relative z-10">
        {[
          { t: 'Ред-флаги', d: 'Покажем тревожные сигналы, которые легко не заметить, когда вы внутри отношений.' },
          { t: 'Грин-флаги', d: 'Опишем ваши сильные стороны — то, на что можно опереться в трудные периоды.' },
          { t: 'Совместимость', d: 'Процент совместимости и расхождения по 7 сферам: от коммуникации до ценностей и границ.' },
        ].map((f) => (
          <div key={f.t} className="card hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blush/20 rounded-bl-full -z-10" />
            <h3 className="font-serif text-2xl mb-3">{f.t}</h3>
            <p className="text-inkSoft leading-relaxed">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="container-narrow pb-24 relative z-10">
        <div className="bg-ink text-cream rounded-[40px] p-12 md:p-16 text-center shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-terra/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose/20 rounded-full blur-2xl" />
          
          <h2 className="font-serif text-4xl md:text-5xl mb-6 relative z-10">Начните <span className="italic text-rose">диалог</span></h2>
          <p className="text-cream/70 mb-10 max-w-lg mx-auto relative z-10">
            Это не развлекательный тест. Это разговор с собой и партнёром, к которому стоит отнестись серьёзно.
          </p>
          <Link href="/quiz" className="inline-flex items-center justify-center rounded-full bg-cream text-ink px-8 py-4 font-medium hover:bg-rose transition-colors relative z-10">
            Начать тест
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink/5 relative z-10 bg-white/30 backdrop-blur-sm">
        <div className="container-wide py-10 flex flex-col md:flex-row justify-between gap-4 text-sm text-inkSoft">
          <span>© {new Date().getFullYear()} пара. Сервис не заменяет консультацию психолога.</span>
          <div className="flex gap-6">
            {/* Исправленные ссылки через компонент Link */}
            <Link href="/privacy" className="hover:text-terra transition-colors">Политика конфиденциальности</Link>
            <Link href="/offer" className="hover:text-terra transition-colors">Оферта</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}