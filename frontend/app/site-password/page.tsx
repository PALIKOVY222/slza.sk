'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SitePasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/site-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Password correct, redirect
        window.location.href = redirect;
      } else {
        setError('Nesprávne heslo');
        setLoading(false);
      }
    } catch (err) {
      setError('Chyba pripojenia');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0087E3] to-[#006bb3] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/images/slza_logo.svg" 
            alt="SLZA Print" 
            className="h-16 mx-auto mb-6 filter brightness-0"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Stránka je chránená
          </h1>
          <p className="text-gray-600 text-sm">
            Zadajte heslo pre prístup k stránke
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Heslo
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Zadajte heslo"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0087E3] focus:border-transparent outline-none transition"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#0087E3] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#006bb3] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Overovanie...' : 'Vstúpiť'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Stránka je v testovacej fáze
          </p>
        </div>
      </div>
    </div>
  );
}
