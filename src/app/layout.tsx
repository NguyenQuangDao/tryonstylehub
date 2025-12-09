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
            <div className="min-h-screen ml-64">
              <Navigation />
              <AppHeader />
              <main className="max-w-full">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
