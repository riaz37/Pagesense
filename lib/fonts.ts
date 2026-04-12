import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';

export const fontLatin = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-latin',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,
});

export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,
});

export const fontVariables = `${fontLatin.variable} ${fontArabic.variable}`;
