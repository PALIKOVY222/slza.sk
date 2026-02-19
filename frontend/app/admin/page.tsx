'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  shippingMethod: string | null;
  shippingCost: number | null;
  packetaPointId: string | null;
  packetaPointName: string | null;
  trackingNumber: string | null;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  company?: {
    name: string;
    vatId?: string;
    taxId?: string;
  };
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    options?: Record<string, unknown>;
  }>;
  uploads: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
  }>;
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
  company?: {
    name?: string | null;
    vatId?: string | null;
    taxId?: string | null;
  } | null;
}

const AdminPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [trackingInput, setTrackingInput] = useState<{[key: number]: string}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    // Check authentication - admin only
    const authUser = localStorage.getItem('authUser');
    const authToken = localStorage.getItem('authToken');
    if (!authToken || !authUser) {
      router.push('/login');
      return;
    }
    try {
      const user = JSON.parse(authUser);
      if (user.email !== 'kovac.jr@slza.sk') {
        router.push('/');
        return;
      }
    } catch {
      router.push('/login');
      return;
    }

    fetchOrders();
    fetchCustomers();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'IN_PRODUCTION':
        return 'bg-yellow-100 text-yellow-800';
      case 'READY':
        return 'bg-purple-100 text-purple-800';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'Nová';
      case 'PAID':
        return 'Zaplatená';
      case 'IN_PRODUCTION':
        return 'Vo výrobe';
      case 'READY':
        return 'Pripravená';
      case 'SHIPPED':
        return 'Odoslaná';
      case 'COMPLETED':
        return 'Dokončená';
      case 'CANCELLED':
        return 'Zrušená';
      case 'PENDING':
        return 'Čaká';
      case 'PROCESSING':
        return 'Spracováva sa';
      default:
        return status;
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      alert('Chyba pri aktualizácii stavu: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateTrackingNumber = async (orderId: number) => {
    const trackingNumber = trackingInput[orderId];
    if (!trackingNumber) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tracking number');
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, trackingNumber } : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, trackingNumber });
      }

      setTrackingInput({ ...trackingInput, [orderId]: '' });
      alert('Tracking číslo bolo uložené');
    } catch (err: any) {
      alert('Chyba pri aktualizácii tracking čísla: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getPaymentStatusText = (status: string | null) => {
    if (!status) return '-';
    const statuses: Record<string, string> = {
      PENDING: 'Čakajúca',
      PAID: 'Zaplatená',
      FAILED: 'Neúspešná',
      REFUNDED: 'Vrátená'
    };
    return statuses[status] || status;
  };

  const getShippingMethodText = (method: string | null) => {
    if (!method) return '-';
    const methods: Record<string, string> = {
      packeta: 'Packeta',
      courier: 'Kuriér',
      personal_pickup: 'Osobný odber'
    };
    return methods[method] || method;
  };

  const getPaymentMethodText = (method: string | null) => {
    if (!method) return '-';
    const methods: Record<string, string> = {
      card: 'Karta online',
      bank_transfer: 'Bankový prevod',
      cash_on_delivery: 'Dobierka'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Načítavam objednávky...</div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const nameMatch = order.user ? `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(q) : false;
      const emailMatch = order.user?.email?.toLowerCase().includes(q) ?? false;
      const orderNumMatch = order.orderNumber.toLowerCase().includes(q);
      const companyMatch = order.company?.name?.toLowerCase().includes(q) ?? false;
      if (!nameMatch && !emailMatch && !orderNumMatch && !companyMatch) return false;
    }
    if (statusFilter && order.status !== statusFilter) return false;
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (new Date(order.createdAt) < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(order.createdAt) > to) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin – Objednávky</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <a
              href="/"
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              ← Stránka
            </a>
            <a
              href="/admin/dashboard"
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Produkty
            </a>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Odhlásiť
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <input
                type="text"
                placeholder="Hľadať meno, email, číslo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Všetky stavy</option>
                <option value="NEW">Nová</option>
                <option value="PAID">Zaplatená</option>
                <option value="IN_PRODUCTION">Vo výrobe</option>
                <option value="READY">Pripravená</option>
                <option value="SHIPPED">Odoslaná</option>
                <option value="COMPLETED">Dokončená</option>
                <option value="CANCELLED">Zrušená</option>
              </select>
            </div>
            <div>
              <input
                type="date"
                placeholder="Od dátumu"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="date"
                placeholder="Do dátumu"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {(searchQuery || statusFilter || dateFrom || dateTo) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Nájdené: <strong>{filteredOrders.length}</strong> z {orders.length} objednávok
              </span>
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Zrušiť filtre
              </button>
            </div>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Zatiaľ žiadne objednávky</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('sk-SK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-xl font-bold text-gray-900 mt-2">
                        {(order.totalAmount || order.items.reduce((sum, item) => sum + item.totalPrice, 0)).toFixed(2)} €
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-600 font-medium">Zákazník:</p>
                        <p className="text-gray-900">
                          {order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : 'N/A'}
                        </p>
                        {order.user?.email && (
                          <p className="text-gray-600">{order.user.email}</p>
                        )}
                        {order.user?.phone && (
                          <p className="text-gray-600">{order.user.phone}</p>
                        )}
                      </div>
                      {order.company && (
                        <div>
                          <p className="text-gray-600 font-medium">Firma:</p>
                          <p className="text-gray-900">{order.company.name}</p>
                          {order.company.vatId && (
                            <p className="text-gray-600">IČ DPH: {order.company.vatId}</p>
                          )}
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600 font-medium">Doprava:</p>
                        <p className="text-gray-900">{getShippingMethodText(order.shippingMethod)}</p>
                        {order.shippingCost && (
                          <p className="text-gray-600">{order.shippingCost.toFixed(2)} € s DPH</p>
                        )}
                        {order.packetaPointName && (
                          <p className="text-gray-600 text-xs">{order.packetaPointName}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Platba:</p>
                        <p className="text-gray-900">{getPaymentMethodText(order.paymentMethod)}</p>
                        <p className="text-gray-600">{getPaymentStatusText(order.paymentStatus)}</p>
                      </div>
                    </div>
                  </div>

                  {selectedOrder?.id === order.id && (
                    <div className="border-t mt-4 pt-4 space-y-4">
                      {/* Status Management */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Zmena stavu:</h4>
                        <div className="flex flex-wrap gap-2">
                          {['NEW', 'PAID', 'IN_PRODUCTION', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, status);
                              }}
                              disabled={updatingStatus || order.status === status}
                              className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${
                                order.status === status
                                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                              }`}
                            >
                              {getStatusText(status)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tracking Number */}
                      {order.shippingMethod && order.shippingMethod !== 'personal_pickup' && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Tracking číslo:</h4>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={trackingInput[order.id] || order.trackingNumber || ''}
                              onChange={(e) => setTrackingInput({ ...trackingInput, [order.id]: e.target.value })}
                              placeholder="Zadajte tracking číslo"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTrackingNumber(order.id);
                              }}
                              disabled={updatingStatus || !trackingInput[order.id]}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              Uložiť
                            </button>
                          </div>
                          {order.trackingNumber && !trackingInput[order.id] && (
                            <p className="text-sm text-gray-600 mt-1">
                              Aktuálne: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      )}

                      <h4 className="font-semibold text-gray-900 mb-3">Položky objednávky:</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => {
                          const opts = (item.options || {}) as Record<string, unknown>;
                          const details: string[] = [];
                          if (opts.widthMm || opts.heightMm) details.push(`${opts.widthMm || '?'} × ${opts.heightMm || '?'} mm`);
                          if (opts.width && opts.height) details.push(`${opts.width} × ${opts.height}`);
                          if (opts.model) details.push(String(opts.model));
                          if (opts.variant) details.push(String(opts.variant));
                          if (opts.eyelet) details.push(String(opts.eyelet));
                          if (opts.format) details.push(typeof opts.format === 'object' && (opts.format as Record<string,unknown>).label ? String((opts.format as Record<string,unknown>).label) : String(opts.format));
                          if (opts.paper) details.push(typeof opts.paper === 'object' && (opts.paper as Record<string,unknown>).label ? String((opts.paper as Record<string,unknown>).label) : String(opts.paper));
                          if (opts.material) details.push(String(opts.material));
                          if (opts.quantity) details.push(`${opts.quantity} ks`);
                          const artworkObj = opts.artwork as Record<string,unknown> | undefined;
                          return (
                          <div
                            key={item.id}
                            className="bg-gray-50 p-3 rounded"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{item.productName}</p>
                                {details.length > 0 && (
                                  <p className="text-sm text-gray-600 mt-0.5">{details.join(' · ')}</p>
                                )}
                                {artworkObj?.name ? (
                                  <p className="text-sm text-blue-600 mt-0.5">📎 {String(artworkObj.name)}</p>
                                ) : null}
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {item.quantity}× {item.unitPrice.toFixed(2)} €
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                {item.totalPrice.toFixed(2)} €
                              </p>
                            </div>
                          </div>
                          );
                        })}
                      </div>

                      {order.uploads.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Nahrané súbory:</h4>
                          <div className="space-y-1">
                            {order.uploads.map((upload) => (
                              <a
                                key={upload.id}
                                href={upload.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-600 hover:text-blue-800"
                                onClick={(e) => e.stopPropagation()}
                              >
                                📎 {upload.fileName}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Zákazníci</h2>

          {customersLoading ? (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">Načítavam zákazníkov...</div>
          ) : customers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">Zatiaľ žiadni zákazníci</div>
          ) : (() => {
            const now = new Date();
            const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const newCustomers = customers.filter(c => new Date(c.createdAt) >= last7days);
            return (
            <>
              {newCustomers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-bold text-blue-800 mb-2">🆕 Noví používatelia (posledných 7 dní)</h3>
                  <div className="space-y-2">
                    {newCustomers.map(c => (
                      <div key={c.id} className="flex items-center gap-3 text-sm text-blue-700">
                        <span className="font-semibold">{`${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'}</span>
                        <span>{c.email}</span>
                        {c.phone && <span>{c.phone}</span>}
                        {c.company?.name && <span className="text-blue-500">({c.company.name})</span>}
                        <span className="text-blue-400 ml-auto">{new Date(c.createdAt).toLocaleDateString('sk-SK')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3">Meno</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Telefón</th>
                      <th className="text-left px-4 py-3">Firma</th>
                      <th className="text-right px-4 py-3">Objednávky</th>
                      <th className="text-right px-4 py-3">Suma</th>
                      <th className="text-left px-4 py-3">Registrácia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => {
                      const isNew = new Date(customer.createdAt) >= last7days;
                      return (
                        <tr key={customer.id} className={`border-t ${isNew ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-4 py-3 text-gray-900">
                            {isNew && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2" title="Nový" />}
                            {`${customer.firstName || ''} ${customer.lastName || ''}`.trim() || '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{customer.email}</td>
                          <td className="px-4 py-3 text-gray-700">{customer.phone || '—'}</td>
                          <td className="px-4 py-3 text-gray-700">
                            {customer.company?.name || '—'}
                            {customer.company?.vatId ? (
                              <div className="text-xs text-gray-500">IČO: {customer.company.vatId}</div>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {customer.ordersCount}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {customer.ordersTotal.toFixed(2)} €
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {new Date(customer.createdAt).toLocaleDateString('sk-SK')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
