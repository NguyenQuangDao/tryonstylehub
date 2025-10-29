import { Navigation } from '../components';
import { AuthProvider } from '../lib/auth-context';
import { ThemeProvider } from '../lib/theme';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}