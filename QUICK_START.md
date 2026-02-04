# 🚀 Quick Start Guide - SLZA.sk

## ✅ Čo je Hotové

1. **SEO Optimalizácia** - Kompletné meta tagy, structured data, sitemap
2. **Package Updates** - Všetky balíčky aktualizované, Stripe pridaný
3. **Stripe Integration Plan** - Detailný plán v `STRIPE_IMPLEMENTATION.md`
4. **Testing Tools** - Load test & audit nástroje pripravené
5. **Bug Fixes** - Kritické chyby opravené

## 📋 Potrebné Akcie Pred Spustením

### 1. Vyplniť Reálne Údaje

V súbore `frontend/app/layout.tsx` (riadky 60-95):
```typescript
telephone: '+421-XX-XXX-XXXX',    // ← VYPLŇ
email: 'info@slza.sk',             // ← SKONTROLUJ
streetAddress: 'Vaša adresa',      // ← VYPLŇ
postalCode: 'XXX XX',              // ← VYPLŇ
latitude: 49.0,                     // ← VYPLŇ GPS
longitude: 21.0,                    // ← VYPLŇ GPS
```

### 2. Vytvoriť OG Image

Vytvor obrázok: `frontend/public/images/og-image.jpg`
- Rozmery: 1200 x 630 px
- Formát: JPG
- Zobrazuje sa pri zdieľaní na sociálnych sieťach

### 3. Environment Variables

Skopíruj a uprav:
```bash
cd frontend
cp .env.example .env.local
# Uprav .env.local s reálnymi hodnotami
```

### 4. Stripe Setup (keď budeš pripravený)

1. Vytvor účet: https://stripe.com
2. Získaj API keys (Dashboard → Developers → API keys)
3. Pridaj do `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
4. Postupuj podľa `STRIPE_IMPLEMENTATION.md`

## 🧪 Testovanie

### Lokálne Load Testing
```bash
npm run dev          # Spusti server
npm run test:load    # V druhom termináli
```

### Lokálny Audit
```bash
npm run test:audit
```

### Production Testing (keď je live)
```bash
npm run test:production
npm run audit:production
```

## 🎯 Priority

### Teraz Hneď ⚡
1. Vyplniť kontaktné údaje v `layout.tsx`
2. Vytvoriť OG image
3. Nastaviť environment variables
4. Spustiť lokálne testy

### Čoskoro 📅
1. Google Search Console setup
2. Stripe implementácia
3. Image optimization (Next.js Image)
4. Monitoring setup

### Neskôr 🔄
1. Performance tuning
2. A/B testing
3. Analytics deep-dive
4. Customer feedback integration

## 📚 Dokumentácia

- **SEO Details**: Pozri `IMPLEMENTATION_SUMMARY.md`
- **Stripe Guide**: Pozri `STRIPE_IMPLEMENTATION.md`
- **Testing**: Dokumentované v summary
- **Package Info**: `package.json` + changelog

## ⚠️ Dôležité Poznámky

1. **Packeta Widget** - Už integrovaný v layout
2. **Cookie Banner** - Už implementovaný, GDPR ready
3. **Security Headers** - Nastavia sa automaticky cez hosting
4. **SSL Certificate** - Zabezpeč HTTPS pre production

## 🐛 Known Issues

Minor lint warnings (nevplývajú na funkcionalitu):
- TypeScript `any` types v admin sekcii
- Niektoré `<img>` vs `<Image>` (optimalizuj neskôr)
- Package vulnerabilities (third-party, čakáme na updaty)

## 💡 Tips

- Testuj na reálnych zariadeniach (mobile, tablet)
- Monitoruj Core Web Vitals
- Používaj Chrome DevTools Lighthouse
- Sleduj Google Search Console

## 🆘 Support

Ak niečo nie je jasné, skontroluj:
1. `IMPLEMENTATION_SUMMARY.md` - Kompletný prehľad
2. `STRIPE_IMPLEMENTATION.md` - Stripe setup
3. Inline komentáre v kóde

---

**Ready to Launch!** 🚀

Po vyplnení reálnych údajov a vytvorení OG image môžeš deploynuť na production.
