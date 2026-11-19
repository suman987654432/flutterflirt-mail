import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-4xl font-black text-slate-900 mb-2">404</h2>
      <p className="text-slate-600 mb-6 font-medium">Page not found</p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg bg-[#0078d4] text-white font-bold text-sm hover:bg-[#106ebe] transition-colors"
        >
          Open Webmail
        </Link>
        <Link
          href="/landing"
          className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          View Landing Page
        </Link>
      </div>
    </div>
  );
}
