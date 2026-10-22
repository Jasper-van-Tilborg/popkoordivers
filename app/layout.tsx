import type { Metadata } from "next";
import { Manrope, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { getInstellingen } from "@/lib/instellingen";
import { InstellingenProvider } from "@/components/InstellingenProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Popkoor Divers — Koor uit Gilze",
  description:
    "Popkoor Divers is een bruisend popkoor uit Gilze. Samen zingen, samen genieten. Ontdek wie we zijn en kom een keer luisteren!",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
    other: [
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const instellingen = await getInstellingen();
  return (
    <html lang="nl" className={`${manrope.variable} ${bricolage.variable}`}>
      <body>
        <InstellingenProvider value={instellingen}>{children}</InstellingenProvider>
      </body>
    </html>
  );
}
