'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminLogin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Jednoduché prihlásenie (v produkcii by to bolo cez API)
    if (formData.email === 'admin@slza.sk' && formData.password === 'admin123') {
      localStorage.setItem('adminToken', 'logged-in');
      router.push('/admin/dashboard');
    } else {
      setError('Nesprávne prihlasovacie údaje');
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
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3] transition-colors"
              placeholder="admin@slza.sk"
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
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0087E3] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#006bb3] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Prihlásiť sa
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-[#0087E3] hover:underline">
            ← Späť na hlavnú stránku
          </a>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-[#4d5d6d] text-center">
            <strong>Demo prístupy:</strong><br/>
            Email: admin@slza.sk<br/>
            Heslo: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
