export function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Пара — психологический чек-ап отношений',
    description: 'Научно-обоснованный анализ отношений для пар: ред-флаги, грин-флаги и совместимость.',
    provider: {
      '@type': 'Person',
      name: 'Шатских Владимир Андреевич',
      taxID: '381296979520',
      email: 'taccard1@mail.ru',
    },
    offers: {
      '@type': 'Offer',
      price: '199.00',
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Россия',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}