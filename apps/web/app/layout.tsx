import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "AI SaaS Starter Kit",
    template: "%s · AI SaaS Starter Kit",
  },
  description:
    "Production-grade, multi-tenant AI SaaS starter — Next.js 16, NestJS, Prisma, Stripe and streaming OpenAI chat, built with DDD and Clean Architecture.",
  applicationName: "AI SaaS Starter Kit",
  authors: [{ name: "AI SaaS Starter Kit" }],
  keywords: [
    "AI SaaS",
    "Next.js",
    "NestJS",
    "Prisma",
    "multi-tenant",
    "DDD",
    "Clean Architecture",
    "Stripe",
    "OpenAI",
  ],
  openGraph: {
    title: "AI SaaS Starter Kit",
    description:
      "Multi-tenant AI SaaS starter with streaming chat, billing and RBAC — DDD + Clean Architecture.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
