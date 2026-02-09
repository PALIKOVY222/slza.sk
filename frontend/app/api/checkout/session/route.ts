import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { 
      items, 
      customerEmail, 
      customerName,
      shippingMethod = 'packeta',
      shippingCost = 0,
      packetaPointId,
      packetaPointName
    } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email required' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      // Povoliť všetky moderné platobné metódy
      payment_method_types: ['card'],
      // Automaticky zobrazí Apple Pay, Google Pay, Link ak sú dostupné
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      line_items: [
        ...items.map((item: any) => ({
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.name || 'Produkt',
              description: item.description || '',
              images: item.image ? [item.image] : undefined,
            },
            unit_amount: Math.round(item.price * 100), // Stripe používa centy
          },
          quantity: item.quantity || 1,
        })),
        // Add shipping as line item
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Doprava - ${shippingMethod === 'packeta' ? 'Packeta' : shippingMethod === 'courier' ? 'Kuriér' : 'Osobný odber'}`,
              description: packetaPointName ? `Výdajné miesto: ${packetaPointName}` : '',
            },
            unit_amount: Math.round(shippingCost * 100),
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        customerName: customerName || '',
        shippingMethod,
        packetaPointId: packetaPointId || '',
        packetaPointName: packetaPointName || '',
      },
      
      // Success/Cancel URLs
      success_url: `https://slza.sk/kosik/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://slza.sk/kosik?canceled=true`,
      
      // Billing address
      billing_address_collection: 'required',
      
      // Locale
      locale: 'sk',
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: error.raw?.message || error.toString()
      },
      { status: 500 }
    );
  }
}
