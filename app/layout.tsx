import type React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Space_Mono } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "VibeOS | Solo Founder Command Center",
  description: "Your AI-powered startup toolkit - Calendar, Tasks, Notes, Analytics, Chat, Files & Settings in one funky interface",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#ff00aa",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
