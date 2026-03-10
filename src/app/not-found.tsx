import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 border border-emerald-500/30">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Page not found
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            This road doesn&apos;t exist.
          </h1>
          <p className="text-base sm:text-lg text-slate-300">
            The page you&apos;re looking for has been moved, deleted, or never existed.
            Let&apos;s get you back to where the journey continues.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center sm:items-stretch">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to homepage
          </Link>
          <Link
            href="/seller/landing"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-900/40 transition-colors w-full sm:w-auto"
          >
            Go to seller landing
          </Link>
        </div>

        <p className="text-xs text-slate-500">
          If you believe this is a mistake, please check the URL or contact support.
        </p>
      </div>
    </main>
  );
}

