'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutButtonProps {
  items: Array<{
    name: string;
    description?: string;
    price: number;
    quantity?: number;
    image?: string;
  }>;
  customerEmail?: string;
  customerName?: string;
  shippingMethod?: string;
  shippingCost?: number;
  packetaPointId?: string;
  packetaPointName?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function CheckoutButton({ 
  items, 
  customerEmail = '',
  customerName = '',
  shippingMethod = 'packeta',
  shippingCost = 0,
  packetaPointId = '',
  packetaPointName = '',
  className = '',
  children
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Validácia
      if (!items || items.length === 0) {
        setError('Košík je prázdny');
        setLoading(false);
        return;
      }

      if (!customerEmail) {
        setError('Email je povinný');
        setLoading(false);
        return;
      }

      // Vytvorenie checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items, 
          customerEmail, 
          customerName,
          shippingMethod,
          shippingCost,
          packetaPointId,
          packetaPointName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Platba zlyhala');
      }

      // Presmerovanie na Stripe checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Checkout URL nebola vrátená');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Nastala chyba pri vytváraní platby');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={className || "w-full bg-[#0087E3] text-white py-3 px-6 rounded-md hover:bg-[#006BB3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"}
      >
        {loading ? 'Načítavam...' : children || 'Prejsť na platbu'}
      </button>
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
