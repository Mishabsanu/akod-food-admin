"use client";

import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { authApi } from "@/lib/api";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = "AKOD FOOD | Admin Operations Portal";
    
    const link: any = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = '/logo.png?v=2';
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // ignore json parse error
        }
      }
      
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
        const res = await authApi.getMe();
        if (res.data?.data) {
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        }
        setIsAuth(true);
      } catch (error: any) {
        console.error('Session verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuth(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, isLoginPage, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`font-sans bg-[#f8fafc] text-slate-900 antialiased min-h-screen selection:bg-[#546b5a]/20 selection:text-[#546b5a]`}>
        <Toaster position="top-right" richColors expand={false} closeButton />
        <div className="flex min-h-screen bg-[#f8fafc]">
          {isLoginPage ? (
            <main className="flex-1">
              {children}
            </main>
          ) : isAuth ? (
            <>
              <Sidebar 
                user={user} 
                isOpen={mobileSidebarOpen} 
                onClose={() => setMobileSidebarOpen(false)} 
              />
              <div className="flex-1 flex flex-col min-w-0 lg:ml-[240px] transition-all duration-300">
                <Header 
                  user={user} 
                  onOpenSidebar={() => setMobileSidebarOpen(true)} 
                />
                <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1580px] w-full mx-auto">
                  {children}
                </main>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8fafc]">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl border border-slate-200 flex items-center justify-center bg-white shadow-md p-2">
                  <img src="/logo.png" className="w-full h-full object-contain" alt="AKOD" />
                </div>
                <div className="absolute -inset-1.5 rounded-2xl border-2 border-[#0b2e1e] border-t-transparent animate-spin" />
              </div>
              <div className="mt-5 flex flex-col items-center gap-1">
                <h2 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase">Authenticating Portal</h2>
                <p className="text-[10px] text-slate-400 font-medium">Verifying security session...</p>
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
