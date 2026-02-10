'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

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
      // Check if Stripe is configured
      if (!stripePromise) {
        throw new Error('Stripe nie je nakonfigurovaný. Kontaktujte administrátora.');
      }

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

      console.log('Creating checkout session...', { 
        items, 
        customerEmail, 
        customerName,
        shippingMethod,
        shippingCost,
        packetaPointId,
        packetaPointName
      });

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

      console.log('Checkout response:', { ok: response.ok, status: response.status, data });

      if (!response.ok) {
        console.error('Checkout error:', data);
        throw new Error(data.details || data.error || 'Platba zlyhala');
      }

      // Presmerovanie na Stripe checkout URL
      if (data.url) {
        console.log('Redirecting to:', data.url);
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned:', data);
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
      
      {/* Platobné metódy */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center mb-3">Podporované platobné metódy:</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Visa */}
          <div className="w-10 h-7 bg-white rounded border border-gray-200 flex items-center justify-center p-1">
            <svg className="w-full h-full" viewBox="0 0 48 32" fill="none">
              <rect width="48" height="32" rx="4" fill="white"/>
              <path d="M20.5 11.5h-3.2l-2 12h3.2l2-12zM31.8 17.3c0-1.6-2-1.7-2-2.4 0-.2.2-.5.7-.5.6-.1 1.1 0 1.6.3l.3-1.8c-.4-.1-1-.3-1.7-.3-1.8 0-3.1 1-3.1 2.3 0 1 .9 1.6 1.6 1.9.7.3 1 .6 1 .9 0 .4-.5.6-.9.6-.8 0-1.2-.1-1.8-.4l-.3 1.9c.4.2 1.2.3 2 .3 1.9.1 3.1-.9 3.1-2.3zm4.9 6.1h2.8l-2.4-12h-2.6c-.6 0-1.1.3-1.3.9l-4.6 11.1h3.2l.6-1.7h3.9l.4 1.7zm-3.4-4c.3-.7 1.3-3.6 1.3-3.6l.8 3.6h-2.1zM18.2 11.5l-3.1 8.2-.3-1.7c-.6-1.9-2.3-4-4.3-5l2.8 10.4h3.2l4.8-11.9h-3.1z" fill="#1434CB"/>
            </svg>
          </div>
          
          {/* Mastercard */}
          <div className="w-10 h-7 bg-white rounded border border-gray-200 flex items-center justify-center p-1">
            <svg className="w-full h-full" viewBox="0 0 48 32">
              <rect width="48" height="32" rx="4" fill="white"/>
              <circle cx="19" cy="16" r="7" fill="#EB001B"/>
              <circle cx="29" cy="16" r="7" fill="#F79E1B"/>
              <path d="M24 11.5c-1.5 1.3-2.5 3.2-2.5 5.5s1 4.2 2.5 5.5c1.5-1.3 2.5-3.2 2.5-5.5s-1-4.2-2.5-5.5z" fill="#FF5F00"/>
            </svg>
          </div>
          
        </div>
      </div>
    </div>
  );
}
