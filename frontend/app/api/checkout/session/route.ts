import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail, orderId, customerName } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email required' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
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
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        orderId: orderId || '',
        customerName: customerName || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/kosik/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/kosik?canceled=true`,
      shipping_address_collection: {
        allowed_countries: ['SK', 'CZ', 'PL', 'HU', 'AT'],
      },
      phone_number_collection: {
        enabled: true,
      },
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
