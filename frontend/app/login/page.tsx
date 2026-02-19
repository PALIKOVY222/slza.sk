'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: 'Prihlásenie zlyhalo.' }));
        throw new Error(payload.error || 'Prihlásenie zlyhalo.');
      }

      const data = (await res.json()) as {
        token: string;
        user: { id: string; email: string; firstName?: string; lastName?: string; phone?: string; street?: string; city?: string; postalCode?: string; country?: string; companyId?: string | null; company?: { name: string; vatId: string; taxId: string; registration: string; email: string; phone: string } | null };
      };

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      router.push('/kosik');
    } catch (err) {
      setError((err as Error).message || 'Prihlásenie zlyhalo.');
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
          <h1 className="text-3xl font-bold text-[#111518] mb-2">Prihlásenie</h1>
          <p className="text-[#4d5d6d]">Prihláste sa do svojho účtu</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#111518] mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3] transition-colors"
              placeholder="email@firma.sk"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111518] mb-2">Heslo</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0087E3] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#006bb3] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {loading ? 'Prihlasujem…' : 'Prihlásiť sa'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#4d5d6d]">
          Nemáte účet?{' '}
          <a href="/register" className="text-[#0087E3] hover:underline">Registrovať sa</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
