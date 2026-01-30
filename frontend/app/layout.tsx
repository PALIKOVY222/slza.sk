import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";

export const metadata: Metadata = {
  title: "SLZA Print - Tlačiareň | Digitálna a Ofsetová Tlač",
  description: "Profesionálna tlačiareň SLZA. Ponúkame digitálnu a ofsetovú tlač, copycentrum, veľkoformátovú tlač a grafický dizajn. Od vizitky po knihu.",
  openGraph: {
    title: "SLZA Print - Tlačiareň | Digitálna a Ofsetová Tlač",
    description: "Profesionálna tlačiareň SLZA. Ponúkame digitálnu a ofsetovú tlač, copycentrum, veľkoformátovú tlač a grafický dizajn. Od vizitky po knihu.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SLZA Print - Tlačiareň | Digitálna a Ofsetová Tlač",
    description: "Profesionálna tlačiareň SLZA. Ponúkame digitálnu a ofsetovú tlač, copycentrum, veľkoformátovú tlač a grafický dizajn. Od vizitky po knihu."
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <head>
        <script src="https://widget.packeta.com/v6/www/js/library.js" async></script>
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
