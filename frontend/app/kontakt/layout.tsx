import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontakt - SLZA Print | Tlačiareň Prešov',
  description: 'Kontaktujte nás pre profesionálne tlačiarenské služby. SLZA Print Prešov - digitálna tlač, ofsetová tlač, veľkoformátová tlač. Rýchla dodávka, kvalitné služby.',
  keywords: 'kontakt tlačiareň, tlačiareň Prešov, SLZA print kontakt, objednávka tlač, tlačiareň telefón',
  openGraph: {
    title: 'Kontakt - SLZA Print Prešov',
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
