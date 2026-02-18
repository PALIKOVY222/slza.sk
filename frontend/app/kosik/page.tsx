"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface CartItem {
  id: string;
  productName: string;
  productSlug?: string;
  options: Record<string, unknown>;
  quantity: number;
  price: number;
  image: string;
}

const PICKUP_POINTS = [
  {
    id: "packeta",
    name: "Packeta",
    address: "Výdajné miesto Packeta",
    price: 3.5,
  },
  {
    id: "courier",
    name: "Kuriér",
    address: "Doručenie na adresu",
    price: 5.0,
  },
  {
    id: "reproservis",
    name: "Osobný odber – REPROservis Liptovský Mikuláš",
    address: "M. M. Hodžu 1160, 031 01 Liptovský Mikuláš",
    price: 0,
  },
  {
    id: "borova_sihot",
    name: "Osobný odber – Hotel Borová Sihoť",
    address: "K sihoti 201/1, Podtureň 033 01",
    price: 0,
  },
];

const PAYMENT_METHODS = [
  {
    id: "cash_on_pickup",
    name: "Pri prevzatí",
    description: "",
    price: 0,
  },
  {
    id: "bank_transfer",
    name: "Faktúra prevodom",
    description: "Faktúra Ti bude zaslaná až po vyhotovení objednávky",
    price: 0,
  },
];

const KosikPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [step, setStep] = useState(1);

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
  const selectedPickupPoint = PICKUP_POINTS.find(p => p.id === shippingMethod);
  const shippingCost = selectedPickupPoint?.price || 0;
  const vatTotal = itemsTotal * 0.23;
  const total = itemsTotal + vatTotal + shippingCost;

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (!shippingMethod)
        throw new Error("Vyberte spôsob doručenia");
      if (!paymentMethod)
        throw new Error("Vyberte spôsob platby");
      if (!customerInfo.name || !customerInfo.email)
        throw new Error("Vyplňte meno a email");

      const orderNumRes = await fetch("/api/orders/generate-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!orderNumRes.ok)
        throw new Error("Nepodarilo sa vygenerovať číslo objednávky.");
      const { orderNumber: oNum } = await orderNumRes.json();

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

      const selectedPickup = PICKUP_POINTS.find(p => p.id === shippingMethod);

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
            method: "personal_pickup",
            cost: 0,
            pickupPointId: selectedPickup?.id,
            pickupPointName: selectedPickup?.name,
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

      updateCart([]);
      window.location.href = "/kosik/success?method=" + paymentMethod;
    } catch (err) {
      console.error(err);
      setSubmitError((err as Error).message || "Chyba.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      <Header />

      {/* Hero */}
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
      {cartItems.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-5 py-4">
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              {[
                { num: 1, label: "Košík" },
                { num: 2, label: "Doručenie a platba" },
                { num: 3, label: "Kontakt" },
                { num: 4, label: "Zhrnutie" },
              ].map((s, i) => (
                <React.Fragment key={s.num}>
                  {i > 0 && <div className="w-4 sm:w-8 h-[2px] bg-gray-200" />}
                  <button
                    onClick={() => { if (s.num <= step) setStep(s.num); }}
                    className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                      step === s.num ? "text-[#0087E3]" : step > s.num ? "text-[#0087E3]" : "text-gray-400"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s.num
                        ? "bg-[#0087E3] text-white"
                        : step > s.num
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {step > s.num ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        s.num
                      )}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <section className="py-6 sm:py-8 lg:py-10">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-5">
          {cartItems.length === 0 ? (
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

          ) : step === 1 ? (
            /* ─── STEP 1: Cart review ─── */
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
                            <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1" aria-label="Odstrániť">
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
                              return <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{formatted}</span>;
                            })}
                            {artworkOpt?.name ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Príloha: {String(artworkOpt.name)}</span>
                            ) : null}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold transition-colors">−</button>
                              <span className="font-semibold min-w-[36px] text-center text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold transition-colors">+</button>
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
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#111518]">
                    <span>Celkom</span>
                    <span className="text-[#0087E3]">{total.toFixed(2)} €</span>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="w-full bg-[#111518] text-white py-4 rounded-xl font-bold text-base hover:bg-[#333] transition-all">
                  POKRAČOVAŤ
                </button>
              </div>
            </div>

          ) : step === 2 ? (
            /* ─── STEP 2: Delivery & Payment ─── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Pickup points */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5">
                  <h3 className="text-lg font-bold text-[#111518] mb-4">Vyber spôsob doručenia</h3>
                  <div className="divide-y divide-gray-100">
                    {PICKUP_POINTS.map((point) => (
                      <label key={point.id} className="flex items-start gap-4 py-4 cursor-pointer">
                        <div className="pt-0.5">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            shippingMethod === point.id ? "border-green-500 bg-green-500" : "border-gray-300"
                          }`}>
                            {shippingMethod === point.id && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#111518] text-sm">{point.name}</div>
                          <div className="text-sm text-gray-500">{point.address}</div>
                        </div>
                        <div className="text-sm font-medium text-gray-600 pt-0.5">{point.price > 0 ? `${point.price.toFixed(2)} €` : "Zadarmo"}</div>
                        <input type="radio" name="shipping" value={point.id} checked={shippingMethod === point.id} onChange={(e) => setShippingMethod(e.target.value)} className="sr-only" />
                      </label>
                    ))}
                  </div>
                  {shippingMethod === "packeta" && (
                    <button
                      type="button"
                      onClick={() => {
                        const w = window as any;
                        if (w.Packeta) {
                          w.Packeta.Widget.pick("65d49ba1845d78fb", (point: { id: string; name: string }) => {
                            if (point) {
                              setCustomerInfo({ ...customerInfo, address: point.name });
                            }
                          });
                        } else {
                          alert("Packeta widget nie je načítaný");
                        }
                      }}
                      className="mt-3 w-full px-3 py-3 border-2 border-dashed border-[#0087E3] text-[#0087E3] rounded-xl hover:bg-[#0087E3]/5 transition-colors text-sm font-medium"
                    >
                      {customerInfo.address && shippingMethod === "packeta" ? `✓ ${customerInfo.address}` : "Vybrať výdajné miesto Packeta →"}
                    </button>
                  )}
                </div>

                {/* Payment methods */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5">
                  <h3 className="text-lg font-bold text-[#111518] mb-4">Vyber spôsob platby</h3>
                  <div className="divide-y divide-gray-100">
                    {PAYMENT_METHODS.map((method) => (
                      <label key={method.id} className="flex items-start gap-4 py-4 cursor-pointer">
                        <div className="pt-0.5">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            paymentMethod === method.id ? "border-green-500 bg-green-500" : "border-gray-300"
                          }`}>
                            {paymentMethod === method.id && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#111518] text-sm">{method.name}</div>
                          {method.description && <div className="text-sm text-gray-500">{method.description}</div>}
                        </div>
                        <div className="text-sm font-medium text-gray-600 pt-0.5">Zadarmo</div>
                        <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-[#111518] hover:bg-gray-50 transition-colors">
                    SPÄŤ
                  </button>
                  <button
                    onClick={() => {
                      if (!shippingMethod) { setSubmitError("Vyberte spôsob doručenia"); return; }
                      if (!paymentMethod) { setSubmitError("Vyberte spôsob platby"); return; }
                      setSubmitError(null);
                      setStep(3);
                    }}
                    className="px-8 py-3 bg-[#111518] text-white rounded-xl text-sm font-bold hover:bg-[#333] transition-colors"
                  >
                    POKRAČOVAŤ
                  </button>
                </div>
                {submitError && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mt-3">{submitError}</div>}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:sticky lg:top-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 mb-4">
                      <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-lg object-contain bg-gray-50 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#111518] truncate">{item.productName}</p>
                        <button className="text-xs text-gray-400 hover:text-[#0087E3]">Zobraziť detail</button>
                      </div>
                      <p className="text-sm font-bold text-[#111518]">{(item.price * item.quantity).toFixed(2)} €</p>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-4 mt-2 space-y-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Suma bez DPH:</span>
                      <span>{itemsTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>DPH 23 %:</span>
                      <span>{vatTotal.toFixed(2)} €</span>
                    </div>
                    <div className="border-t pt-3 mt-2 flex justify-between items-center">
                      <span className="text-base font-bold text-[#111518]">Spolu:</span>
                      <span className="text-xl font-bold text-[#0087E3]">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : step === 3 ? (
            /* ─── STEP 3: Contact info ─── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <form id="checkout-form" onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-5">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <h3 className="text-lg font-bold text-[#111518] mb-4">Kontaktné údaje</h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Meno a priezvisko *" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="email" placeholder="Email *" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm" />
                        <input type="tel" placeholder="Telefón *" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} required={!authUserId} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm" />
                      </div>
                      <textarea placeholder="Adresa (voliteľné)" value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0087E3] focus:ring-2 focus:ring-[#0087E3]/20 text-sm" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button type="button" onClick={() => setShowCompanyInfo(!showCompanyInfo)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-sm">
                      <span className="font-semibold text-[#111518]">Fakturačné údaje firmy</span>
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

                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setStep(2)} className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-[#111518] hover:bg-gray-50 transition-colors">
                      SPÄŤ
                    </button>
                    <button type="submit" className="px-8 py-3 bg-[#111518] text-white rounded-xl text-sm font-bold hover:bg-[#333] transition-colors">
                      POKRAČOVAŤ
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:sticky lg:top-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 mb-4">
                      <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-lg object-contain bg-gray-50 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#111518] truncate">{item.productName}</p>
                      </div>
                      <p className="text-sm font-bold text-[#111518]">{(item.price * item.quantity).toFixed(2)} €</p>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-4 mt-2 space-y-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Suma bez DPH:</span>
                      <span>{itemsTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>DPH 23 %:</span>
                      <span>{vatTotal.toFixed(2)} €</span>
                    </div>
                    <div className="border-t pt-3 mt-2 flex justify-between items-center">
                      <span className="text-base font-bold text-[#111518]">Spolu:</span>
                      <span className="text-xl font-bold text-[#0087E3]">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : step === 4 ? (
            /* ─── STEP 4: Summary ─── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-[#111518] mb-4">Zhrnutie objednávky</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-lg object-contain bg-gray-50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#111518] truncate">{item.productName}</p>
                          <p className="text-xs text-gray-400">{item.quantity}× {item.price.toFixed(2)} €</p>
                        </div>
                        <p className="text-sm font-bold text-[#111518]">{(item.price * item.quantity).toFixed(2)} €</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Doručenie</h4>
                      <p className="text-sm font-semibold text-[#111518]">{PICKUP_POINTS.find(p => p.id === shippingMethod)?.name}</p>
                      <p className="text-sm text-gray-500">{PICKUP_POINTS.find(p => p.id === shippingMethod)?.address}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Platba</h4>
                      <p className="text-sm font-semibold text-[#111518]">{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.name}</p>
                      {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.description && (
                        <p className="text-sm text-gray-500">{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Kontakt</h4>
                      <p className="text-sm font-semibold text-[#111518]">{customerInfo.name}</p>
                      <p className="text-sm text-gray-500">{customerInfo.email}</p>
                      {customerInfo.phone && <p className="text-sm text-gray-500">{customerInfo.phone}</p>}
                    </div>
                    {companyInfo.name && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Firma</h4>
                        <p className="text-sm font-semibold text-[#111518]">{companyInfo.name}</p>
                        {companyInfo.vatId && <p className="text-sm text-gray-500">IČ DPH: {companyInfo.vatId}</p>}
                        {companyInfo.taxId && <p className="text-sm text-gray-500">DIČ: {companyInfo.taxId}</p>}
                      </div>
                    )}
                  </div>
                  {customerInfo.note && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">Poznámka</h4>
                      <p className="text-sm text-gray-600">{customerInfo.note}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={() => setStep(3)} className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-[#111518] hover:bg-gray-50 transition-colors">
                    SPÄŤ
                  </button>
                  <button onClick={() => handleCheckout()} disabled={submitting} className="px-8 py-4 bg-[#0087E3] text-white rounded-xl text-sm font-bold hover:bg-[#006bb3] transition-all disabled:opacity-50">
                    {submitting ? "Odosielam..." : "ODOSLAŤ OBJEDNÁVKU"}
                  </button>
                </div>
                {submitError && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mt-3">{submitError}</div>}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:sticky lg:top-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Suma bez DPH:</span>
                      <span>{itemsTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>DPH 23 %:</span>
                      <span>{vatTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Doprava:</span>
                      <span>Zadarmo</span>
                    </div>
                    <div className="border-t pt-3 mt-2 flex justify-between items-center">
                      <span className="text-base font-bold text-[#111518]">Spolu:</span>
                      <span className="text-xl font-bold text-[#0087E3]">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KosikPage;
