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
          
          {/* Apple Pay */}
          <div className="w-10 h-7 bg-black rounded flex items-center justify-center px-1">
            <svg className="w-full h-4" viewBox="0 0 50 21" fill="white">
              <path d="M9.5 3.5c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.7 1.3-.6.6-1.1 1.6-1 2.6 1.1.1 2.1-.5 2.8-1.2zm.9 1.4c-1.5-.1-2.8.9-3.5.9s-1.8-.8-3-.8C2.4 5 .7 6.3.1 8.2c-1.3 3.8.3 9.5 2.4 12.6.9 1.5 2.1 3.2 3.6 3.2 1.1 0 1.6-.8 3-.8 1.5 0 1.8.8 3 .8 1.5 0 2.5-1.5 3.5-3 1.1-1.7 1.6-3.4 1.6-3.5 0 0-3.2-1.2-3.2-4.9 0-3.1 2.5-4.6 2.6-4.7-1.4-2.1-3.6-2.3-4.4-2.4z"/>
              <path d="M24.5 3.5v16.8h2.5v-5.7h3.5c3.2 0 5.4-2.2 5.4-5.6 0-3.3-2.2-5.5-5.3-5.5h-6.1zm2.5 2.1h2.9c2.2 0 3.5 1.2 3.5 3.4s-1.3 3.4-3.5 3.4h-2.9V5.6z"/>
              <path d="M37.5 17c0 2.3 1.8 3.8 4.5 3.8 2.8 0 4.5-1.5 4.5-3.8V14h-2.4v3c0 1.2-.8 1.9-2.1 1.9-1.3 0-2.1-.7-2.1-1.9V14h-2.4v3z"/>
              <path d="M47.5 20.8c2.5 0 3.6-1.2 4.2-2.4h.1v2.1h2.3V9.8c0-2.3-1.8-3.8-4.6-3.8-2.6 0-4.5 1.5-4.6 3.6h2.3c.2-.9 1-1.5 2.2-1.5 1.4 0 2.2.7 2.2 1.9v.8l-2.9.2c-2.7.2-4.2 1.3-4.2 3.2 0 2 1.5 3.3 3.5 3.3zm.7-2c-1.1 0-1.8-.5-1.8-1.4 0-.8.7-1.3 2-1.4l2.3-.2v1c0 1.2-1 2-2.5 2z"/>
            </svg>
          </div>
          
          {/* Google Pay */}
          <div className="w-10 h-7 bg-white rounded border border-gray-200 flex items-center justify-center px-1">
            <svg className="w-full h-4" viewBox="0 0 50 20">
              <path d="M24.2 9.8v5.4h-1.7V4h4.5c1.1 0 2.1.4 2.8 1.1.7.7 1.1 1.7 1.1 2.7 0 1.1-.4 2-1.1 2.7-.7.7-1.7 1.1-2.8 1.1h-2.8zm0-4.2v2.7h2.9c.6 0 1.1-.2 1.5-.6.4-.4.6-.9.6-1.5s-.2-1.1-.6-1.5c-.4-.4-.9-.6-1.5-.6h-2.9zm10.5 3.7c-1 0-1.8.3-2.4.9-.6.6-.9 1.4-.9 2.5s.3 1.9.9 2.5c.6.6 1.4.9 2.4.9.7 0 1.3-.2 1.8-.5.5-.4.9-.9 1.1-1.5h-3.2v-1.5h5v1.5c0 1.3-.4 2.4-1.2 3.2-.8.8-1.9 1.2-3.2 1.2-1.4 0-2.6-.5-3.5-1.4-.9-.9-1.4-2.1-1.4-3.5s.5-2.6 1.4-3.5c.9-.9 2.1-1.4 3.5-1.4 1.5 0 2.7.5 3.5 1.6l-1.3.9c-.6-.7-1.4-1.1-2.5-1.1z" fill="#5F6368"/>
              <path d="M11.6 9.3c0-.4 0-.7-.1-1.1H6v2.1h3.2c-.1.7-.5 1.4-1.1 1.8v1.4h1.8c1-.9 1.6-2.3 1.6-4.2z" fill="#4285F4"/>
              <path d="M6 15.1c1.5 0 2.8-.5 3.7-1.4l-1.8-1.4c-.5.3-1.1.5-1.9.5-1.4 0-2.6-1-3-2.3H1.1v1.5C2 14 3.9 15.1 6 15.1z" fill="#34A853"/>
              <path d="M3 10.5c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5.6H1.1C.4 7 0 8.5 0 10.2s.4 3.2 1.1 4.6L3 13.3v-2.8z" fill="#FBBC05"/>
              <path d="M6 5.5c.8 0 1.6.3 2.2.9l1.6-1.6C8.8 3.9 7.5 3.3 6 3.3 3.9 3.3 2 4.4 1.1 6.1l1.9 1.5c.4-1.3 1.6-2.3 3-2.3z" fill="#EA4335"/>
            </svg>
          </div>
          
          {/* Link */}
          <div className="w-10 h-7 bg-white rounded border border-gray-200 flex items-center justify-center p-1">
            <svg className="w-full h-full" viewBox="0 0 48 32">
              <rect width="48" height="32" rx="4" fill="white"/>
              <path d="M15 12c-1.7 0-3 1.3-3 3s1.3 3 3 3h3v-2h-3c-.6 0-1-.4-1-1s.4-1 1-1h3v-2h-3zm13 0c1.7 0 3 1.3 3 3s-1.3 3-3 3h-3v-2h3c.6 0 1-.4 1-1s-.4-1-1-1h-3v-2h3zm-10 4v-2h8v2h-8z" fill="#00D924"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
