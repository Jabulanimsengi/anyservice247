// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ui/Toast";
import LikesInitializer from "@/components/LikesInitializer"; // Import the initializer

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "anyservice24/7 - Find Trusted Service Providers",
  description: "South Africa's new marketplace for trusted service providers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <LikesInitializer /> {/* Add initializer here */}
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}