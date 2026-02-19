'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminLogin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Nesprávne prihlasovacie údaje');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      router.push('/admin');
    } catch {
      setError('Chyba pri prihlasovaní. Skúste znova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0087E3] to-[#006bb3] flex items-center justify-center px-5">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" aria-label="Domov" className="inline-flex items-center">
            <img src="/images/slza_logo.svg" alt="SLZA" className="h-16 mx-auto mb-4" />
          </a>
          <h1 className="text-3xl font-bold text-[#111518] mb-2">Admin prihlásenie</h1>
          <p className="text-[#4d5d6d]">Prihláste sa do administrácie</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#111518] mb-2">
              Meno
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3] transition-colors"
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111518] mb-2">
              Heslo
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3] transition-colors"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0087E3] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#006bb3] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60"
          >
            {loading ? 'Prihlasujem...' : 'Prihlásiť sa'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-[#0087E3] hover:underline">
            ← Späť na hlavnú stránku
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
