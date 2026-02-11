"use client";

import React, { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Header from "../components/Header";
import Footer from "../components/Footer";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CartItem {
  id: string;
  productName: string;
  productSlug?: string;
  options: Record<string, unknown>;
  quantity: number;
  price: number;
  image: string;
}

function StripePaymentForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || processing) return;
    setProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/kosik/success`,
      },
      redirect: "if_required",
    });
    if (error) {
      onError(error.message || "Platba zlyhala");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <PaymentElement
          options={{
            layout: "accordion",
            wallets: { applePay: "auto", googlePay: "auto" },
            paymentMethodOrder: ["apple_pay", "google_pay", "card", "bancontact", "ideal"],
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#0087E3] to-[#006bb3] text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
      >
        {processing ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Spracovávam platbu...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Zaplatiť
          </>
        )}
      </button>
    </form>
  );
}

const KosikPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const formatOptionValue = (value: unknown): string => {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number")
      return String(value);
    if (typeof value === "object") {
      const v = value as Record<string, unknown>;
      if (v.name) return String(v.name);
      if (v.label) return String(v.label);
      if (typeof v.amount !== "undefined") return `${v.amount} ks`;
      const parts: string[] = [];
      if (v.width && v.height) parts.push(`${v.width} x ${v.height}`);
      if (v.grammage) parts.push(`${v.grammage}g`);
      if (parts.length) return parts.join(", ");
    }
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  };

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    vatId: "",
    taxId: "",
    registration: "",
    email: "",
    phone: "",
  });
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingMethod, setShippingMethod] = useState("packeta");
  const [packetaPoint, setPacketaPoint] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [step, setStep] = useState(1);
  const shippingCosts: Record<string, number> = {
    packeta: 3.5,
    courier: 5.0,
    personal_pickup: 0,
  };

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCartItems(JSON.parse(savedCart));
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        if (user?.id) setAuthUserId(user.id);
        setCustomerInfo({
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.email || "",
          phone: user.phone || "",
          address: user.company?.address || user.address || "",
          note: "",
        });
        if (user.company)
          setCompanyInfo({
            name: user.company.name || "",
            vatId: user.company.vatId || "",
            taxId: user.company.taxId || "",
            registration: user.company.registration || "",
            email: user.company.email || "",
            phone: user.company.phone || "",
          });
      } catch {
        /* ignore */
      }
    }
  }, []);

  const updateCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
  };
  const removeItem = (id: string) =>
    updateCart(cartItems.filter((item) => item.id !== id));
  const updateQuantity = (id: string, q: number) => {
    if (q < 1) return;
    updateCart(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: q } : item
      )
    );
  };

  const itemsTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = shippingCosts[shippingMethod] ?? 0;
  const vatTotal = itemsTotal * 0.23;
  const total = itemsTotal + vatTotal + shippingCost;

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (shippingMethod === "packeta" && !packetaPoint)
        throw new Error("Vyberte výdajné miesto Packeta");
      if (!customerInfo.name || !customerInfo.email)
        throw new Error("Vyplňte meno a email");

      const orderNumRes = await fetch("/api/orders/generate-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!orderNumRes.ok)
        throw new Error("Nepodarilo sa vygenerovať číslo objednávky.");
      const { orderNumber: oNum } = await orderNumRes.json();
      setOrderNumber(oNum);

      const uploads: Array<{
        fileName: string;
        mimeType?: string;
        fileSize?: number;
        url: string;
      }> = [];
      const { getArtworkFile, removeArtworkFile } = await import(
        "../../lib/artwork-store"
      );
      for (const item of cartItems) {
        const artwork = (item.options as Record<string, unknown>)
          ?.artwork as Record<string, unknown> | undefined;
        if (artwork?.fileId && artwork?.name) {
          const storedFile = await getArtworkFile(artwork.fileId as string);
          if (!storedFile) throw new Error("Podklady sa nenašli.");
          const form = new FormData();
          form.append("file", storedFile);
          form.append("fileName", artwork.name as string);
          form.append(
            "productSlug",
            item.productSlug ||
              item.productName.toLowerCase().replace(/\s+/g, "-")
          );
          form.append("orderNumber", oNum);
          const res = await fetch("/api/uploads", {
            method: "POST",
            body: form,
          });
          if (!res.ok) throw new Error("Nepodarilo sa nahrať súbor do cloudu.");
          const data = await res.json();
          uploads.push({
            fileName: artwork.name as string,
            mimeType: artwork.type as string | undefined,
            fileSize: artwork.size as number | undefined,
            url: data.url,
          });
          await removeArtworkFile(artwork.fileId as string);
        }
      }

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: oNum,
          customer: {
            email: customerInfo.email,
            name: customerInfo.name,
            phone: customerInfo.phone,
            userId: authUserId || undefined,
          },
          company: companyInfo.name ? companyInfo : undefined,
          billingAddress: {
            name: customerInfo.name,
            street: customerInfo.address,
          },
          items: cartItems.map((item) => ({
            productSlug:
              item.productSlug ||
              item.productName.toLowerCase().replace(/\s+/g, "-"),
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            options: item.options,
          })),
          uploads,
          payment: { method: paymentMethod, status: "pending" },
          shipping: {
            method: shippingMethod,
            cost: shippingCost,
            packetaPointId: packetaPoint?.id,
            packetaPointName: packetaPoint?.name,
          },
          totals: {
            subtotal: itemsTotal,
            vatTotal,
            total,
            vatRate: 0.23,
            currency: "EUR",
          },
          note: customerInfo.note,
        }),
      });
      if (!orderRes.ok) throw new Error("Nepodarilo sa odoslať objednávku.");

      if (paymentMethod === "card") {
        const piRes = await fetch("/api/checkout/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            orderNumber: oNum,
          }),
        });
        const piData = await piRes.json();
        if (!piRes.ok)
          throw new Error(piData.error || "Nepodarilo sa vytvoriť platbu");
        setClientSecret(piData.clientSecret);
      } else {
        updateCart([]);
        window.location.href = "/kosik/success?method=" + paymentMethod;
      }
    } catch (err) {
      console.error(err);
      setSubmitError((err as Error).message || "Chyba.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = useCallback(() => {
    localStorage.setItem("cart", JSON.stringify([]));
    window.location.href = "/kosik/success?paid=true";
  }, []);

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      <Header />

      {/* Compact hero */}
      <section className="bg-[#0087E3] pt-44 sm:pt-48 lg:pt-52 pb-8 sm:pb-10 lg:pb-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-5 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Nákupný košík
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            Skontrolujte svoju objednávku a dokončite nákup
          </p>
        </div>
      </section>

      {/* Steps indicator */}
      {cartItems.length > 0 && !clientSecret && (
        <div className="bg-white border-b">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-5 py-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${step === 1 ? "text-[#0087E3]" : "text-gray-400"}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-[#0087E3] text-white" : "bg-gray-200 text-gray-500"}`}>1</span>
                Košík
              </button>
              <div className="w-12 h-[2px] bg-gray-200" />
              <button
                onClick={() => step >= 2 && setStep(2)}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${step === 2 ? "text-[#0087E3]" : "text-gray-400"}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-[#0087E3] text-white" : "bg-gray-200 text-gray-500"}`}>2</span>
                Objednávka
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <section className="py-6 sm:py-8 lg:py-10">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-5">
          {cartItems.length === 0 && !clientSecret ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#111518] mb-2">Váš košík je prázdny</h2>
              <p className="text-[#4d5d6d] mb-8">Pridajte produkty do košíka.</p>
              <a href="/produkty" className="inline-block bg-[#0087E3] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#006bb3] transition-colors">
                Prejsť na produkty
              </a>
            </div>
          ) : clientSecret ? (
            <div className="max-w-[520px] mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 text-green-600 bg-green-50 rounded-xl p-4 mb-6">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium">Objednávka #{orderNumber} vytvorená</span>
                </div>
                <h3 className="text-xl font-bold text-[#111518] mb-4">Vyberte spôsob platby</h3>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#0087E3",
                        borderRadius: "12px",
                        fontFamily: "inherit",
                      },
                      rules: {
                        ".Tab": { borderRadius: "12px" },
                        ".Input": { borderRadius: "10px" },
                      },
                    },
                    locale: "sk",
                  }}
                >
                  <StripePaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={(msg) => setSubmitError(msg)}
                  />
                </Elements>
                {submitError && (
                  <div className="text-sm text-red-600 mt-3">{submitError}</div>
                )}
              </div>
            </div>
          ) : step === 1 ? (
            <div>
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const artworkOpt = (item.options as Record<string, unknown>)?.artwork as Record<string, unknown> | undefined;
                  return (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                      <div className="flex gap-4">
                        <img src={item.image} alt={item.productName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-gray-50 rounded-xl flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-[#111518] truncate">{item.productName}</h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                              aria-label="Odstrániť"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1 mb-3">
                            {Object.entries(item.options).map(([key, value]) => {
                              if (key === "quantity" || key === "artwork") return null;
                              const formatted = formatOptionValue(value);
                              if (!formatted) return null;
                              return (
                                <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{formatted}</span>
                              );
                            })}
                            {artworkOpt?.name ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">📎 {String(artworkOpt.name)}</span>
                            ) : null}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                              >−</button>
                              <span className="font-semibold min-w-[36px] text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                              >+</button>
                            </div>
                            <p className="text-lg font-bold text-[#0087E3]">{(item.price * item.quantity).toFixed(2)} €</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Produkty</span>
                    <span>{itemsTotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>DPH (23%)</span>
                    <span>{vatTotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Doprava</span>
                    <span>{shippingCost.toFixed(2)} €</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#111518]">
                    <span>Celkom</span>
                    <span className="text-[#0087E3]">{total.toFixed(2)} €</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#0087E3] text-white py-4 rounded-xl font-bold text-base hover:bg-[#006bb3] transition-all"
                >
                  Pokračovať k objednávke
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <h3 className="text-lg font-bold text-[#111518] mb-4 flex items-center gap-2">
                      <span className="text-xl">🚚</span> Spôsob dopravy
                    </h3>
                    <div className="space-y-2">
                      {[
                        { value: "packeta", label: "Packeta", price: "3,50 €", icon: "📦" },
                        { value: "courier", label: "Kuriér", price: "5,00 €", icon: "🚛" },
                        { value: "personal_pickup", label: "Osobný odber", price: "Zadarmo", icon: "🏪" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${shippingMethod === opt.value ? "border-[#0087E3] bg-[#0087E3]/5" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <input type="radio" name="shipping" value={opt.value} checked={shippingMethod === opt.value} onChange={(e) => setShippingMethod(e.target.value)} className="sr-only" />
                          <span className="text-xl">{opt.icon}</span>
                          <span className="flex-1 font-medium text-sm">{opt.label}</span>
                          <span className={`text-sm font-semibold ${opt.value === "personal_pickup" ? "text-green-600" : "text-gray-600"}`}>{opt.price}</span>
                        </label>
                      ))}
                    </div>
                    {shippingMethod === "packeta" && (
                      <button
                        type="button"
                        onClick={() => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const w = window as unknown as Record<string, any>;
                          if (w.Packeta) {
                            w.Packeta.Widget.pick("65d49ba1845d78fb", (point: { id: string; name: string }) => {
                              if (point) setPacketaPoint({ id: point.id, name: point.name });
                            });
                          } else {
                            alert("Packeta widget nie je načítaný");
                          }
                        }}
                        className="mt-3 w-full px-3 py-3 border-2 border-dashed border-[#0087E3] text-[#0087E3] rounded-xl hover:bg-[#0087E3]/5 transition-colors text-sm font-medium"
                      >
                        {packetaPoint ? `✅ ${packetaPoint.name}` : "Vybrať výdajné miesto Packeta →"}
                      </button>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <h3 className="text-lg font-bold text-[#111518] mb-4 flex items-center gap-2">
                      <span className="text-xl">💳</span> Spôsob platby
                    </h3>
                    <div className="space-y-2">
                      {[
                        { value: "card", label: "Kartou / Apple Pay / Google Pay", icon: "💳" },
                        { value: "bank_transfer", label: "Bankový prevod", icon: "🏦" },
                        { value: "cash_on_delivery", label: "Dobierka", icon: "💵" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === opt.value ? "border-[#0087E3] bg-[#0087E3]/5" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                          <span className="text-xl">{opt.icon}</span>
                          <span className="flex-1 font-medium text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <h3 className="text-lg font-bold text-[#111518] mb-4 flex items-center gap-2">
                      <span className="text-xl">👤</span> Kontaktné údaje
                    </h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Meno a priezvisko *" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="email" placeholder="Email *" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm" />
                        <input type="tel" placeholder="Telefón *" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} required={!authUserId} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm" />
                      </div>
                      <textarea placeholder="Adresa doručenia *" value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} required={!authUserId} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button type="button" onClick={() => setShowCompanyInfo(!showCompanyInfo)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-sm">
                      <span className="font-semibold text-[#111518] flex items-center gap-2">
                        <span className="text-xl">🏢</span> Fakturačné údaje firmy
                      </span>
                      <svg className={`w-4 h-4 transition-transform text-gray-400 ${showCompanyInfo ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showCompanyInfo && (
                      <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
                        <input type="text" placeholder="Názov firmy" value={companyInfo.name} onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] text-sm" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="IČ DPH" value={companyInfo.vatId} onChange={(e) => setCompanyInfo({ ...companyInfo, vatId: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] text-sm" />
                          <input type="text" placeholder="DIČ" value={companyInfo.taxId} onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] text-sm" />
                        </div>
                        <input type="text" placeholder="IČO" value={companyInfo.registration} onChange={(e) => setCompanyInfo({ ...companyInfo, registration: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] text-sm" />
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <textarea placeholder="Poznámka k objednávke (voliteľné)" value={customerInfo.note} onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm" />
                  </div>

                  <div className="lg:hidden">
                    <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-3 bg-[#0087E3] text-white py-4 rounded-xl font-bold text-base hover:bg-[#006bb3] transition-all disabled:opacity-50">
                      {submitting ? "Odosielam..." : paymentMethod === "card" ? "Pokračovať k platbe" : "Dokončiť objednávku"}
                    </button>
                    {submitError && <div className="text-sm text-red-600 mt-3">{submitError}</div>}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 lg:sticky lg:top-4">
                  <h3 className="text-lg font-bold text-[#111518] mb-4">Súhrn objednávky</h3>
                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-lg object-contain bg-gray-50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111518] truncate">{item.productName}</p>
                          <p className="text-xs text-gray-400">{item.quantity}× {item.price.toFixed(2)} €</p>
                        </div>
                        <p className="text-sm font-semibold text-[#111518]">{(item.price * item.quantity).toFixed(2)} €</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-500"><span>Produkty</span><span>{itemsTotal.toFixed(2)} €</span></div>
                    <div className="flex justify-between text-sm text-gray-500"><span>DPH (23%)</span><span>{vatTotal.toFixed(2)} €</span></div>
                    <div className="flex justify-between text-sm text-gray-500"><span>Doprava</span><span>{shippingCost.toFixed(2)} €</span></div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#111518]">
                      <span>Celkom</span>
                      <span className="text-[#0087E3]">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <button type="submit" form="checkout-form" disabled={submitting} className="w-full flex items-center justify-center gap-3 bg-[#0087E3] text-white py-4 rounded-xl font-bold text-base hover:bg-[#006bb3] transition-all disabled:opacity-50">
                      {submitting ? "Odosielam..." : paymentMethod === "card" ? "Pokračovať k platbe" : "Dokončiť objednávku"}
                    </button>
                    {submitError && <div className="text-sm text-red-600 mt-3">{submitError}</div>}
                  </div>
                  <button onClick={() => setStep(1)} className="w-full mt-3 text-sm text-gray-400 hover:text-[#0087E3] transition-colors">
                    ← Späť do košíka
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KosikPage;
