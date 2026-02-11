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
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#0087E3] to-[#006bb3] text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
      >
        {processing ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Spracovavam platbu...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Zaplatit
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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (shippingMethod === "packeta" && !packetaPoint)
        throw new Error("Vyberte vydajne miesto Packeta");
      if (!customerInfo.name || !customerInfo.email)
        throw new Error("Vyplnte meno a email");

      const orderNumRes = await fetch("/api/orders/generate-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!orderNumRes.ok)
        throw new Error("Nepodarilo sa vygenerovat cislo objednavky.");
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
          if (!storedFile) throw new Error("Podklady sa nenasli.");
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
          if (!res.ok) throw new Error("Nepodarilo sa nahrat subor do cloudu.");
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
      if (!orderRes.ok) throw new Error("Nepodarilo sa odoslat objednavku.");

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
          throw new Error(piData.error || "Nepodarilo sa vytvorit platbu");
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
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      <Header />

      {/* Hero banner */}
      <section className="bg-gradient-to-r from-[#0087E3] to-[#006bb3] pt-32 sm:pt-40 lg:pt-48 pb-12 sm:pb-16 lg:pb-24 text-center">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            Nakupny kosik
          </h1>
          <p className="text-white/90 text-sm sm:text-base lg:text-lg">
            Skontrolujte svoju objednavku a dokoncite nakup
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-5">
          {cartItems.length === 0 && !clientSecret ? (
            <div className="text-center py-12 sm:py-16">
              <svg
                className="w-20 h-20 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-[#111518] mb-2">
                Vas kosik je prazdny
              </h2>
              <p className="text-[#4d5d6d] mb-8">
                Pridajte produkty do kosika.
              </p>
              <a
                href="/produkty"
                className="inline-block bg-[#0087E3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#006bb3]"
              >
                Prejst na produkty
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#111518] mb-4 sm:mb-6">
                  Polozky v kosiku
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {cartItems.map((item) => {
                    const artworkOpt = (
                      item.options as Record<string, unknown>
                    )?.artwork as Record<string, unknown> | undefined;
                    return (
                      <div
                        key={item.id}
                        className="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6"
                      >
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain bg-gray-50 rounded-lg flex-shrink-0 mx-auto sm:mx-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#111518] mb-2 text-center sm:text-left">
                              {item.productName}
                            </h3>
                            <div className="space-y-1 mb-3">
                              {Object.entries(item.options).map(
                                ([key, value]) => {
                                  if (key === "quantity" || key === "artwork")
                                    return null;
                                  return (
                                    <p
                                      key={key}
                                      className="text-xs sm:text-sm text-[#4d5d6d]"
                                    >
                                      <span className="font-medium">
                                        {key}:
                                      </span>{" "}
                                      {formatOptionValue(value)}
                                    </p>
                                  );
                                }
                              )}
                              {artworkOpt?.name ? (
                                <p className="text-xs sm:text-sm text-green-600 font-medium">
                                  📎 {String(artworkOpt.name)}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-center sm:justify-start gap-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#0087E3] font-bold"
                                >
                                  -
                                </button>
                                <span className="font-semibold min-w-[40px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#0087E3] font-bold"
                                >
                                  +
                                </button>
                              </div>
                              <div className="flex items-center justify-between border-t pt-3">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-sm text-red-600 hover:underline font-medium"
                                >
                                  Odstranit
                                </button>
                                <p className="text-xl font-bold text-[#0087E3]">
                                  {(item.price * item.quantity).toFixed(2)} EUR
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order summary sidebar */}
              <div>
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 lg:sticky lg:top-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#111518] mb-4 sm:mb-6">
                    Suhrn objednavky
                  </h2>
                  <div className="space-y-2 mb-4 pb-4 border-b">
                    <div className="flex justify-between text-[#4d5d6d] text-sm sm:text-base">
                      <span>Produkty:</span>
                      <span className="font-semibold">
                        {itemsTotal.toFixed(2)} EUR
                      </span>
                    </div>
                    <div className="flex justify-between text-[#4d5d6d] text-sm sm:text-base">
                      <span>DPH (23%):</span>
                      <span className="font-semibold">
                        {vatTotal.toFixed(2)} EUR
                      </span>
                    </div>
                    <div className="flex justify-between text-[#4d5d6d] text-sm sm:text-base">
                      <span>Doprava:</span>
                      <span className="font-semibold">
                        {shippingCost.toFixed(2)} EUR
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-[#111518] pt-2">
                      <span>Celkom:</span>
                      <span className="text-[#0087E3]">
                        {total.toFixed(2)} EUR
                      </span>
                    </div>
                  </div>

                  {clientSecret ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          Objednavka #{orderNumber} vytvorena
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#111518]">
                        Platba kartou
                      </h3>
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: "stripe",
                            variables: {
                              colorPrimary: "#0087E3",
                              borderRadius: "10px",
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
                        <div className="text-sm text-red-600">
                          {submitError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <form
                      onSubmit={handleCheckout}
                      className="space-y-3 sm:space-y-4"
                    >
                      {/* Shipping method */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-[#111518] mb-2">
                          Sposob dopravy
                        </label>
                        <select
                          value={shippingMethod}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                        >
                          <option value="packeta">
                            Packeta - 3,50 EUR
                          </option>
                          <option value="courier">Kurier - 5,00 EUR</option>
                          <option value="personal_pickup">
                            Osobny odber - ZDARMA
                          </option>
                        </select>
                      </div>

                      {shippingMethod === "packeta" && (
                        <button
                          type="button"
                          onClick={() => {
                            const w = window as unknown as Record<
                              string,
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              any
                            >;
                            if (w.Packeta) {
                              w.Packeta.Widget.pick(
                                "65d49ba1845d78fb",
                                (point: { id: string; name: string }) => {
                                  if (point)
                                    setPacketaPoint({
                                      id: point.id,
                                      name: point.name,
                                    });
                                }
                              );
                            } else {
                              alert("Packeta widget nie je nacitany");
                            }
                          }}
                          className="w-full px-3 py-2 sm:py-3 border-2 border-[#0087E3] text-[#0087E3] rounded-lg hover:bg-[#0087E3] hover:text-white transition-colors text-xs sm:text-sm"
                        >
                          {packetaPoint
                            ? `Vydajne miesto: ${packetaPoint.name}`
                            : "Vybrat vydajne miesto Packeta"}
                        </button>
                      )}

                      {/* Payment method */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-[#111518] mb-2">
                          Sposob platby
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                        >
                          <option value="card">Platobna karta</option>
                          <option value="bank_transfer">
                            Bankovy prevod
                          </option>
                          <option value="cash_on_delivery">Dobierka</option>
                        </select>
                      </div>

                      {/* Customer info */}
                      <input
                        type="text"
                        placeholder="Meno a priezvisko *"
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            name: e.target.value,
                          })
                        }
                        required
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            email: e.target.value,
                          })
                        }
                        required
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                      />
                      <input
                        type="tel"
                        placeholder="Telefon *"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            phone: e.target.value,
                          })
                        }
                        required={!authUserId}
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                      />
                      <textarea
                        placeholder="Adresa *"
                        value={customerInfo.address}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            address: e.target.value,
                          })
                        }
                        required={!authUserId}
                        rows={3}
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                      />

                      {/* Company toggle */}
                      <button
                        type="button"
                        onClick={() => setShowCompanyInfo(!showCompanyInfo)}
                        className="w-full flex items-center justify-between px-3 py-2 sm:py-3 border-2 border-gray-300 rounded-lg hover:border-[#0087E3] transition-colors text-sm text-left"
                      >
                        <span className="font-medium">
                          Fakturacne udaje firmy
                        </span>
                        <svg
                          className={`w-5 h-5 transition-transform ${showCompanyInfo ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {showCompanyInfo && (
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <input
                            type="text"
                            placeholder="Nazov firmy"
                            value={companyInfo.name}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="IC DPH"
                              value={companyInfo.vatId}
                              onChange={(e) =>
                                setCompanyInfo({
                                  ...companyInfo,
                                  vatId: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm"
                            />
                            <input
                              type="text"
                              placeholder="DIC"
                              value={companyInfo.taxId}
                              onChange={(e) =>
                                setCompanyInfo({
                                  ...companyInfo,
                                  taxId: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="ICO"
                            value={companyInfo.registration}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
                                registration: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm"
                          />
                        </div>
                      )}

                      <textarea
                        placeholder="Poznamka k objednavke"
                        value={customerInfo.note}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            note: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                      />

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#0087E3] to-[#006bb3] text-white py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
                      >
                        {submitting
                          ? "Odosielam..."
                          : paymentMethod === "card"
                            ? "Pokracovat k platbe"
                            : "Dokoncit objednavku"}
                      </button>

                      {submitError && (
                        <div className="text-sm text-red-600 mt-3">
                          {submitError}
                        </div>
                      )}
                    </form>
                  )}
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
