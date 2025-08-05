// src/app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ui/Toast";
import LikesInitializer from "@/components/LikesInitializer";
import ChatManager from "@/components/ChatManager";
import type { Metadata } from "next";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "HomeServices24/7 - Find Trusted Service Providers",
  description: "Your one-stop marketplace for trusted home service providers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <LikesInitializer />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        <ToastContainer />
        <ChatManager />
      </body>
    </html>
  );
}