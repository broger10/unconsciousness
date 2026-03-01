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
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const cormorant = Cormorant_Infant({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
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
    <html lang="it" className={`dark ${fraunces.variable} ${syne.variable} ${cormorant.variable}`}>
      <body
        className="antialiased min-h-screen grain"
      >
        <div className="fixed inset-0 aurora-bg pointer-events-none" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
