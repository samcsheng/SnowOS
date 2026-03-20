import type { Metadata } from "next"
import { Newsreader, Inter } from "next/font/google"
import "./globals.css"
import { DataProvider } from "@/app/lib/store/data-provider"
import { RoleSwitcher } from "@/app/components/role-switcher"
import { Toaster } from "@/components/ui/sonner"

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
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
      className={`${newsreader.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-[#F8F8F8]">
        <DataProvider>
          <RoleSwitcher />
          <main className="flex-1 min-h-0">{children}</main>
          <Toaster />
        </DataProvider>
      </body>
    </html>
  )
}
