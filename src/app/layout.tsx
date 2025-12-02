import AppSidebar from '../components/common/AppSidebar';
import AppHeader from '../components/common/AppHeader';
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
              <AppHeader />
              <main className="px-4 py-6">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
