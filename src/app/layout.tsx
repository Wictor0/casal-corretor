import '@fontsource-variable/outfit';
import '@fontsource-variable/bodoni-moda/wght-italic.css';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Casal Corretor', description: 'Curadoria de lares com personalidade para quem vive São Paulo com estilo.', robots: { index: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="pt-BR"><body>{children}</body></html>);
}
