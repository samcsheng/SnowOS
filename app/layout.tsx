import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { DataProvider } from "@/app/lib/store/data-provider"
import { RoleSwitcher } from "@/app/components/role-switcher"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SnowOS — Ski School Management",
  description: "Manage lessons, instructors, and guest experiences at your snow sports school",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DataProvider>
          <RoleSwitcher />
          <main className="flex-1">{children}</main>
          <Toaster />
        </DataProvider>
      </body>
    </html>
  )
}
