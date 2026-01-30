# SLZA.SK Eshop - Návod na dokončenie

## ✅ Implementované funkcie

### 1. Databáza a backend
- ✅ PostgreSQL databáza s Prisma ORM
- ✅ Autentifikácia používateľov (register/login)
- ✅ Objednávky s položkami
- ✅ Sekvenčné číslovanie objednávok (YYYYMM-N)
- ✅ Upload súborov na ownCloud s orderNumber prefixom
- ✅ Rozšírená schéma pre platby a dopravu

### 2. Frontend
- ✅ Kalkulátory cien (samolepky, bannery, letáky, plagáty)
- ✅ Produktové stránky
- ✅ Nákupný košík s výberom platby a dopravy
- ✅ Packeta widget pre výber výdajného miesta
- ✅ Kalkulácia nákladov na dopravu
- ✅ Registrácia a prihlásenie
- ✅ Užívateľský dashboard s prehľadom objednávok
- ✅ Admin panel so správou objednávok

### 3. Email notifikácie
- ✅ Potvrdenie objednávky pre zákazníka (HTML email s položkami)
- ✅ Notifikácia pre admina o novej objednávke
- ✅ Generovanie a odoslanie faktúr (voliteľné, ovládané cez ENABLE_INVOICES)

### 4. Faktúry
- ✅ Generovanie PDF faktúr
- ✅ Upload faktúr na ownCloud
- ✅ Odoslanie faktúr emailom
- ✅ Konfigurovateľné zapnutie/vypnutie (ENABLE_INVOICES v .env.local)

### 5. Admin funkcie
- ✅ Zobrazenie všetkých objednávok
- ✅ Detail objednávky s položkami a súbormi
- ✅ Zmena stavu objednávky (NEW, PAID, IN_PRODUCTION, READY, SHIPPED, COMPLETED, CANCELLED)
- ✅ Pridanie tracking čísla pre zásielky
- ✅ Automatické nastavenie platby na PAID pri zmene stavu na PAID

## 🔧 Čo je potrebné dokončiť

### 1. Integrácia platobnej brány
Momentálne je len výber platobnej metódy, ale nie je prepojenie s reálnou platobnou bránou.

**Odporúčané riešenia pre SK trh:**
- **ComGate** - https://www.comgate.cz/sk (veľmi populárne na Slovensku)
- **TatraPay** - https://www.tatrabanka.sk/sk/business/ucty-platby/elektronicke-bankovnictvo/tatrapay/
- **Stripe** - https://stripe.com (medzinárodné)

**Postup integrácie (príklad pre ComGate):**

1. Zaregistrujte sa na ComGate a získajte API credentials
2. Vytvorte endpoint `/api/payment/init`:

