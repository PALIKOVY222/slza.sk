'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'cookie-consent';
const CONSENT_DATA_KEY = 'cookie-consent-data';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const persistConsentData = () => {
    const payload = {
      acceptedAt: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform || null
    };
    window.localStorage.setItem(CONSENT_DATA_KEY, JSON.stringify(payload));
  };

  const accept = () => {
    window.localStorage.setItem(CONSENT_KEY, 'accepted');
    persistConsentData();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-auto max-w-3xl z-50">
      <div className="bg-[#111518] text-white rounded-xl shadow-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:gap-6">
        <div className="text-sm leading-relaxed md:flex-1">
          Používame cookies na zlepšenie vašej skúsenosti na našej stránke.
        </div>
        <div className="mt-4 md:mt-0 flex gap-3 justify-end">
          <button
            type="button"
            onClick={accept}
            className="bg-white text-[#111518] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#e5e7eb] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
