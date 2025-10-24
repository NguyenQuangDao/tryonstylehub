import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme";
import type { Metadata } from "next";
import { Layout } from "./components/Layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIStyleHub - AI Virtual Try-On & Fashion Platform",
  description: "Next.js app with FASHN AI virtual try-on, AI recommendations, and AI-generated fashion content",
  keywords: ["FASHN AI", "virtual try-on", "fashion tech", "AI clothing", "next.js", "AI fashion", "OpenAI", "DALL-E"],
  authors: [{ name: "AIStyleHub Team" }],
  icons: {
    icon: '/logo/logo.png',
    shortcut: '/logo/logo.png',
    apple: '/logo/logo.png',
  },
  openGraph: {
    title: "AIStyleHub - AI Virtual Try-On & Fashion Platform",
    description: "Try on clothing virtually with FASHN AI's advanced technology, get AI recommendations, and generate fashion images",
    images: ['/logo/logo.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FFFFFF" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme-preference') || 'system';
                  const isDark = theme === 'dark' || 
                    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.body.classList.add('dark');
                    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                    if (metaThemeColor) metaThemeColor.setAttribute('content', '#000000');
                  } else {
                    document.documentElement.classList.add('light');
                    document.body.classList.add('light');
                    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                    if (metaThemeColor) metaThemeColor.setAttribute('content', '#FFFFFF');
                  }
                } catch (e) {
                  // Theme initialization error
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className="antialiased"
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
