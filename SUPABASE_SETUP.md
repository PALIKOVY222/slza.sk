# 🚀 Supabase Database Setup pre SLZA.sk

## Krok 1: Vytvorenie Supabase projektu

1. Otvorte [Supabase Dashboard](https://supabase.com/dashboard)
2. Kliknite na **"New Project"**
3. Vyplňte:
   - **Name**: `slza-production` (alebo ľubovoľný názov)
   - **Database Password**: Vygenerujte silné heslo (uložte si ho!)
   - **Region**: `Europe (Frankfurt)` - najbližšie k SR
4. Kliknite **"Create new project"** (trvá 1-2 minúty)

## Krok 2: Získanie Connection Stringu

1. V ľavom menu kliknite na **Settings** (⚙️ ikona dole)
2. Kliknite na **Database**
3. Scrollnite na **Connection string**
4. Zvoľte **Session mode** (nie Transaction!)
5. Skopírujte connection string - vyzerá asi takto:

```
postgresql://postgres.abcdefghijklmn:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

## Krok 3: Aktualizácia .env súboru

1. Otvorte súbor `frontend/.env`
2. Nahraďte riadok `DATABASE_URL` týmto connection stringom
3. Nezabudnite nahradiť `[YOUR-PASSWORD]` vaším skutočným heslom

**Príklad:**
```env
DATABASE_URL="postgresql://postgres.abcdefghij:vase_silne_heslo_123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

## Krok 4: Spustenie Prisma migrácií

```bash
cd frontend
npx prisma db push
npx prisma generate
```

Tento príkaz vytvorí všetky tabuľky v Supabase databáze.

## Krok 5: Vytvorenie Admin používateľa

Spustite v termináli:

```bash
cd frontend
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash('vaseheslo123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'kovac.jr@slza.sk',
        passwordHash: passwordHash,
        firstName: 'Pavel',
        lastName: 'Kováč',
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Admin user created:', user.email);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

createAdmin();
"
```

**Zmeňte:**
- `vaseheslo123` → vaše admin heslo
- Email ak chcete iný

## Krok 6: Test pripojenia

Spustite dev server:

```bash
npm run dev
```

Potom skúste:
1. Otvoriť http://localhost:3000/login
2. Prihlásiť sa s admin emailom a heslom
3. Ak sa prihlásenie podarí → Supabase funguje! 🎉

## 🔍 Overenie databázy

V Supabase dashboarde:
1. **Table Editor** (ľavé menu)
2. Mali by ste vidieť tabuľky: `User`, `Session`, `Order`, atď.
3. V tabuľke `User` by mal byť váš admin účet

## 🚀 Deployment na Vercel

Keď funguje lokálne, pridajte connection string na Vercel:

```bash
vercel env add DATABASE_URL
# Paste your Supabase connection string
```

Alebo cez Vercel dashboard:
1. Project Settings → Environment Variables
2. Add new: `DATABASE_URL`
3. Paste Supabase connection string
4. Save

Potom redeploy:
```bash
vercel --prod
```

## ⚠️ Dôležité poznámky

### Connection Pooling
Supabase poskytuje 2 typy connection stringov:
- **Session mode** (port 6543) - použite tento! ✅
- **Transaction mode** (port 5432) - nepoužívať s Prisma

### Limity free tier
- **Database size**: 500 MB
- **Bandwidth**: 5 GB/mesiac
- **Concurrent connections**: 500

Pre produkciu zvážte upgrade na **Pro plan** ($25/mesiac).

### Zálohovanie
Supabase automaticky zálohuje databázu:
- Free tier: 7 dní histórie
- Pro tier: 14-30 dní

## 🆘 Troubleshooting

### Chyba: "Could not connect to database"
- Skontrolujte connection string v `.env`
- Overte že je heslo správne (žiadne medzery)
- Port by mal byť `6543` (Session mode)

### Chyba: "SSL required"
Pridajte na koniec connection stringu:
```
?sslmode=require
```

### Chyba: "Too many connections"
Restartujte dev server alebo počkajte 5 minút.

### Chyba pri migrácii
Skúste:
```bash
npx prisma db push --force-reset
```
**POZOR:** Toto vymaže všetky dáta!

## ✅ Checklist

- [ ] Supabase projekt vytvorený
- [ ] Connection string skopírovaný
- [ ] `.env` aktualizovaný
- [ ] `npx prisma db push` úspešné
- [ ] `npx prisma generate` úspešné
- [ ] Admin user vytvorený
- [ ] Login test úspešný
- [ ] Vercel env variables nastavené

---

**Hotovo!** Teraz máte produkčnú databázu na Supabase 🚀
