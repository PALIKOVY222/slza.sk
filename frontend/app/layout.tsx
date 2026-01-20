import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SLZA Print - Tlačiareň | Digitálna a Ofsetová Tlač",
  description: "Profesionálna tlačiareň SLZA. Ponúkame digitálnu a ofsetovú tlač, copycentrum, veľkoformátovú tlač a grafický dizajn. Od vizitky po knihu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body>
        {children}
      </body>
    </html>
  );
}
