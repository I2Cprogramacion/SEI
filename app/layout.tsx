import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { createMetadata } from "./metadata";
import { PerfilProvider } from "@/components/investigador-link";

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
        <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
          <PerfilProvider>
            <Navbar />
            <main className="pt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-100/20 via-transparent to-white/50 pointer-events-none" />
              <div className="relative z-10">{children}</div>
            </main>
            <Footer />
          </PerfilProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}