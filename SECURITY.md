# SLZA.sk - Bezpečnostná dokumentácia

## 🔒 Zabezpečenie aplikácie

### Implementované bezpečnostné opatrenia

#### 1. **Rate Limiting**
- Všetky API endpointy majú rate limiting
- Login endpoint: max 5 požiadaviek za minútu
- Cenové API: max 20 požiadaviek za 10 sekúnd
- Ochrana proti brute-force útokom

#### 2. **Input Sanitization**
- Všetky vstupy sú sanitizované pomocou `sanitizeInput()`
- Odstránenie HTML tagov (<, >)
- Limit dĺžky vstupu (10 000 znakov)
- Validácia emailov a telefónnych čísel

#### 3. **Security Headers**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` pre obmedzenie zdrojov
- `Referrer-Policy: strict-origin-when-cross-origin`

#### 4. **Ochrana cenových zdrojov**
- Obfuskované názvy súborov v kóde
- Žiadne odkazy na "typocon", "anwell", "plotbase" v API odpovediach
- Cache mechanizmus pre rýchlejšie načítanie
- Error handling bez odhalenia zdrojov

#### 5. **Database Security**
- Prisma ORM s pripravenými statements (ochrana proti SQL injection)
- Try-catch bloky pre databázové chyby
- Generické error messages (bez odhalenia štruktúry DB)
- Šifrované heslá pomocou bcrypt

#### 6. **File Upload Security**
- Max veľkosť súboru: 50MB
- Povolené formáty: PDF, JPG, JPEG, PNG, AI, EPS, PSD, SVG
- Validácia pred upload

#### 7. **Session Management**
- 30-dňová expirácia tokenov
- Randomizované tokeny (32 bytes)
- Session cleanup mechanizmus

## 🚀 Nastavenie databázy

### Lokálna PostgreSQL

Ak používate lokálnu PostgreSQL databázu:

```bash
# Spustite PostgreSQL server
brew services start postgresql@16

# Vytvorte databázu
createdb slza

# Aktualizujte .env
DATABASE_URL="postgresql://pavelkovac@localhost:5432/slza"

# Spustite Prisma migrácie
cd frontend
npx prisma migrate dev
npx prisma generate
```

### Supabase (Odporúčané pre produkciu)

1. Vytvorte projekt na [supabase.com](https://supabase.com)
2. Získajte connection string z Settings → Database
3. Aktualizujte `.env`:

```env
DATABASE_URL="postgresql://postgres.abcdefghij:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

4. Spustite migrácie:

```bash
cd frontend
npx prisma db push
npx prisma generate
```

## 🛡️ Bezpečnostné best practices

### Pre vývojárov:

1. **Nikdy necommitujte .env súbor**
   - Je v .gitignore
   - Používajte .env.example ako šablónu

2. **Používajte bezpečnostné utility**
   ```typescript
   import { rateLimit, sanitizeInput, validateEmail } from '@/lib/security';
   ```

3. **Vždy validujte vstupy**
   ```typescript
   if (!validateEmail(email)) {
     return NextResponse.json({ error: 'Neplatný email' }, { status: 400 });
   }
   ```

4. **Používajte try-catch pre databázové operácie**
   ```typescript
   try {
     const user = await prisma.user.findUnique({ where: { email } });
   } catch (dbError) {
     console.error('Database error:', dbError);
     return NextResponse.json({ error: 'Služba nie je dostupná' }, { status: 503 });
   }
   ```

5. **Pridajte security headers do všetkých responses**
   ```typescript
   return addSecurityHeaders(NextResponse.json({ data }));
   ```

### Pre produkciu:

1. **Použite silné heslá pre:**
   - DATABASE_URL
   - SITE_PASSWORD
   - OWNCLOUD_PASSWORD
   - API keys

2. **Zapnite HTTPS**
   - Vercel automaticky poskytuje SSL
   - Pre vlastný hosting použite Let's Encrypt

3. **Nastavte environment variables na Vercel**
   ```bash
   vercel env add DATABASE_URL
   vercel env add STRIPE_SECRET_KEY
   vercel env add RESEND_API_KEY
   # atď...
   ```

4. **Pravidelne aktualizujte dependencies**
   ```bash
   npm audit fix
   npm update
   ```

5. **Monitorujte logy**
   - Sledujte nezvyčajné API požiadavky
   - Rate limit violations
   - Failed login attempts

## 🔐 Tajné informácie - CHRÁNENÉ

### Cenové zdroje
- Súbory s cenami sú mimo git repository
- Nachádzajú sa v root priečinku (mimo frontend/)
- Názvy súborov:
  - `sticker_price_table.json`
  - `banner_price_table.json`
  - `flyer_price_table.json`
  - `typocon_sticker_prices.json`
  - atď.

**POZOR:** Tieto súbory NIKDY nezdieľajte verejne!

### API Keys lokácia
Všetky API keys sú v `.env` súbore:
- Stripe: Test keys (začínajú `pk_test_` a `sk_test_`)
- Resend: `re_U2AJxpWq_3Fvu4oU5YwDoQtM5oJfZJJ8k`
- Packeta: `65d49ba1845d78fb`
- OwnCloud: credentials pre cloud.repro.sk

## 🐛 Troubleshooting

### Problém: "Authentication failed against database server"

**Riešenie:**
1. Skontrolujte či beží PostgreSQL:
   ```bash
   brew services list
   ```

2. Reštartujte PostgreSQL:
   ```bash
   brew services restart postgresql@16
   ```

3. Overte DATABASE_URL v `.env`

4. Znovu vygenerujte Prisma client:
   ```bash
   npx prisma generate
   ```

### Problém: Rate limit errors v developmente

**Riešenie:**
Upravte limity v `lib/security.ts`:
```typescript
const priceRateLimit = rateLimit({ windowMs: 60000, maxRequests: 100 });
```

### Problém: CORS errors

**Riešenie:**
Pridajte do `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ];
}
```

## 📝 Changelog

### v2.0.0 - Security Hardening
- ✅ Implementovaný rate limiting
- ✅ Input sanitization na všetkých API
- ✅ Security headers pridané
- ✅ Obfuskácia cenových zdrojov
- ✅ Database error handling
- ✅ Mobile responsive admin & košík
- ✅ Vylepšené error messages

### v1.0.0 - Initial Release
- Basic e-shop functionality
- Product calculators
- Stripe integration
- Packeta delivery

## 🆘 Support

Pre technickú podporu kontaktujte:
- Email: kovac.jr@slza.sk
- GitHub Issues: (privátne repo)

---

**DÔLEŽITÉ:** Tento dokument obsahuje citlivé bezpečnostné informácie. Nezdieľajte ho verejne!
