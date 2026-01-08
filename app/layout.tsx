/**
 * CR AudioViz AI - Root Layout (FIXED)
 * 
 * FOOTER SPACING FIX:
 * - Body is the flex container (not a wrapper div)
 * - Header inside the flex flow with sticky positioning
 * - Main uses flex-1 to take remaining space
 * - Footer has margin-top: auto as fallback
 * 
 * @timestamp January 8, 2026
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@/styles/phase2-mobile.css';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SocialMediaButtons from "@/components/SocialMediaButtons";
import JavariWidget from '@/components/JavariWidget';
import { CanonicalLink } from '@/components/seo/canonical-link';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' }
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://craudiovizai.com'),
  title: "CR AudioViz AI - Create Apps, Games, Websites & More with AI",
  description: "Empower your creativity with AI-powered creative tools, games, and Javari AI assistant. Build apps, websites, games, and digital content with no coding required.",
  keywords: "AI tools, app builder, game creator, website builder, Javari AI, no-code platform, creative tools, CR AudioViz AI",
  authors: [{ name: "CR AudioViz AI, LLC" }],
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://craudiovizai.com',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'CR AudioViz AI',
    title: 'CR AudioViz AI - Your Story. Our Design.',
    description: 'Create apps, games, and websites with AI-powered tools',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'CR AudioViz AI Platform',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@craudiovizai',
    title: 'CR AudioViz AI',
    description: 'Create apps, games, and websites with AI-powered tools',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      {/* 
        FOOTER SPACING FIX:
        - Body is min-h-screen flex flex-col
        - Header is sticky but inside the flex flow
        - Main is flex-1 (takes remaining space)
        - Footer stays at bottom naturally
      */}
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <CanonicalLink />
        
        {/* Sticky header - inside the flex container */}
        <Header />
        
        {/* Main content - flex-1 takes all available space */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Social + Footer - pushed to bottom by flex-1 main */}
        <SocialMediaButtons />
        <Footer />
        
        {/* Widget overlay */}
        <JavariWidget />
      </body>
    </html>
  );
}
