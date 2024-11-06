import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

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
      <head>
        <script
          async
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        />
      </head>
      <body className={`${inter.className} bg-white text-black`}>
        <SessionProviderWrapper>
          <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <main className="flex-grow">{children}</main>
            {/* <Footer /> */}
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