\`\`\`typescript
// frontend/app/api/payment/init/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { orderId, orderNumber, amount, email } = await req.json();
  
  const comgateParams = {
    merchant: process.env.COMGATE_MERCHANT_ID,
    test: process.env.NODE_ENV !== 'production' ? 'true' : 'false',
    price: Math.round(amount * 100), // v halieroch
    curr: 'EUR',
    label: orderNumber,
    refId: orderId,
    email: email,
    method: 'ALL',
    prepareOnly: 'true',
    lang: 'sk',
    secret: process.env.COMGATE_SECRET
  };

  // Vytvorte request na ComGate API
  const response = await fetch('https://payments.comgate.cz/v1.0/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(comgateParams)
  });

  const data = await response.text();
  // Parse response a vráťte redirect URL
  return NextResponse.json({ paymentUrl: data });
}
\`\`\`

3. Vytvorte callback endpoint `/api/payment/callback`:

\`\`\`typescript
// frontend/app/api/payment/callback/route.ts
export async function POST(req: NextRequest) {
  // Spracujte callback od ComGate
  // Overte podpis
  // Aktualizujte paymentStatus v databáze
  // Odošlite potvrdzovacie emaily
}
\`\`\`

4. V košíku po vytvorení objednávky presmerujte na platbu:

\`\`\`typescript
// V kosik/page.tsx po úspešnom vytvorení objednávky
if (paymentMethod === 'card') {
  const paymentResponse = await fetch('/api/payment/init', {
    method: 'POST',
    body: JSON.stringify({
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      amount: total,
      email: customerEmail
    })
  });
  const { paymentUrl } = await paymentResponse.json();
  window.location.href = paymentUrl; // Presmeruj na platobnú bránu
}
\`\`\`

### 2. Packeta API integrácia
Momentálne je widget pre výber výdajného miesta, ale nie je prepojenie na vytvorenie zásielky.

**Postup:**

1. Získajte API kľúč od Packety
2. Vytvorte endpoint `/api/packeta/create-packet`:

\`\`\`typescript
// frontend/app/api/packeta/create-packet/route.ts
export async function POST(req: NextRequest) {
  const { orderId } = await req.json();
  
  // Načítajte objednávku z databázy
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true }
  });

  // Vytvorte packet cez Packeta API
  const packetData = {
    number: order.orderNumber,
    name: order.customerName,
    email: order.customerEmail,
    phone: order.customerPhone,
    addressId: order.packetaPointId,
    cod: order.paymentMethod === 'cash_on_delivery' ? order.totalAmount : 0,
    value: order.totalAmount,
    weight: 1, // kg - môžete vypočítať podľa produktov
    // ... ďalšie parametre
  };

  const response = await fetch('https://www.zasilkovna.cz/api/rest', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PACKETA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(packetData)
  });

  const result = await response.json();
  
  // Uložte tracking number do databázy
  await prisma.order.update({
    where: { id: orderId },
    data: { trackingNumber: result.barcode }
  });

  return NextResponse.json({ success: true, trackingNumber: result.barcode });
}
\`\`\`

3. Vytvorte endpoint pre stiahnutie štítku `/api/packeta/label/[orderId]`

### 3. Konfigurácia SMTP pre produkciu
V `.env.local` aktualizujte:

\`\`\`env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-real-email@gmail.com"
SMTP_PASS="your-gmail-app-password"  # Vygenerujte v Google Account settings
\`\`\`

**Alternatíva:** Použite profesionálnu službu:
- **SendGrid** - 100 emailov/deň zadarmo
- **Mailgun** - prvých 5000 emailov/mesiac zadarmo
- **Amazon SES** - veľmi lacné

### 4. Automatické statusy objednávok
Môžete pridať automatické aktualizácie:

- Pri úspešnej platbe → automaticky zmeniť status z NEW na PAID
- Pri vytvorení Packeta zásielky → automaticky zmeniť status na SHIPPED
- Po X dňoch od shipped → automaticky zmeniť na COMPLETED

### 5. Produktový admin panel
Momentálne sú ceny fixné zo scraped dát. Môžete pridať:
- Admin rozhranie na úpravu produktov
- Upload obrázkov produktov
- Správa kategórií
- Nastavenie zliav

### 6. Používateľské funkcie
- História objednávok v účte (✅ už implementované)
- Znovuobjednanie (1-click reorder)
- Uložené adresy
- Wishlist

## 📝 Environment Variables

Skopírujte `.env.local` a nastavte svoje hodnoty:

\`\`\`env
# Database
DATABASE_URL="postgresql://pavelkovac@localhost:5432/pavelkovac"

# OwnCloud
OWNCLOUD_URL="https://cloud.repro.sk/remote.php/dav/files/pajko"
OWNCLOUD_USERNAME="pajko"
OWNCLOUD_PASSWORD="P5F6P3Q511"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"  # ZMENIŤ
SMTP_PASS="your-app-password"     # ZMENIŤ
SMTP_FROM="kovac.jr@slza.sk"
SMTP_TO="kovac.jr@slza.sk"
ADMIN_EMAIL="kovac.jr@slza.sk"

# Features
ENABLE_INVOICES="true"  # Nastaviť na "false" ak nechcete faktúry

# Payment Gateway (pridajte po integrácii)
COMGATE_MERCHANT_ID="your-merchant-id"
COMGATE_SECRET="your-secret"

# Packeta (pridajte po registrácii)
PACKETA_API_KEY="a88a0c1ffc3ba5fe"
\`\`\`

## 🚀 Ako spustiť

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Aplikácia bude dostupná na http://localhost:3000

## 🔗 Dôležité URL

- Homepage: http://localhost:3000
- Produkty: http://localhost:3000/produkty
- Košík: http://localhost:3000/kosik
- Prihlásenie: http://localhost:3000/login
- Registrácia: http://localhost:3000/register
- Môj účet: http://localhost:3000/ucet
- Admin: http://localhost:3000/admin

## 📧 Kontakt

Ak potrebujete pomoc s integráciou platobnej brány alebo Packety, napíšte mi na kovac.jr@slza.sk
