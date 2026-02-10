import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontakt - SLZA Print | Tlačiareň na Liptove',
  description: 'Kontaktujte nás pre profesionálne tlačiarenské služby. SLZA Print na Liptove - digitálna tlač, ofsetová tlač, veľkoformátová tlač. Rýchla dodávka, kvalitné služby.',
  keywords: 'kontakt tlačiareň, tlačiareň Liptov, SLZA print kontakt, objednávka tlač, tlačiareň telefón',
  openGraph: {
    title: 'Kontakt - SLZA Print na Liptove',
    description: 'Kontaktujte nás pre profesionálne tlačiarenské služby. Rýchla dodávka, kvalitné služby.',
    url: 'https://slza.sk/kontakt',
    type: 'website',
    locale: 'sk_SK',
  },
  alternates: {
    canonical: 'https://slza.sk/kontakt',
  },
};

export default function KontaktLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
