import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pedidos El Hornerito Gchu",
  description: "Panadería artesanal y productos congelados en Gualeguaychú. Hacé tu pedido online rápido y fácil.",
  openGraph: {
    title: "Pedidos El Hornerito Gchu",
    description: "Panadería artesanal y productos congelados en Gualeguaychú. Hacé tu pedido online rápido y fácil.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
