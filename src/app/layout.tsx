import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Layout } from "./components/Layout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIStyleHub - AI Virtual Try-On & Fashion Platform",
  description: "Next.js app with FASHN AI virtual try-on, AI recommendations, and AI-generated fashion content",
  keywords: ["FASHN AI", "virtual try-on", "fashion tech", "AI clothing", "next.js", "AI fashion", "OpenAI", "DALL-E"],
  authors: [{ name: "AIStyleHub Team" }],
  openGraph: {
    title: "AIStyleHub - AI Virtual Try-On & Fashion Platform",
    description: "Try on clothing virtually with FASHN AI's advanced technology, get AI recommendations, and generate fashion images",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <Layout>
              {children}
            </Layout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
