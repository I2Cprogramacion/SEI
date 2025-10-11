
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Clerk Next.js Quickstart",
  description: "Plataforma para conectar investigadores y sus proyectos en el estado de Chihuahua",
    generator: 'v0.app'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          footer: "hidden",
          footerAction: "hidden",
          footerActionLink: "hidden",
          formFooter: "hidden",
          badge: "hidden",
          badgeSecuredByClerk: "hidden",
        },
      }}
    >
      <html lang="es">
        <body className="bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <Navbar />
          <main className="pt-[60px] sm:pt-[65px] lg:pt-[73px]">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
