'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

interface OrderItem {
  id: number;
  productSlug: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: Record<string, unknown>;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  shippingMethod: string | null;
  shippingCost: number | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  trackingNumber: string | null;
  items: OrderItem[];
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  company: {
    id: string;
    name: string;
    vatId: string | null;
    taxId: string | null;
  } | null;
}

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const router = useRouter();

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    companyVatId: '',
    companyTaxId: '',
  });

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/orders'),
      ]);

      if (profileRes.status === 401 || ordersRes.status === 401) {
        router.push('/login?redirect=/ucet');
        return;
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setEditForm({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          companyName: profileData.company?.name || '',
          companyVatId: profileData.company?.vatId || '',
          companyTaxId: profileData.company?.taxId || '',
        });
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo k chybe');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          phone: editForm.phone,
          company: profile?.company
            ? {
                name: editForm.companyName,
                vatId: editForm.companyVatId,
                taxId: editForm.companyTaxId,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');

      setProfile(data.user);
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        const parsed = JSON.parse(authUser);
        parsed.firstName = data.user.firstName;
        parsed.lastName = data.user.lastName;
        parsed.phone = data.user.phone;
        if (data.user.company) parsed.company = data.user.company;
        localStorage.setItem('authUser', JSON.stringify(parsed));
      }

      setEditing(false);
      setSaveMsg({ type: 'success', text: 'Údaje boli úspešne uložené' });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg({ type: 'error', text: err instanceof Error ? err.message : 'Chyba pri ukladaní' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (passwordForm.newPw !== passwordForm.confirm) {
      setPasswordMsg({ type: 'error', text: 'Nové heslá sa nezhodujú' });
      return;
    }
    if (passwordForm.newPw.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Heslo musí mať minimálne 8 znakov' });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setPasswordMsg({ type: 'success', text: 'Heslo bolo úspešne zmenené' });
      setPasswordForm({ current: '', newPw: '', confirm: '' });
      setShowPasswordForm(false);
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err instanceof Error ? err.message : 'Chyba pri zmene hesla' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    router.push('/');
  };

  const getStatusText = (status: string) => {
    const s: Record<string, string> = {
      NEW: 'Nová', PAID: 'Zaplatená', IN_PRODUCTION: 'Vo výrobe',
      READY: 'Pripravená', SHIPPED: 'Odoslaná', COMPLETED: 'Dokončená', CANCELLED: 'Zrušená',
    };
    return s[status] || status;
  };

  const getStatusColor = (status: string) => {
    const c: Record<string, string> = {
      NEW: 'bg-blue-50 text-blue-700', PAID: 'bg-green-50 text-green-700',
      IN_PRODUCTION: 'bg-amber-50 text-amber-700', READY: 'bg-purple-50 text-purple-700',
      SHIPPED: 'bg-indigo-50 text-indigo-700', COMPLETED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-red-50 text-red-700',
    };
    return c[status] || 'bg-gray-100 text-gray-700';
  };

  const getShippingMethodText = (m: string | null) => {
    if (!m) return '-';
    const t: Record<string, string> = { packeta: 'Packeta', courier: 'Kuriér', personal_pickup: 'Osobný odber' };
    return t[m] || m;
  };

  const getPaymentMethodText = (m: string | null) => {
    if (!m) return '-';
    const t: Record<string, string> = { card: 'Karta', bank_transfer: 'Faktúra prevodom', cash_on_pickup: 'Pri prevzatí', cash_on_delivery: 'Dobierka' };
    return t[m] || m;
  };

  if (loading) {
    return (
      <div className="bg-[#f8f9fb] min-h-screen">
        <Header />
        <div className="pt-52 pb-20 text-center text-gray-500">Načítavam...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f8f9fb] min-h-screen">
        <Header />
        <div className="pt-52 pb-20 max-w-xl mx-auto px-4">
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      <Header />

      <section className="bg-[#0087E3] pt-44 sm:pt-48 lg:pt-52 pb-8 sm:pb-10 lg:pb-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-5 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Môj účet</h1>
          <p className="text-white/80 text-sm sm:text-base">
            {profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email : ''}
          </p>
        </div>
      </section>

      <div className="bg-white">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-5">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-[#0087E3] text-[#0087E3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Osobné údaje
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-[#0087E3] text-[#0087E3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Objednávky{orders.length > 0 && ` (${orders.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8">

        {activeTab === 'profile' && profile && (
          <div className="space-y-6">

            {saveMsg && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                saveMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {saveMsg.text}
              </div>
            )}
            {passwordMsg && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                passwordMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {passwordMsg.text}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#111518]">Osobné údaje</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-sm font-semibold text-[#0087E3] hover:underline"
                  >
                    Upraviť
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditForm({
                          firstName: profile.firstName || '',
                          lastName: profile.lastName || '',
                          phone: profile.phone || '',
                          companyName: profile.company?.name || '',
                          companyVatId: profile.company?.vatId || '',
                          companyTaxId: profile.company?.taxId || '',
                        });
                      }}
                      className="text-sm font-semibold text-gray-500 hover:underline"
                    >
                      Zrušiť
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-1.5 bg-[#0087E3] text-white text-sm font-semibold rounded-lg hover:bg-[#006BB3] disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Ukladám...' : 'Uložiť'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                    {profile.email}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Pre zmenu emailu nás kontaktujte</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Telefón</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+421 9xx xxx xxx"
                      className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-[#0087E3] focus:ring-1 focus:ring-[#0087E3] outline-none transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                      {profile.phone || <span className="text-gray-400">Nezadané</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Meno</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-[#0087E3] focus:ring-1 focus:ring-[#0087E3] outline-none transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                      {profile.firstName || <span className="text-gray-400">Nezadané</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Priezvisko</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-[#0087E3] focus:ring-1 focus:ring-[#0087E3] outline-none transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                      {profile.lastName || <span className="text-gray-400">Nezadané</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {profile.company && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-[#111518] mb-6">Firemné údaje</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Názov firmy</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.companyName}
                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-[#0087E3] focus:ring-1 focus:ring-[#0087E3] outline-none transition-colors"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                        {profile.company.name || <span className="text-gray-400">Nezadané</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">IČO</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.companyVatId}
                        onChange={(e) => setEditForm({ ...editForm, companyVatId: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-[#0087E3] focus:ring-1 focus:ring-[#0087E3] outline-none transition-colors"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                        {profile.company.vatId || <span className="text-gray-400">Nezadané</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">DIČ</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.companyTaxId}
                        onChange={(e) => setEditForm({ ...editForm, companyTaxId: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-[#0087E3] focus:ring-1 focus:ring-[#0087E3] outline-none transition-colors"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                        {profile.company.taxId || <span className="text-gray-400">Nezadané</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-[#111518]">Zmena hesla</h2>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="text-sm font-semibold text-[#0087E3] hover:underline"
                  >
                    Zmeniť heslo
                  </button>
                )}
              </div>

              {!showPasswordForm ? (
                <p className="text-sm text-gray-500">Pre zmenu hesla kliknite na tlačidlo vpravo</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Aktuálne heslo</label>
                    <input
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      className="w-full max-w-md px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-[#0087E3] focus:ring-1 focus:ring-[#0087E3] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Nové heslo</label>
                    <input
                      type="password"
                      value={passwordForm.newPw}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPw: e.target.value })}
                      className="w-full max-w-md px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-[#0087E3] focus:ring-1 focus:ring-[#0087E3] outline-none transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimálne 8 znakov</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Zopakujte nové heslo</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="w-full max-w-md px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-[#0087E3] focus:ring-1 focus:ring-[#0087E3] outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="px-5 py-2.5 bg-[#0087E3] text-white text-sm font-semibold rounded-xl hover:bg-[#006BB3] disabled:opacity-50 transition-colors"
                    >
                      {changingPassword ? 'Mením...' : 'Zmeniť heslo'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({ current: '', newPw: '', confirm: '' });
                        setPasswordMsg(null);
                      }}
                      className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Zrušiť
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
              >
                Odhlásiť sa
              </button>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">Zatiaľ nemáte žiadne objednávky</p>
                <Link
                  href="/produkty"
                  className="inline-block bg-[#0087E3] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#006BB3] transition-colors"
                >
                  Prejsť na produkty
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="hidden sm:flex w-10 h-10 bg-gray-100 rounded-xl items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gray-500">
                              {order.items.length}x
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[#111518] text-sm">#{order.orderNumber}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className="font-bold text-[#111518]">{order.total.toFixed(2)} €</span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-100 px-5 sm:px-6 py-5">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-500 mb-1">Doprava</p>
                              <p className="text-sm font-semibold text-[#111518]">{getShippingMethodText(order.shippingMethod)}</p>
                              {order.shippingCost ? (
                                <p className="text-xs text-gray-500">{order.shippingCost.toFixed(2)} €</p>
                              ) : null}
                              {order.trackingNumber && (
                                <p className="text-xs text-gray-500 mt-1 font-mono">{order.trackingNumber}</p>
                              )}
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-500 mb-1">Platba</p>
                              <p className="text-sm font-semibold text-[#111518]">{getPaymentMethodText(order.paymentMethod)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-500 mb-1">Celková suma</p>
                              <p className="text-lg font-bold text-[#0087E3]">{order.total.toFixed(2)} €</p>
                              <p className="text-xs text-gray-500">s DPH</p>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-[#111518] mb-3">Položky objednávky</h4>
                          <div className="space-y-3">
                            {order.items.map((item) => {
                              const opts = (item.options || {}) as Record<string, unknown>;
                              const details: string[] = [];
                              if (opts.widthMm || opts.heightMm) details.push(`Rozmer: ${opts.widthMm || '?'} × ${opts.heightMm || '?'} mm`);
                              if (opts.width && opts.height) details.push(`Rozmer: ${opts.width} × ${opts.height}`);
                              if (opts.model) details.push(`Model: ${String(opts.model)}`);
                              if (opts.variant) details.push(`Variant: ${String(opts.variant)}`);
                              if (opts.eyelet) details.push(`Očkovanie: ${String(opts.eyelet)}`);
                              if (opts.format) {
                                const f = opts.format as Record<string, unknown>;
                                details.push(`Formát: ${typeof opts.format === 'object' && f.label ? String(f.label) : String(opts.format)}`);
                              }
                              if (opts.paper) {
                                const p = opts.paper as Record<string, unknown>;
                                details.push(`Papier: ${typeof opts.paper === 'object' && p.label ? String(p.label) : String(opts.paper)}`);
                              }
                              if (opts.material) details.push(`Materiál: ${String(opts.material)}`);
                              if (opts.lamination) details.push(`Laminácia: ${String(opts.lamination)}`);
                              if (opts.cutting) details.push(`Orez: ${String(opts.cutting)}`);
                              if (opts.sides) details.push(`Strany: ${String(opts.sides)}`);
                              if (opts.quantity) details.push(`Množstvo: ${opts.quantity} ks`);
                              return (
                                <div key={item.id} className="flex justify-between items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-[#111518]">{item.productName}</p>
                                    {details.length > 0 && (
                                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                        {details.map((d, i) => <p key={i}>{d}</p>)}
                                      </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">{item.quantity} ks × {item.unitPrice.toFixed(2)} €</p>
                                  </div>
                                  <p className="font-bold text-sm text-[#111518] flex-shrink-0">{item.totalPrice.toFixed(2)} €</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
