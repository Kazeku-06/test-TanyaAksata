import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "TanyaAksata",
    template: "%s | TanyaAksata",
  },
  description: "Platform tanya jawab komunitas — tempat bertanya, berbagi, dan berkembang bersama.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full" suppressHydrationWarning>
      {/* Tambahkan suppressHydrationWarning di body juga */}
      <body className="min-h-full bg-[#f0f7ff] text-[#1e293b] antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
