import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Produkty - SLZA Print | Tlačiareň',
  description: 'Široký výber tlačiarenských produktov - vizitky, letáky, nálepky, bannery, plagáty, pečiatky a mnoho ďalších. Kvalitná digitálna a ofsetová tlač.',
  keywords: 'produkty tlačiareň, vizitky, letáky, nálepky, bannery, plagáty, pečiatky, tlačiareň Liptov',
  openGraph: {
    title: 'Produkty - SLZA Print',
    description: 'Široký výber tlačiarenských produktov - vizitky, letáky, nálepky, bannery, plagáty, pečiatky a mnoho ďalších.',
    url: 'https://slza.sk/produkty',
    type: 'website',
    locale: 'sk_SK',
  },
  alternates: {
    canonical: 'https://slza.sk/produkty',
  },
};

export default function ProduktyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
