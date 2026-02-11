'use client';

import React, { useState, useEffect } from 'react';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactFormModal = ({ isOpen, onClose }: ContactFormModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    website: '', // honeypot
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [token, setToken] = useState('');
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  type TurnstileWindow = Window & { turnstile?: any; onModalTurnstileSuccess?: (token: string) => void };

  useEffect(() => {
    if (!isOpen || !siteKey) return;
    const w = window as TurnstileWindow;
    w.onModalTurnstileSuccess = (t: string) => setToken(t);

    const render = () => {
      if (!w.turnstile) return;
      const container = document.getElementById('modal-turnstile-container');
      if (!container) return;
      if (container.childNodes.length === 0) {
        w.turnstile.render('#modal-turnstile-container', {
          sitekey: siteKey,
          callback: (t: string) => w.onModalTurnstileSuccess?.(t),
        });
      }
    };

    if (w.turnstile) {
      setTimeout(render, 100);
      return;
    }

    const scriptId = 'cf-turnstile-script';
    if (document.getElementById(scriptId)) {
      setTimeout(render, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => setTimeout(render, 100);
    document.body.appendChild(script);
  }, [isOpen, siteKey]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setStatusMessage('');
      setToken('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (siteKey && !token) {
      setStatus('error');
      setStatusMessage('Prosím potvrďte, že nie ste robot.');
      return;
    }

    setStatus('sending');
    setStatusMessage('Odosielam…');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Chyba pri odoslaní.');
      }

      setStatus('success');
      setStatusMessage('Správa bola odoslaná. Ďakujeme!');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '', website: '' });
      setToken('');
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err.message || 'Chyba pri odoslaní.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto animate-[modalIn_0.3s_ease-out]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-[#111518]">Kontaktný formulár</h2>
            <p className="text-sm text-[#4d5d6d]">Odpovieme vám do 24 hodín</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            aria-label="Zavrieť"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        {status === 'success' ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111518] mb-2">Správa odoslaná!</h3>
            <p className="text-[#4d5d6d] mb-6">Ďakujeme za vašu správu. Odpovieme vám čo najskôr.</p>
            <button
              onClick={onClose}
              className="bg-[#0087E3] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#006bb3] transition-colors"
            >
              Zavrieť
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Meno *"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm"
              />
              <input
                type="text"
                placeholder="Priezvisko *"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm"
              />
              <input
                type="tel"
                placeholder="Telefón"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm"
              />
            </div>

            <input
              type="text"
              placeholder="Predmet *"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm"
            />

            <textarea
              placeholder="Správa *"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm resize-none"
            />

            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {siteKey && (
              <div id="modal-turnstile-container" className="min-h-[70px]" />
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-[#0087E3] text-white py-3.5 rounded-xl font-semibold hover:bg-[#006bb3] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base"
            >
              {status === 'sending' ? 'Odosielam…' : 'Odoslať správu'}
            </button>

            {status === 'error' && (
              <div className="text-sm text-red-600 text-center">{statusMessage}</div>
            )}
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ContactFormModal;
