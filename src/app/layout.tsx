"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { authApi } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Set page title dynamically
    document.title = "AKOD FOOD | Admin Dashboard";
    
    // Set favicon and ensure it updates
    const link: any = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = '/logo.png?v=1'; // Add versioning to bust cache
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (isLoginPage) {
        setIsAuth(false);
        return;
      }

      if (!token) {
        setIsAuth(false);
        router.push('/login');
        return;
      }

      try {
        // Verify token integrity with backend
        await authApi.getMe();
        setIsAuth(true);
      } catch (error: any) {
        // If 401 or other auth error, purge and redirect
        console.error('Session verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuth(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, isLoginPage, router]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Toaster position="top-right" richColors expand={false} />
        <div className="flex min-h-screen bg-[#fcfcfb]">
          {isLoginPage ? (
            <main className="flex-1">
              {children}
            </main>
          ) : isAuth ? (
            <>
              <Sidebar />
              <main className="flex-1 ml-[260px]">
                <Header />
                <div className="p-8">
                  {children}
                </div>
              </main>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#fcfcfb]">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-[#f1f1ee] flex items-center justify-center bg-white shadow-xl">
                  <img src="/logo1.png" className="w-20 h-20 object-contain" alt="AKOD" />
                </div>
                <div className="absolute inset-0 rounded-full border-t-2 border-[#5f7161] animate-spin" />
              </div>
              <div className="mt-8 flex flex-col items-center gap-2">
                <h2 className="text-sm font-bold text-[#4a554b] tracking-[0.2em] uppercase">Starting Admin Panel</h2>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#5f7161] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 rounded-full bg-[#5f7161] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 rounded-full bg-[#5f7161] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
