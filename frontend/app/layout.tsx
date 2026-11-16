import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FlutterFlirt Mail',
  description: 'Self-hosted business email platform for FlutterFlirt clients',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="overflow-hidden h-screen bg-slate-50">{children}</body>
    </html>
  );
}

