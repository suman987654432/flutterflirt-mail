import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FlutterFlirt Mail — Private Sovereign Business Email & Admin Console',
  description: 'Enterprise-grade self-hosted business email platform with Outlook 365 ergonomics, automated SPF/DKIM deliverability, and multi-tenant management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans selection:bg-[#0078d4] selection:text-white">
        {children}
      </body>
    </html>
  );
}

