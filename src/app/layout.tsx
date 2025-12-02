import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import Sidebar from "@/components/sidebar/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taskal",
  description: "タスク管理アプリケーション",
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
        <SessionProvider>
          <SidebarProvider>
            <Header />
            <Sidebar />
            <div className="pt-16 md:ml-64">
              <QueryProvider>{children}</QueryProvider>
            </div>
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
