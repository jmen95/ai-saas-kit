import Link from "next/link";
import { Button } from "@repo/ui";

const FEATURES = [
  {
    title: "Multi-tenant by design",
    description:
      "Every query is scoped by organizationId with a TenantGuard. Zero cross-tenant leaks, enforced at the edge of each request.",
  },
  {
    title: "Streaming AI chat",
    description:
      "Server-Sent Events stream OpenAI tokens in real time. Works out of the box with a mock provider — add a key for live models.",
  },
  {
    title: "Plans & billing",
    description:
      "Stripe checkout, customer portal and per-plan usage limits (FREE / PRO / ENTERPRISE) enforced in the domain layer.",
  },
  {
    title: "DDD + Clean Architecture",
    description:
      "Five bounded contexts, one use-case per file, domain entities free of framework code. Built to scale and to read.",
  },
  {
    title: "Auth that holds up",
    description:
      "JWT access tokens, rotating hashed refresh tokens, automatic silent refresh on the client and rate-limited auth routes.",
  },
  {
    title: "Team management",
    description:
      "Invite teammates by secure link, manage roles (OWNER / ADMIN / MEMBER) and respect per-plan seat limits.",
  },
];

const STACK = [
  "Next.js 16",
  "NestJS",
  "Prisma",
  "PostgreSQL",
  "Stripe",
  "OpenAI",
  "Turborepo",
  "Tailwind",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold tracking-tight">AI SaaS Kit</span>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Open-source AI SaaS starter
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Ship a multi-tenant AI product in days, not months.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            A production-grade starter kit with streaming AI chat, organizations,
            billing and RBAC — engineered with Domain-Driven Design and Clean
            Architecture so it stays maintainable as you grow.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Create your workspace</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Live demo
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {STACK.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 text-left"
              >
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>AI SaaS Starter Kit</span>
          <span>Next.js 16 · NestJS · Prisma · DDD</span>
        </div>
      </footer>
    </div>
  );
}
