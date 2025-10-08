"use client"

import { ClerkProvider } from "@clerk/nextjs";

export default function ClerkLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}