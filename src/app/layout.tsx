// src/app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ui/Toast";
import LikesInitializer from "@/components/LikesInitializer";
import ChatManager from "@/components/ChatManager";
import type { Metadata } from "next";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={'bg-gray-100'}>
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