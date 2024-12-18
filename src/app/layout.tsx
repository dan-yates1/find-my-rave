import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import QueryProvider from "@/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Find My Rave",
  description: "Find the best raves near you!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-black`}>
        <QueryProvider>
          <SessionProviderWrapper>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                {children}
                <Analytics />
              </main>
            </div>
          </SessionProviderWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
