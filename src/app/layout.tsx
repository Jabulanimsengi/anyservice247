// src/app/layout.tsx
import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // Commented out the problematic import
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ui/Toast";
import LikesInitializer from "@/components/LikesInitializer";

// const inter = Inter({ subsets: ["latin"] }); // This line is no longer needed

export const metadata = {
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
        {/* Added direct link to Google Fonts stylesheet */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      {/* Removed the inter.className from the body tag */}
      <body className={`bg-gray-100`}>
        <LikesInitializer />
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