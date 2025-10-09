
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
    // @ts-expect-error - ClerkProvider is async in Clerk 6.x with Next.js 15
    <ClerkProvider>
      <html lang="es">
        <body>
          <header>
            {/* Botones de Clerk ocultos, solo acceso por /iniciar-sesion */}
          </header>
          <Navbar />
          <main className="flex-1">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
