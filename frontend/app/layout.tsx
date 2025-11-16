import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { MobileNav } from "@/components/navigation/MobileNav";
import { WebVitals } from "./web-vitals";
import { ToastProvider } from "@/components/common/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
});

export const metadata: Metadata = {
  title: "TUTOR - AI Learning Platform",
  description: "Interactive learning powered by Gemini AI and Wolfram Alpha",
};

// Separate viewport export (Next.js 14+ requirement)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WebVitals />
        <AuthProvider>
          <ToastProvider />
          {children}
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
