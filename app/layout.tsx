import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

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
        className="antialiased min-h-screen grain"
      >
        <div className="fixed inset-0 aurora-bg pointer-events-none" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
