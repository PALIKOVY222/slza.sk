import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";

export const metadata: Metadata = {
  metadataBase: new URL('https://slza.sk'),
  title: {
    default: "SLZA Print - Tlačiareň na Liptove | Digitálna a Ofsetová Tlač",
    template: "%s | SLZA Print"
  },
  description: "Profesionálna tlačiareň SLZA na Liptove. Ponúkame digitálnu a ofsetovú tlač, copycentrum, veľkoformátovú tlač a grafický dizajn. Od vizitky po knihu - kvalitné služby, rýchla dodávka.",
  keywords: "tlačiareň, tlačiareň Liptov, digitálna tlač, ofsetová tlač, veľkoformátová tlač, vizitky, letáky, bannery, plagáty, nálepky, grafický dizajn, SLZA print",
  authors: [{ name: "SLZA Print" }],
  creator: "SLZA Print",
  publisher: "SLZA Print",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "SLZA Print - Tlačiareň Prešov | Digitálna a Ofsetová Tlač",
    description: "Profesionálna tlačiareň SLZA v Prešove. Ponúkame digitálnu a ofsetovú tlač, copycentrum, veľkoformátovú tlač a grafický dizajn. Od vizitky po knihu.",
    url: 'https://slza.sk',
    siteName: 'SLZA Print',
    locale: 'sk_SK',
    type: "website",
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SLZA Print - Profesionálna tlačiareň',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SLZA Print - Tlačiareň na Liptove | Digitálna a Ofsetová Tlač",
    description: "Profesionálna tlačiareň SLZA na Liptove. Ponúkame digitálnu a ofsetovú tlač, copycentrum, veľkoformátovú tlač a grafický dizajn. Od vizitky po knihu.",
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://slza.sk',
  },
  verification: {
    google: 'your-google-verification-code', // Nahraď reálnym kódom z Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'SLZA Print',
    description: 'Profesionálna tlačiareň na Liptove ponúkajúca digitálnu tlač, ofsetovú tlač, veľkoformátovú tlač a grafický dizajn',
    url: 'https://slza.sk',
    telephone: '+421-XX-XXX-XXXX', // Nahraď reálnym číslom
    email: 'info@slza.sk',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Vaša adresa', // Nahraď reálnou adresou
      addressLocality: 'Liptov',
      addressRegion: 'Žilinský kraj',
      postalCode: 'XXX XX',
      addressCountry: 'SK'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 49.0, // Nahraď reálnymi súradnicami
      longitude: 21.0
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00'
      }
    ],
    priceRange: '€€',
    image: 'https://slza.sk/images/og-image.jpg',
    sameAs: [
      // Pridaj sociálne siete ak máte
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150'
    }
  };

  return (
    <html lang="sk">
      <head>
        <script src="https://widget.packeta.com/v6/www/js/library.js" async></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
