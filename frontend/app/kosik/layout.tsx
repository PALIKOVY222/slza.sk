import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nákupný košík - SLZA Print',
  description: 'Dokončite objednávku vašich tlačiarenských produktov. Bezpečná platba, rýchla dodávka.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function KosikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
