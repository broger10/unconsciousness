import type { Metadata } from "next";
import { Fraunces, Syne, Cormorant_Infant } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const cormorantInfant = Cormorant_Infant({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "unconsciousness — il tuo specchio cosmico",
  description:
    "L'unica app che combina astrologia profonda e AI per mostrarti chi sei davvero. Le tue ombre, i tuoi doni nascosti, il tuo destino cosmico.",
  keywords: ["astrologia", "AI", "tema natale", "consapevolezza", "oroscopo intelligente"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark">
      <body
        className={`${fraunces.variable} ${syne.variable} ${cormorantInfant.variable} antialiased min-h-screen grain`}
      >
        <div className="fixed inset-0 aurora-bg pointer-events-none" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
