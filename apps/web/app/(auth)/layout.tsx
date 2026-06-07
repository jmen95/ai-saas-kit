import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 py-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          AI SaaS Kit
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
