import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProviderWrapper>
            <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
