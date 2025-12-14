import MainContentWrapper from '@/components/layout/MainContentWrapper';
import AppHeader from '../components/common/AppHeader';
import AppSidebar from '../components/common/AppSidebar';
import Navigation from '../components/common/Navigation';
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
      <body className="min-h-screen bg-background font-sans antialiased text-sm">
        <ThemeProvider>
          <AuthProvider>
            <AppSidebar />
            <MainContentWrapper>
              <Navigation />
              <AppHeader />
              <main className="max-w-full py-8">
                {children}
              </main>
            </MainContentWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
