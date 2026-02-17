'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: number;
  productSlug: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: any;
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

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders');
      
      if (response.status === 401) {
        router.push('/login?redirect=/ucet');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Nepodarilo sa načítať objednávky');
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo k chybe');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      NEW: 'Nová',
      PAID: 'Zaplatená',
      IN_PRODUCTION: 'Vo výrobe',
      READY: 'Pripravená',
      SHIPPED: 'Odoslaná',
      COMPLETED: 'Dokončená',
      CANCELLED: 'Zrušená'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      IN_PRODUCTION: 'bg-yellow-100 text-yellow-800',
      READY: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">Načítavam...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Môj účet</h1>
          <p className="text-gray-600 mt-2">Prehľad vašich objednávok</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Zatiaľ nemáte žiadne objednávky</p>
            <Link
              href="/produkty"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Prejsť na produkty
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Objednávka #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleString('sk-SK')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Doprava</h4>
                      <p className="text-gray-900">{getShippingMethodText(order.shippingMethod)}</p>
                      {order.shippingCost && (
                        <p className="text-sm text-gray-600">
                          {order.shippingCost.toFixed(2)} € s DPH
                        </p>
                      )}
                      {order.trackingNumber && (
                        <p className="text-sm text-gray-600 mt-1">
                          Tracking: <span className="font-mono">{order.trackingNumber}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Platba</h4>
                      <p className="text-gray-900">{getPaymentMethodText(order.paymentMethod)}</p>
                      <p className="text-sm text-gray-600">
                        {getPaymentStatusText(order.paymentStatus)}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Celková suma</h4>
                      <p className="text-2xl font-bold text-gray-900">
                        {order.total.toFixed(2)} €
                      </p>
                      <p className="text-sm text-gray-600">s DPH</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Položky objednávky</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => {
                        const opts = (item.options || {}) as Record<string, unknown>;
                        const details: string[] = [];
                        if (opts.widthMm || opts.heightMm) details.push(`Rozmer: ${opts.widthMm || '?'} × ${opts.heightMm || '?'} mm`);
                        if (opts.width && opts.height) details.push(`Rozmer: ${opts.width} × ${opts.height}`);
                        if (opts.model) details.push(`Model: ${String(opts.model)}`);
                        if (opts.variant) details.push(`Variant: ${String(opts.variant)}`);
                        if (opts.eyelet) details.push(`Očkovanie: ${String(opts.eyelet)}`);
                        if (opts.format) details.push(`Formát: ${typeof opts.format === 'object' && (opts.format as Record<string,unknown>).label ? String((opts.format as Record<string,unknown>).label) : String(opts.format)}`);
                        if (opts.paper) details.push(`Papier: ${typeof opts.paper === 'object' && (opts.paper as Record<string,unknown>).label ? String((opts.paper as Record<string,unknown>).label) : String(opts.paper)}`);
                        if (opts.material) details.push(`Materiál: ${String(opts.material)}`);
                        if (opts.lamination) details.push(`Laminácia: ${String(opts.lamination)}`);
                        if (opts.cutting) details.push(`Orez: ${String(opts.cutting)}`);
                        if (opts.sides) details.push(`Strany: ${String(opts.sides)}`);
                        if (opts.quantity) details.push(`Množstvo: ${opts.quantity} ks`);
                        const artworkObj = opts.artwork as Record<string,unknown> | undefined;
                        if (artworkObj?.name) details.push(`📎 ${String(artworkObj.name)}`);
                        return (
                        <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            {details.length > 0 && (
                              <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                                {details.map((d, i) => (
                                  <p key={i}>{d}</p>
                                ))}
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                              {item.quantity} ks × {item.unitPrice.toFixed(2)} €
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {item.totalPrice.toFixed(2)} €
                            </p>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
