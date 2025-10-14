
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { ActividadUsuarioTracker } from "@/components/actividad-usuario-tracker";

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
      <html lang="es" className="m-0 p-0">
        <body className="m-0 p-0 min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <ActividadUsuarioTracker />
          <Navbar />
          <main className="pt-[60px] sm:pt-[65px] lg:pt-[73px]">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
