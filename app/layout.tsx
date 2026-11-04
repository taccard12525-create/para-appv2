import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import AudioPlayer from '@/components/AudioPlayer';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });

export const metadata: Metadata = {
  title: 'Пара — психологический чек-ап ваших отношений',
  description: 'Научно-обоснованный анализ отношений: ред-флаги, грин-флаги, совместимость и рекомендации психолога.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-cream text-ink font-sans relative overflow-x-hidden min-h-screen">
        
        {/* Слой тактильного шума поверх всего сайта */}
        <div className="grain-overlay" />

        {/* Плавающие сферы на фоне */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        {children}
        
        {/* Плеер с фоновой музыкой */}
        <AudioPlayer />
        
      </body>
    </html>
  );
}