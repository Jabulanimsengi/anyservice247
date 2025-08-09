// src/app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ui/Toast";
import LikesInitializer from "@/components/LikesInitializer";
import ChatManager from "@/components/ChatManager";
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { SpeedInsights } from "@vercel/speed-insights/next"; // <-- 1. Add the import here

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'HomeService24/7 - Find Trusted Local Service Pros in South Africa',
    template: '%s | HomeService24/7',
  },
  description: "Your one-stop marketplace for trusted, verified, and reviewed home service providers across South Africa. Get quotes for plumbing, electrical, and more.",
  keywords: "home services, plumbers, electricians, handymen, local pros, South Africa, quotes",
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
        <SpeedInsights /> {/* <-- 2. Add the component here, before the closing </body> tag */}
      </body>
    </html>
  );
}