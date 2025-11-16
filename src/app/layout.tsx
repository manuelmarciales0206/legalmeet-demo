import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';  // ← ESTA LÍNEA DEBE ESTAR

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LegalMeet - Tu asesoría jurídica al instante',
  description: 'Conecta con abogados certificados',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}