import type React from "react"
import type { Metadata, Viewport } from "next"
import { Emilys_Candy, Henny_Penny } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const emilysCandy = Emilys_Candy({ 
  subsets: ["latin"],
  weight: "400",
  variable: "--font-emilys-candy",
  display: "swap",
})

const hennyPenny = Henny_Penny({ 
  subsets: ["latin"],
  weight: "400",
  variable: "--font-henny-penny",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "VibeOS | Solo Founder Command Center",
    template: "%s | VibeOS",
  },
  description: "Your AI-powered productivity toolkit for solo founders - Calendar, Tasks, Notes, Analytics, Chat, Files & more in one vibrant interface",
  keywords: ["productivity", "solo founder", "startup", "task management", "calendar", "notes", "habit tracking", "ai assistant"],
  authors: [{ name: "VibeOS" }],
  creator: "VibeOS",
  publisher: "VibeOS",
  metadataBase: new URL("https://vibeos.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vibeos.app",
    siteName: "VibeOS",
    title: "VibeOS | Solo Founder Command Center",
    description: "Your AI-powered productivity toolkit for solo founders - Calendar, Tasks, Notes, Analytics, Chat, Files & more in one vibrant interface",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VibeOS - Solo Founder Command Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeOS | Solo Founder Command Center",
    description: "Your AI-powered productivity toolkit for solo founders",
    images: ["/og-image.png"],
    creator: "@vibeos",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ff00aa" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${emilysCandy.variable} ${hennyPenny.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1a1a2e',
              border: '4px solid #1a1a2e',
              borderRadius: '12px',
              fontWeight: 'bold',
              boxShadow: '4px 4px 0 #1a1a2e',
            },
            success: {
              iconTheme: {
                primary: '#00ff88',
                secondary: '#1a1a2e',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff4466',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
