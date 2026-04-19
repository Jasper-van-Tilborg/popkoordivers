import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Popkoordivers — Koor uit Gilze",
  description:
    "Popkoordivers is een bruisend popkoor uit Gilze. Samen zingen, samen genieten. Ontdek wie we zijn en kom een keer luisteren!",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
