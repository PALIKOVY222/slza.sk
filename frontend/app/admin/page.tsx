'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsData } from '../data/productsData';

/* ─── Types ─── */
interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  totalAmount?: number;
  subtotal?: number;
  vatTotal?: number;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  shippingMethod: string | null;
  shippingCost: number | null;
  packetaPointId: string | null;
  packetaPointName: string | null;
  trackingNumber: string | null;
  note: string | null;
  user?: { firstName: string; lastName: string; email: string; phone?: string };
  company?: { name: string; vatId?: string; taxId?: string };
  billingAddress?: { street?: string; city?: string; postalCode?: string; country?: string };
  items: Array<{ id: number; productName: string; quantity: number; unitPrice: number; totalPrice: number; options?: Record<string, unknown> }>;
  uploads: Array<{ id: number; fileName: string; fileUrl: string }>;
}

interface Customer {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: string;
  createdAt: string;
  ordersCount: number;
  ordersTotal: number;
  company?: { name?: string | null; vatId?: string | null; taxId?: string | null } | null;
}

type Tab = 'orders' | 'customers' | 'products';
type Product = { id: number; title: string; price: number; category: string; image: string; slug: string };

/* ─── Helpers ─── */
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nová', color: 'bg-blue-100 text-blue-800' },
  PAID: { label: 'Zaplatená', color: 'bg-green-100 text-green-800' },
  IN_PRODUCTION: { label: 'Vo výrobe', color: 'bg-yellow-100 text-yellow-800' },
  READY: { label: 'Pripravená', color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { label: 'Odoslaná', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Dokončená', color: 'bg-gray-200 text-gray-700' },
  CANCELLED: { label: 'Zrušená', color: 'bg-red-100 text-red-800' },
};

const SHIPPING: Record<string, string> = {
  packeta: 'Packeta', courier: 'Kuriér', personal_pickup: 'Osobný odber',
  reproservis: 'REPROservis LM', borova_sihot: 'Hotel Borová Sihoť',
};

const PAYMENT: Record<string, string> = {
  card: 'Karta', bank_transfer: 'Faktúra prevodom', cash_on_delivery: 'Dobierka', cash_on_pickup: 'Pri prevzatí',
};

const MONTHS_SK = ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December'];

const s = (v: string | null | undefined, map: Record<string, string>) => (v ? map[v] || v : '—');

/* ─── Component ─── */
const AdminPage = () => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Orders state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({});

  // Customer state
  const [customerSearch, setCustomerSearch] = useState('');
  const [deletingCustomer, setDeletingCustomer] = useState<string | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [customerEditForm, setCustomerEditForm] = useState<{
    firstName: string; lastName: string; email: string; phone: string;
    companyName: string; vatId: string; taxId: string;
  }>({ firstName: '', lastName: '', email: '', phone: '', companyName: '', vatId: '', taxId: '' });
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Product state
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) { router.push('/admin/login'); return; }
    loadAll();
  }, [router]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, customersRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/customers'),
      ]);
      if (ordersRes.ok) { const d = await ordersRes.json(); setOrders(d.orders || []); }
      if (customersRes.ok) { const d = await customersRes.json(); setCustomers(d.customers || []); }

      // Products from localStorage (same as old dashboard)
      const saved = localStorage.getItem('products');
      if (saved) {
        setProducts(JSON.parse(saved));
      } else {
        const initial: Product[] = [
          { id: 1, title: 'Baner', price: 40, category: 'VEĽKOFORMÁTOVÁ TLAČ', image: '/images/banner.svg', slug: 'baner' },
          { id: 2, title: 'Nálepky', price: 15, category: 'MALOFORMÁTOVÁ TLAČ', image: '/images/sticker.svg', slug: 'nalepky' },
          { id: 3, title: 'Pečiatky', price: 13, category: 'KANCELÁRSKE POTREBY', image: '/images/trodat_peciatka.svg', slug: 'peciatky' },
          { id: 4, title: 'Vizitky', price: 20, category: 'MÁLOFORMÁTOVÁ TLAČ', image: '/images/vizitky.svg', slug: 'vizitky' },
          { id: 5, title: 'Letáky', price: 12, category: 'MÁLOFORMÁTOVÁ TLAČ', image: '/images/letaky.svg', slug: 'letaky' },
          { id: 6, title: 'Plagáty', price: 25, category: 'VEĽKOFORMÁTOVÁ TLAČ', image: '/images/plagat.svg', slug: 'plagaty' },
        ];
        localStorage.setItem('products', JSON.stringify(initial));
        setProducts(initial);
      }
      const storedConfigs = localStorage.getItem('productConfigs');
      if (!storedConfigs) localStorage.setItem('productConfigs', JSON.stringify(productsData));

      // Auto-expand current year/month
      const now = new Date();
      setExpandedYear(now.getFullYear());
      setExpandedMonth(`${now.getFullYear()}-${now.getMonth()}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Chyba');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    router.push('/');
  };

  /* ─── Order helpers ─── */
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) throw new Error('Failed');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch { alert('Chyba pri aktualizácii stavu'); }
    finally { setUpdatingStatus(false); }
  };

  const updateTracking = async (orderId: string) => {
    const tn = trackingInput[orderId];
    if (!tn) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackingNumber: tn }) });
      if (!res.ok) throw new Error('Failed');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingNumber: tn } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, trackingNumber: tn });
      setTrackingInput(prev => ({ ...prev, [orderId]: '' }));
    } catch { alert('Chyba'); }
    finally { setUpdatingStatus(false); }
  };

  const getOrderTotal = (o: Order) => o.total || o.totalAmount || o.items.reduce((s, i) => s + i.totalPrice, 0);

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const hay = [o.orderNumber, o.user?.firstName, o.user?.lastName, o.user?.email, o.customerName, o.customerEmail, o.company?.name].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  });

  // Group orders: year → month → orders
  const ordersByYear: Record<number, Record<number, Order[]>> = {};
  for (const o of filteredOrders) {
    const d = new Date(o.createdAt);
    const y = d.getFullYear();
    const m = d.getMonth();
    if (!ordersByYear[y]) ordersByYear[y] = {};
    if (!ordersByYear[y][m]) ordersByYear[y][m] = [];
    ordersByYear[y][m].push(o);
  }
  const sortedYears = Object.keys(ordersByYear).map(Number).sort((a, b) => b - a);

  /* ─── Customer helpers ─── */
  const deleteCustomer = async (id: string) => {
    if (!confirm('Naozaj chcete odstrániť tohto používateľa? Jeho objednávky zostanú zachované.')) return;
    setDeletingCustomer(id);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Chyba'); }
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Chyba pri odstraňovaní');
    } finally {
      setDeletingCustomer(null);
    }
  };

  const startEditCustomer = (c: Customer) => {
    setEditingCustomer(c.id);
    setCustomerEditForm({
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      email: c.email,
      phone: c.phone || '',
      companyName: c.company?.name || '',
      vatId: c.company?.vatId || '',
      taxId: c.company?.taxId || '',
    });
  };

  const saveCustomer = async (id: string) => {
    setSavingCustomer(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: customerEditForm.firstName,
          lastName: customerEditForm.lastName,
          email: customerEditForm.email,
          phone: customerEditForm.phone,
          company: customerEditForm.companyName ? {
            name: customerEditForm.companyName,
            vatId: customerEditForm.vatId,
            taxId: customerEditForm.taxId,
          } : undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Chyba'); }
      const data = await res.json();
      setCustomers(prev => prev.map(c => c.id === id ? data.customer : c));
      setEditingCustomer(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Chyba pri ukladaní');
    } finally {
      setSavingCustomer(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return [c.firstName, c.lastName, c.email, c.phone, c.company?.name].filter(Boolean).join(' ').toLowerCase().includes(q);
  });

  /* ─── Product helpers ─── */
  const startEditProduct = (slug: string) => {
    const configs = JSON.parse(localStorage.getItem('productConfigs') || '{}');
    const config = configs[slug] || {};
    setEditingProduct(slug);
    setEditForm({
      title: config.title || '',
      category: config.category || '',
      description: config.description || '',
      basePrice: config.basePrice || config.basePricePerCm2 || 0,
    });
  };

  const saveProduct = (slug: string) => {
    const configs = JSON.parse(localStorage.getItem('productConfigs') || '{}');
    if (configs[slug]) {
      configs[slug] = { ...configs[slug], ...editForm };
      localStorage.setItem('productConfigs', JSON.stringify(configs));
      // Also update products list
      setProducts(prev => prev.map(p => p.slug === slug ? { ...p, title: String(editForm.title || p.title), price: Number(editForm.basePrice) || p.price, category: String(editForm.category || p.category) } : p));
      const updatedProducts = products.map(p => p.slug === slug ? { ...p, title: String(editForm.title || p.title), price: Number(editForm.basePrice) || p.price, category: String(editForm.category || p.category) } : p);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    }
    setEditingProduct(null);
  };

  const deleteProduct = (id: number) => {
    if (!confirm('Naozaj odstrániť tento produkt?')) return;
    const removed = products.find(p => p.id === id);
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
    if (removed?.slug) {
      const configs = JSON.parse(localStorage.getItem('productConfigs') || '{}');
      delete configs[removed.slug];
      localStorage.setItem('productConfigs', JSON.stringify(configs));
    }
  };

  /* ─── Render ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500"><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg> Načítavam...</div>
      </div>
    );
  }

  const now = new Date();
  const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newCustomers = customers.filter(c => new Date(c.createdAt) >= last7days);
  const newOrders = orders.filter(o => o.status === 'NEW');
  const monthlyRevenue = orders
    .filter(o => { const d = new Date(o.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((s, o) => s + getOrderTotal(o), 0);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex"><img src="/images/slza_logo.svg" alt="SLZA" className="h-9" /></a>
            <span className="text-lg font-bold text-gray-900">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">← Stránka</a>
            <button onClick={handleLogout} className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600">Odhlásiť</button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-[1400px] mx-auto px-4 pt-6 pb-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Nové objednávky</p>
            <p className="text-2xl font-bold text-blue-600">{newOrders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Celkom objednávok</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Tržby tento mesiac</p>
            <p className="text-2xl font-bold text-green-600">{monthlyRevenue.toFixed(2)} €</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Noví zákazníci (7d)</p>
            <p className="text-2xl font-bold text-purple-600">{newCustomers.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-[1400px] mx-auto px-4 pt-4">
        <div className="flex gap-1 border-b border-gray-200">
          {([['orders', '📦 Objednávky', orders.length], ['customers', '👥 Zákazníci', customers.length], ['products', '🏷️ Produkty', products.length]] as [Tab, string, number][]).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label} <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}

        {/* ═══════════════════════════════════════════ */}
        {/* TAB: OBJEDNÁVKY                             */}
        {/* ═══════════════════════════════════════════ */}
        {tab === 'orders' && (
          <div>
            {/* Filter bar */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Hľadať (číslo, meno, email...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-[200px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Všetky stavy</option>
                  {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                {(searchQuery || statusFilter) && (
                  <button onClick={() => { setSearchQuery(''); setStatusFilter(''); }} className="px-3 py-2 text-sm text-blue-600 hover:underline">Zrušiť filtre</button>
                )}
              </div>
              {(searchQuery || statusFilter) && (
                <p className="text-xs text-gray-400 mt-2">Nájdené: <strong>{filteredOrders.length}</strong> z {orders.length}</p>
              )}
            </div>

            {/* Year → Month → Orders tree */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">Žiadne objednávky</div>
            ) : (
              <div className="space-y-3">
                {sortedYears.map(year => {
                  const months = ordersByYear[year];
                  const sortedMonths = Object.keys(months).map(Number).sort((a, b) => b - a);
                  const yearOpen = expandedYear === year;
                  const yearTotal = Object.values(months).flat().reduce((s, o) => s + getOrderTotal(o), 0);
                  const yearCount = Object.values(months).flat().length;

                  return (
                    <div key={year} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      {/* Year header */}
                      <button
                        onClick={() => setExpandedYear(yearOpen ? null : year)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <svg className={`w-4 h-4 text-gray-400 transition-transform ${yearOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          <span className="text-lg font-bold text-gray-900">📁 {year}</span>
                          <span className="text-sm text-gray-400">{yearCount} objednávok</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{yearTotal.toFixed(2)} €</span>
                      </button>

                      {yearOpen && (
                        <div className="border-t border-gray-100">
                          {sortedMonths.map(month => {
                            const monthOrders = months[month].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                            const monthKey = `${year}-${month}`;
                            const monthOpen = expandedMonth === monthKey;
                            const monthTotal = monthOrders.reduce((s, o) => s + getOrderTotal(o), 0);

                            return (
                              <div key={month}>
                                {/* Month header */}
                                <button
                                  onClick={() => setExpandedMonth(monthOpen ? null : monthKey)}
                                  className="w-full flex items-center justify-between px-8 py-3 hover:bg-gray-50 transition-colors border-t border-gray-50"
                                >
                                  <div className="flex items-center gap-3">
                                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${monthOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    <span className="font-semibold text-gray-700">📂 {MONTHS_SK[month]}</span>
                                    <span className="text-xs text-gray-400">{monthOrders.length} obj.</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{monthTotal.toFixed(2)} €</span>
                                </button>

                                {/* Orders in month */}
                                {monthOpen && (
                                  <div className="bg-gray-50/50">
                                    {monthOrders.map(order => {
                                      const isSelected = selectedOrder?.id === order.id;
                                      const name = order.user ? `${order.user.firstName} ${order.user.lastName}` : order.customerName || '—';
                                      const email = order.user?.email || order.customerEmail || '';
                                      const total = getOrderTotal(order);
                                      const st = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };

                                      return (
                                        <div key={order.id} className="border-t border-gray-100">
                                          {/* Order row */}
                                          <button
                                            onClick={() => setSelectedOrder(isSelected ? null : order)}
                                            className="w-full text-left px-8 py-3 hover:bg-white transition-colors"
                                          >
                                            <div className="flex items-center gap-4">
                                              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-5 gap-1 sm:gap-4 items-center">
                                                <span className="font-semibold text-sm text-gray-900">#{order.orderNumber}</span>
                                                <span className="text-sm text-gray-600 truncate">{name}</span>
                                                <span className="text-xs text-gray-400">
                                                  {new Date(order.createdAt).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit ${st.color}`}>{st.label}</span>
                                                <span className="text-sm font-bold text-gray-900 text-right">{total.toFixed(2)} €</span>
                                              </div>
                                              <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isSelected ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                          </button>

                                          {/* Order detail */}
                                          {isSelected && (
                                            <div className="px-8 pb-5 bg-white border-t border-gray-100">
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                                                <div>
                                                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Zákazník</p>
                                                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                                                  {email && <p className="text-sm text-gray-500">{email}</p>}
                                                  {(order.user?.phone || order.customerPhone) && <p className="text-sm text-gray-500">{order.user?.phone || order.customerPhone}</p>}
                                                  {order.company && (
                                                    <div className="mt-1">
                                                      <p className="text-sm text-gray-600">{order.company.name}</p>
                                                      {order.company.vatId && <p className="text-xs text-gray-400">IČO: {order.company.vatId}</p>}
                                                      {order.company.taxId && <p className="text-xs text-gray-400">DIČ: {order.company.taxId}</p>}
                                                    </div>
                                                  )}
                                                  {order.billingAddress && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                      {[order.billingAddress.street, order.billingAddress.city, order.billingAddress.postalCode].filter(Boolean).join(', ')}
                                                    </p>
                                                  )}
                                                </div>
                                                <div>
                                                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Doprava & Platba</p>
                                                  <p className="text-sm text-gray-700">{s(order.shippingMethod, SHIPPING)}</p>
                                                  {order.shippingCost ? <p className="text-xs text-gray-400">{order.shippingCost.toFixed(2)} €</p> : null}
                                                  {order.packetaPointName && <p className="text-xs text-gray-400">{order.packetaPointName}</p>}
                                                  <p className="text-sm text-gray-700 mt-1">{s(order.paymentMethod, PAYMENT)}</p>
                                                  {order.trackingNumber && <p className="text-xs text-green-600 mt-1">Tracking: {order.trackingNumber}</p>}
                                                </div>
                                                <div>
                                                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Suma</p>
                                                  <p className="text-2xl font-bold text-blue-600">{total.toFixed(2)} €</p>
                                                  {order.note && <p className="text-xs text-gray-400 mt-2 italic">Poznámka: {order.note}</p>}
                                                </div>
                                              </div>

                                              {/* Status change */}
                                              <div className="py-3 border-t border-gray-100">
                                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Zmena stavu</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                  {Object.entries(STATUS_MAP).map(([k, v]) => (
                                                    <button
                                                      key={k}
                                                      onClick={() => updateOrderStatus(order.id, k)}
                                                      disabled={updatingStatus || order.status === k}
                                                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                                        order.status === k ? 'ring-2 ring-blue-400 ' + v.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40'
                                                      }`}
                                                    >
                                                      {v.label}
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>

                                              {/* Tracking */}
                                              {order.shippingMethod && order.shippingMethod !== 'personal_pickup' && order.shippingMethod !== 'reproservis' && order.shippingMethod !== 'borova_sihot' && (
                                                <div className="py-3 border-t border-gray-100">
                                                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tracking číslo</p>
                                                  <div className="flex gap-2 max-w-md">
                                                    <input
                                                      value={trackingInput[order.id] || order.trackingNumber || ''}
                                                      onChange={e => setTrackingInput(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                      placeholder="Zadajte tracking"
                                                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    />
                                                    <button
                                                      onClick={() => updateTracking(order.id)}
                                                      disabled={updatingStatus || !trackingInput[order.id]}
                                                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-40"
                                                    >
                                                      Uložiť
                                                    </button>
                                                  </div>
                                                </div>
                                              )}

                                              {/* Items */}
                                              <div className="py-3 border-t border-gray-100">
                                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Položky</p>
                                                <div className="space-y-2">
                                                  {order.items.map(item => {
                                                    const opts = (item.options || {}) as Record<string, unknown>;
                                                    const details: string[] = [];
                                                    if (opts.widthMm || opts.heightMm) details.push(`${opts.widthMm || '?'} × ${opts.heightMm || '?'} mm`);
                                                    if (opts.width && opts.height) details.push(`${opts.width} × ${opts.height}`);
                                                    if (opts.model) details.push(String(opts.model));
                                                    if (opts.variant) details.push(String(opts.variant));
                                                    if (opts.eyelet) details.push(String(opts.eyelet));
                                                    if (opts.format) details.push(typeof opts.format === 'object' && (opts.format as Record<string, unknown>).label ? String((opts.format as Record<string, unknown>).label) : String(opts.format));
                                                    if (opts.paper) details.push(typeof opts.paper === 'object' && (opts.paper as Record<string, unknown>).label ? String((opts.paper as Record<string, unknown>).label) : String(opts.paper));
                                                    if (opts.material) details.push(String(opts.material));
                                                    if (opts.lamination) details.push(String(opts.lamination));
                                                    if (opts.cutting) details.push(String(opts.cutting));
                                                    if (opts.quantity) details.push(`${opts.quantity} ks`);
                                                    const art = opts.artwork as Record<string, string> | undefined;
                                                    const artName = art?.name ? String(art.name) : null;
                                                    return (
                                                      <div key={item.id} className="flex justify-between items-start bg-gray-50 rounded-lg p-3">
                                                        <div className="min-w-0">
                                                          <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                                                          {details.length > 0 && <p className="text-xs text-gray-500 mt-0.5">{details.join(' · ')}</p>}
                                                          {artName && <p className="text-xs text-blue-600 mt-0.5">📎 {artName}</p>}
                                                          <p className="text-xs text-gray-400 mt-0.5">{item.quantity}× {item.unitPrice.toFixed(2)} €</p>
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 flex-shrink-0 ml-4">{item.totalPrice.toFixed(2)} €</p>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>

                                              {/* Uploads */}
                                              {order.uploads.length > 0 && (
                                                <div className="py-3 border-t border-gray-100">
                                                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Nahraté súbory</p>
                                                  {order.uploads.map(u => (
                                                    <a key={u.id} href={u.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block">📎 {u.fileName}</a>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* TAB: ZÁKAZNÍCI                              */}
        {/* ═══════════════════════════════════════════ */}
        {tab === 'customers' && (
          <div>
            {/* New users banner */}
            {newCustomers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-bold text-blue-800 mb-2">🆕 Noví používatelia (posledných 7 dní)</h3>
                <div className="space-y-1">
                  {newCustomers.map(c => (
                    <div key={c.id} className="flex items-center gap-3 text-sm text-blue-700">
                      <span className="font-semibold">{`${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'}</span>
                      <span className="text-blue-500">{c.email}</span>
                      {c.company?.name && <span className="text-blue-400">({c.company.name})</span>}
                      <span className="text-blue-300 ml-auto">{new Date(c.createdAt).toLocaleDateString('sk-SK')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
              <input
                type="text"
                placeholder="Hľadať zákazníka (meno, email, firma...)"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">Žiadni zákazníci</div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map(customer => {
                  const name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || '—';
                  const isNew = new Date(customer.createdAt) >= last7days;
                  const isExpanded = expandedCustomer === customer.id;
                  // Find customer orders
                  const customerOrders = orders.filter(o => o.user?.email === customer.email || o.customerEmail === customer.email);

                  return (
                    <div key={customer.id} className={`bg-white rounded-xl border overflow-hidden ${isNew ? 'border-blue-200' : 'border-gray-100'}`}>
                      {/* Customer row */}
                      <div className="flex items-center gap-3 px-5 py-4">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${isNew ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          {(customer.firstName?.[0] || customer.email[0]).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedCustomer(isExpanded ? null : customer.id)}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{name}</span>
                            {isNew && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">NOVÝ</span>}
                            {customer.role === 'ADMIN' && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">ADMIN</span>}
                          </div>
                          <p className="text-xs text-gray-500">{customer.email}{customer.phone ? ` · ${customer.phone}` : ''}</p>
                          {customer.company?.name && <p className="text-xs text-gray-400">{customer.company.name}{customer.company.vatId ? ` · IČO: ${customer.company.vatId}` : ''}</p>}
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{customer.ordersCount}</p>
                            <p className="text-[10px] text-gray-400">obj.</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{customer.ordersTotal.toFixed(2)} €</p>
                            <p className="text-[10px] text-gray-400">celkom</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">{new Date(customer.createdAt).toLocaleDateString('sk-SK')}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => startEditCustomer(customer)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            title="Upraviť"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => setExpandedCustomer(isExpanded ? null : customer.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            title="Detail"
                          >
                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {customer.role !== 'ADMIN' && (
                            <button
                              onClick={() => deleteCustomer(customer.id)}
                              disabled={deletingCustomer === customer.id}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-40"
                              title="Odstrániť"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Edit form */}
                      {editingCustomer === customer.id && (
                        <div className="border-t border-gray-100 px-5 py-4 bg-blue-50/50">
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Upraviť zákazníka</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Meno</label>
                              <input value={customerEditForm.firstName} onChange={e => setCustomerEditForm(f => ({ ...f, firstName: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Priezvisko</label>
                              <input value={customerEditForm.lastName} onChange={e => setCustomerEditForm(f => ({ ...f, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                              <input type="email" value={customerEditForm.email} onChange={e => setCustomerEditForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Telefón</label>
                              <input value={customerEditForm.phone} onChange={e => setCustomerEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div className="sm:col-span-2">
                              <hr className="my-2 border-gray-200" />
                              <p className="text-xs font-semibold text-gray-500 mb-2">Firma</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Názov firmy</label>
                              <input value={customerEditForm.companyName} onChange={e => setCustomerEditForm(f => ({ ...f, companyName: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">IČO</label>
                              <input value={customerEditForm.vatId} onChange={e => setCustomerEditForm(f => ({ ...f, vatId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">DIČ</label>
                              <input value={customerEditForm.taxId} onChange={e => setCustomerEditForm(f => ({ ...f, taxId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => saveCustomer(customer.id)}
                              disabled={savingCustomer}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                              {savingCustomer ? 'Ukladám...' : 'Uložiť'}
                            </button>
                            <button
                              onClick={() => setEditingCustomer(null)}
                              className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg"
                            >
                              Zrušiť
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Expanded: Customer orders */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                          <div className="sm:hidden mb-3 grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white rounded-lg p-2 border border-gray-100">
                              <p className="text-sm font-bold">{customer.ordersCount}</p><p className="text-[10px] text-gray-400">objednávky</p>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-100">
                              <p className="text-sm font-bold">{customer.ordersTotal.toFixed(2)} €</p><p className="text-[10px] text-gray-400">celkom</p>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-100">
                              <p className="text-sm font-bold">{new Date(customer.createdAt).toLocaleDateString('sk-SK')}</p><p className="text-[10px] text-gray-400">reg.</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Objednávky zákazníka</p>
                          {customerOrders.length === 0 ? (
                            <p className="text-sm text-gray-400">Žiadne objednávky</p>
                          ) : (
                            <div className="space-y-1.5">
                              {customerOrders.map(o => {
                                const st = STATUS_MAP[o.status] || { label: o.status, color: 'bg-gray-100 text-gray-700' };
                                return (
                                  <div key={o.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100 text-sm">
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-gray-900">#{o.orderNumber}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('sk-SK')}</span>
                                      <span className="font-bold text-gray-900">{getOrderTotal(o).toFixed(2)} €</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* TAB: PRODUKTY                               */}
        {/* ═══════════════════════════════════════════ */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Produkty ({products.length})</h2>
              <a href="/admin/products/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">+ Pridať produkt</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map(product => {
                const isEditing = editingProduct === product.slug;
                const configs = JSON.parse(localStorage.getItem('productConfigs') || '{}');
                const config = configs[product.slug];
                const optionKeys = config?.options ? Object.keys(config.options) : [];

                return (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {/* Product header */}
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <img src={product.image} alt={product.title} className="w-16 h-16 object-contain flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                value={String(editForm.title || '')}
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm font-semibold"
                                placeholder="Názov"
                              />
                              <input
                                value={String(editForm.category || '')}
                                onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                                placeholder="Kategória"
                              />
                              <input
                                value={String(editForm.description || '')}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                                placeholder="Popis"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Cena:</span>
                                <input
                                  type="number"
                                  value={String(editForm.basePrice || '')}
                                  onChange={e => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
                                  className="w-24 px-2 py-1 border border-gray-200 rounded text-sm"
                                />
                                <span className="text-xs text-gray-500">€</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-base font-bold text-gray-900">{product.title}</h3>
                              <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                              {config?.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{config.description}</p>}
                              <p className="text-lg font-bold text-blue-600 mt-2">{product.price} €</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Option summary */}
                      {!isEditing && optionKeys.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {optionKeys.map(key => {
                            const optArray = config.options[key];
                            const count = Array.isArray(optArray) ? optArray.length : 0;
                            return (
                              <span key={key} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                {key}: {count} možností
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Specs */}
                      {!isEditing && config?.specs && (
                        <div className="mt-2">
                          {(config.specs as string[]).map((spec: string, i: number) => (
                            <p key={i} className="text-[11px] text-gray-400">✓ {spec}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-100 px-5 py-3 flex justify-between items-center bg-gray-50/50">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button onClick={() => saveProduct(product.slug)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">Uložiť</button>
                          <button onClick={() => setEditingProduct(null)} className="px-3 py-1.5 text-gray-500 text-xs hover:text-gray-700">Zrušiť</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => startEditProduct(product.slug)} className="px-3 py-1.5 text-blue-600 text-xs font-semibold hover:bg-blue-50 rounded-lg">Upraviť</button>
                          <a href={`/admin/products/edit/${product.id}`} className="px-3 py-1.5 text-gray-500 text-xs hover:bg-gray-100 rounded-lg">Detailne →</a>
                        </div>
                      )}
                      <button onClick={() => deleteProduct(product.id)} className="px-3 py-1.5 text-red-500 text-xs hover:bg-red-50 rounded-lg">Odstrániť</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
