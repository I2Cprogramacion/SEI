import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { ActividadUsuarioTracker } from "@/components/actividad-usuario-tracker";
import { createMetadata } from "./metadata";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = createMetadata()

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
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="es">
        <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <ActividadUsuarioTracker />
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}