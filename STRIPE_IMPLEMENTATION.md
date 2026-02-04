# Stripe Payment Gateway - Implementačný Plán

## 1. Prípravné Kroky

### 1.1 Stripe Account Setup
1. Vytvor Stripe účet na https://stripe.com
2. Dokončiť onboarding proces
3. Aktivovať test mód a získať test API kľúče
4. Neskôr aktivovať production mód

### 1.2 Získanie API Kľúčov
```
Test Mode:
- Publishable key: pk_test_...
- Secret key: sk_test_...

Production Mode (neskôr):
- Publishable key: pk_live_...
- Secret key: sk_live_...
```

### 1.3 Environment Variables
Pridať do `.env.local`:
```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# URL pre webhooks
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 2. Technická Implementácia

### 2.1 Inštalácia balíčkov
Už nainštalované:
- ✅ stripe ^20.3.0

### 2.2 Vytvorenie API Endpoints

#### A) `/api/checkout/session` - Vytvorenie Stripe Checkout Session
```typescript
// app/api/checkout/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail, orderId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: item.description,
          },
          unit_amount: Math.round(item.price * 100), // Stripe používa centy
        },
        quantity: item.quantity || 1,
      })),
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        orderId: orderId,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/kosik/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/kosik?canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### B) `/api/webhooks/stripe` - Spracovanie Stripe webhookov
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Spracovanie rôznych typov eventov
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      // Aktualizuj stav objednávky v databáze
      // await updateOrderStatus(session.metadata.orderId, 'paid');
      console.log('Payment successful for order:', session.metadata?.orderId);
      break;
    }
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent successful:', paymentIntent.id);
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);
      // Oznámenie zákazníkovi o neúspešnej platbe
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
```

### 2.3 Frontend Komponenty

#### A) Stripe Provider Setup
```typescript
// app/providers/StripeProvider.tsx
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function StripeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
```

#### B) Checkout Button Component
```typescript
// app/components/CheckoutButton.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutButton({ 
  items, 
  customerEmail,
  orderId 
}: { 
  items: any[]; 
  customerEmail: string;
  orderId: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerEmail, orderId }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Stripe redirect error:', error);
        alert('Platba zlyhala. Skúste to znova.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Nastala chyba pri vytváraní platby.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-[#0087E3] text-white py-3 px-6 rounded-md hover:bg-[#006BB3] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Načítavam...' : 'Prejsť na platbu'}
    </button>
  );
}
```

#### C) Success Page
```typescript
// app/kosik/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Odoslať notifikáciu do backendu
      // Vyčistiť košík
      localStorage.removeItem('cart');
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Platba úspešná!</h1>
          <p className="text-gray-600 mb-6">
            Ďakujeme za vašu objednávku. Potvrdenie sme vám odoslali na email.
          </p>
          <a 
            href="/"
            className="inline-block bg-[#0087E3] text-white py-3 px-6 rounded-md hover:bg-[#006BB3]"
          >
            Späť na hlavnú stránku
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
```

## 3. Integrácia do Košíka

Upraviť `/app/kosik/page.tsx`:
```typescript
import CheckoutButton from '../components/CheckoutButton';

// V komponente:
<CheckoutButton 
  items={cartItems}
  customerEmail={userEmail}
  orderId={newOrderId}
/>
```

## 4. Webhook Configuration

### 4.1 Lokálne Testovanie
```bash
# Nainštaluj Stripe CLI
brew install stripe/stripe-cli/stripe

# Prihlás sa
stripe login

# Presmeruj webhooks na localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4.2 Production Webhooks
1. V Stripe Dashboard: Developers > Webhooks
2. Pridaj endpoint: `https://slza.sk/api/webhooks/stripe`
3. Vyber eventy: 
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Skopíruj webhook secret do `.env`

## 5. Next.js Config

Upraviť `next.config.ts`:
```typescript
const nextConfig = {
  // ... existujúca konfigurácia
  async headers() {
    return [
      {
        source: '/api/webhooks/stripe',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
};
```

## 6. Testovanie

### 6.1 Test Card Numbers
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

### 6.2 Test Flow
1. Pridať položky do košíka
2. Kliknúť na "Prejsť na platbu"
3. Zadať test údaje karty
4. Skontrolovať webhook logy
5. Overiť success page

## 7. Security Checklist

- ✅ API kľúče v environment variables
- ✅ Webhook signature verification
- ✅ HTTPS v produkcii
- ✅ Amount validation server-side
- ✅ Rate limiting na API endpoints
- ⚠️ Implementovať CSRF protection
- ⚠️ Input sanitization

## 8. Ďalšie Kroky

1. **Daňové nastavenia**: Nastaviť daňové sadzby v Stripe Dashboard
2. **Email notifikácie**: Stripe môže posielať automatické emaily
3. **Faktúry**: Stripe Billing pre automatické faktúry
4. **Refunds**: Implementovať refund API
5. **Subscriptions**: Pre opakované platby (ak je potrebné)

## 9. Monitoring & Analytics

- Stripe Dashboard: Real-time payment monitoring
- Webhook logs: Sledovať úspešnosť webhookov
- Error tracking: Integrovať Sentry alebo similar
- Analytics: Google Analytics enhanced ecommerce tracking

## 10. Compliance

- **GDPR**: Stripe je GDPR compliant
- **PCI DSS**: Stripe hostí payment forms (nemusíš certifikáciu)
- **SCA**: Strong Customer Authentication (automaticky handled)

## Potrebné súbory na vytvorenie:

1. `app/api/checkout/session/route.ts` ✅
2. `app/api/webhooks/stripe/route.ts` ✅
3. `app/components/CheckoutButton.tsx` ✅
4. `app/kosik/success/page.tsx` ✅
5. `.env.local` (aktualizovať) ⚠️

## Estimated Implementation Time: 4-6 hodín

---

**Poznámka**: Tento dokument obsahuje kompletný postup. Po získaní Stripe API kľúčov môžem vytvoriť všetky potrebné súbory.
