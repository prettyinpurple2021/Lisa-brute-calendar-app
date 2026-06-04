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
