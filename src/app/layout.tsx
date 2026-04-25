import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/nav";

export const metadata: Metadata = {
  title: "La Paltería · Facturador",
  description: "Sistema de gestión y facturación",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex">
        <Nav />
        <main className="flex-1 min-h-screen bg-[#fdf8f0] overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
