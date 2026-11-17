import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import AudioPlayer from '@/components/AudioPlayer';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://para.layero.app'),
  title: {
    default: 'Пара — психологический чек-ап ваших отношений',
    template: '%s | Пара',
  },
  description: 'Научно-обоснованный анализ отношений для пар. Узнайте свои грин-флаги, ред-флаги и уровень совместимости с помощью нейросети.',
  keywords: ['психология отношений', 'тест на совместимость', 'ред флаги', 'грин флаги', 'чек-ап отношений', 'семейный психолог', 'отношения пары'],
  authors: [{ name: 'Шатских Владимир Андреевич', url: 'https://para.layero.app' }],
  creator: 'Пара',
  publisher: 'Пара',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://para.layero.app',
    title: 'Пара — психологический чек-ап ваших отношений',
    description: 'Научно-обоснованный анализ отношений для пар. Узнайте свои грин-флаги, ред-флаги и уровень совместимости.',
    siteName: 'Пара',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Пара — чек-ап отношений',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Пара — психологический чек-ап ваших отношений',
    description: 'Научно-обоснованный анализ отношений для пар.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://para.layero.app',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <Script 
          src="https://auth.robokassa.ru/merchant/bundle/robokassa-iframe-badge.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="bg-cream text-ink font-sans relative overflow-x-hidden min-h-screen">
        <div className="grain-overlay" />
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        {children}
        <AudioPlayer />
      </body>
    </html>
  );
}