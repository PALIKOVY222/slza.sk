# URGENT: Databáza nie je pripojená! ❌

## Problém
DATABASE_URL v `.env.local` ukazuje na `localhost` namiesto Supabase.

## Dôsledky
- ❌ Objednávky sa neukladajú do databázy
- ❌ V "Môj účet" sa nezobrazujú objednávky
- ❌ Admin nevidí zákazníkov
- ❌ Podklady sa neukladajú (potrebná DATABASE_URL)

## Riešenie

### 1. Získaj Supabase connection string

1. Choď na https://supabase.com/dashboard
2. Otvor svoj projekt SLZA
3. Klikni **Settings** → **Database**
4. Nájdi sekciu **Connection string**
5. Prepni na **Transaction Mode** (alebo Session Mode)
6. Skopíruj connection string
7. **DÔLEŽITÉ**: Nahraď `[YOUR-PASSWORD]` skutočným heslom z Supabase

### 2. Uprav `.env.local`

Otvor `frontend/.env.local` a zmeň:

```bash
# PRED (nesprávne):
DATABASE_URL="postgresql://pavelkovac@localhost:5432/pavelkovac"

# PO (správne - príklad):
DATABASE_URL="postgresql://postgres.abcdefgh:TVOJE_HESLO@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

### 3. Spusti migrácie

```bash
cd frontend
npx prisma migrate deploy
npx prisma generate
```

### 4. Vytvor admin konto

```bash
cd frontend
npx ts-node scripts/create-admin.ts
```

**Admin prihlasovacie údaje:**
- Email: `admin@slza.sk`
- Heslo: `1160`

### 5. Restart Vercel deploymentu

Po úprave `.env.local` v lokáli, musíš:

1. Choď do **Vercel dashboard**
2. Otvor projekt **slza.sk**
3. Choď do **Settings** → **Environment Variables**
4. Pridaj/uprav:
   - `DATABASE_URL` = tvoj Supabase connection string
   - `OWNCLOUD_ROOT` = `/tlacove_podklady`
5. **Redeploy** najnovší deployment

### 6. Overenie

Po nastavení DATABASE_URL:

1. Vytvor testovaciu objednávku
2. Skontroluj **Supabase dashboard** → **Table Editor** → **Order** table
3. Prihláš sa do `/ucet` - mali by sa zobraziť objednávky
4. Prihláš sa ako admin (`admin@slza.sk` / `1160`) do `/admin`

## Supabase Connection String Formáty

### Transaction Mode (Pooling) - RECOMMENDED
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Direct Connection
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

## Checklist

- [ ] DATABASE_URL nastavené v `.env.local`
- [ ] DATABASE_URL nastavené v Vercel Environment Variables
- [ ] OWNCLOUD_ROOT nastavené
- [ ] Spustené `prisma migrate deploy`
- [ ] Vytvorené admin konto
- [ ] Redeploy Vercel
- [ ] Otestované vytvorenie objednávky
- [ ] Overené v Supabase Table Editor

## Kontakt na Supabase heslo

Ak si zabudol Supabase heslo:
1. Choď do Supabase dashboard → Settings → Database
2. Klikni **Reset database password**
3. Skopíruj nové heslo
4. Uprav DATABASE_URL s novým heslom
