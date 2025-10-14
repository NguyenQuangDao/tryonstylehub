'use client'

import { useAuth } from "@/lib/auth-context";
import { AnimatePresence, motion } from "framer-motion";
import { Home, LogIn, LogOut, Menu, Settings, ShoppingBag, Sparkles, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

const navLinks = [
  { href: "/", label: "Trang Chủ", icon: Home },
  { href: "/recommend", label: "Gợi Ý AI", icon: Sparkles },
  { href: "/generate-image", label: "Tạo Ảnh AI", icon: Sparkles },
  { href: "/products", label: "Sản Phẩm", icon: ShoppingBag },
  { href: "/dashboard", label: "Bảng Điều Khiển", icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden">
        <header className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-950/70 shadow-sm">
          <div className="mx-auto flex items-center justify-between px-8 py-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                  AIStyleHub
                </span>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative group ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                      {!isActive && (
                        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 w-0 group-hover:w-3/4" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />

              {/* User Menu - Desktop */}
              {!loading && (
                <div className="hidden md:block relative">
                  {user ? (
                    <>
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <span className="hidden lg:inline text-sm font-semibold">{user.name}</span>
                      </button>
                      
                      <AnimatePresence>
                        {userMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl"
                          >
                            <div className="p-2">
                              <Link
                                href="/profile"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                              >
                                <User className="h-4 w-4" />
                                <span>Hồ Sơ</span>
                              </Link>
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 text-left"
                              >
                                <LogOut className="h-4 w-4" />
                                <span>Đăng Xuất</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        href="/login"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                      >
                        <LogIn className="h-4 w-4" />
                        Đăng Nhập
                      </Link>
                      <Link
                        href="/register"
                        className="px-6 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Đăng Ký
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <motion.div
            initial={false}
            animate={{ height: mobileMenuOpen ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl"
          >
            <nav className="px-6 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Auth Buttons */}
              {!loading && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        {user.name}
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng Xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-3 py-2 text-sm font-medium text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Đăng Nhập
                      </Link>
                      <Link
                        href="/register"
                        className="block px-3 py-2 text-sm font-medium text-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Đăng Ký
                      </Link>
                    </>
                  )}
                </div>
              )}
            </nav>
          </motion.div>
        </header>

        <main className="container mx-auto py-10">
          {children}
        </main>

        <footer className="border-t border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  © {new Date().getFullYear()} AIStyleHub. Tất cả quyền được bảo lưu.
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Được tạo ra với trí tuệ phong cách AI ✨
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}

