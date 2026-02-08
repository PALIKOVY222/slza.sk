import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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
      payment_method_types: ['card', 'paypal', 'klarna', 'ideal', 'bancontact'],
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
      // Automatické detekcie platby (Apple Pay, Google Pay, Link)
      automatic_tax: { enabled: false },
      
      // Success/Cancel URLs
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/kosik/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/kosik?canceled=true`,
      
      // Shipping info collection
      shipping_address_collection: {
        allowed_countries: ['SK', 'CZ', 'PL', 'HU', 'AT', 'DE'],
      },
      phone_number_collection: {
        enabled: true,
      },
      
      // Billing address
      billing_address_collection: 'auto',
      
      // Locale
      locale: 'sk',
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
