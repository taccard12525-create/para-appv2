import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });

export const metadata: Metadata = {
  title: 'Пара — психологический чек-ап ваших отношений',
  description: 'Научно-обоснованный анализ отношений: ред-флаги, грин-флаги, совместимость и рекомендации психолога.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-cream text-ink font-sans">{children}</body>
    </html>
  );
}