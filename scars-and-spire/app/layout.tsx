import type { Metadata } from 'next';
import { Cinzel, Crimson_Text } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '900'],
  display: 'swap',
});

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Scars & Spire — A Gothic Narrative RPG',
  description:
    'An atmospheric, AI-driven narrative RPG. Choose your archetype, bear your scars, and navigate a world where every choice carries weight.',
  keywords: ['RPG', 'narrative', 'gothic', 'dark fantasy', 'eldritch horror', 'text adventure'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${crimsonText.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
