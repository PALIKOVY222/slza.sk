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
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Admin login - if input is "admin" (not an email)
      if (formData.email.trim().toLowerCase() === 'admin') {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: formData.password }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({ error: 'Nesprávne prihlasovacie údaje.' }));
          throw new Error(payload.error || 'Nesprávne prihlasovacie údaje.');
        }
        const data = await res.json();
        localStorage.setItem('adminToken', data.token);
        router.push('/admin');
        return;
      }

      // Normal customer login
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
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3] transition-colors"
              placeholder="email@firma.sk"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111518] mb-2">Heslo</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3] transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
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
