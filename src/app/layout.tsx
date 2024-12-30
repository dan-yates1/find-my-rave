import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import QueryProvider from "@/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/react";
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Find My Rave | Discover Electronic Music Events Near You',
    template: '%s | Find My Rave'
  },
  description: 'Discover the best electronic music events, raves, and festivals near you. Find tickets, lineup details, and venue information all in one place.',
  keywords: ['rave', 'electronic music', 'events', 'festivals', 'EDM', 'techno', 'house music', 'dance music'],
  openGraph: {
    title: 'Find My Rave | Discover Electronic Music Events Near You',
    description: 'Discover the best electronic music events, raves, and festivals near you.',
    url: 'https://findmyrave.vercel.app',
    siteName: 'Find My Rave',
    images: [
      {
        url: '/og-image.jpg', // You'll need to create this image
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_GB',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // You'll get this from Google Search Console
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <meta name="apple-mobile-web-app-capable" content="no" />
        <body className={`${inter.className} bg-white text-black`}>
          <QueryProvider>
            <SessionProviderWrapper>
              <div className="flex flex-col min-h-screen bg-white">
                <Navbar />
                <main className="flex-grow">
                  {children}
                  <Analytics />
                </main>
                <Footer />
              </div>
            </SessionProviderWrapper>
          </QueryProvider>
        </body>
      </head>
    </html>
  );
}
