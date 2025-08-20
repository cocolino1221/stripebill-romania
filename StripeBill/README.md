# StripeBill RO - Automatizare Facturi România

MVP SaaS pentru generarea automată a facturilor românești din plățile Stripe către SmartBill sau FGO.

## 🚀 Funcționalități

- **Landing Page** profesională în română cu secțiuni pentru features, prețuri și flux de lucru
- **Autentificare completă** cu NextAuth.js (Google OAuth + email/password)
- **Dashboard modern** cu statistici utilizator și managementul facturilor
- **Arhitectură scalabilă** cu Next.js 14, TypeScript, Prisma și Tailwind CSS

## 📋 Tehnologii folosite

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes, Prisma ORM, SQLite (dev)
- **Autentificare**: NextAuth.js cu Google OAuth
- **UI/UX**: Heroicons, design modern românesc
- **Database**: SQLite pentru development, PostgreSQL pentru producție

## 🏗️ Structura proiectului

```
StripeBill/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Layout principal
│   │   ├── auth/              # Pagini autentificare
│   │   ├── dashboard/         # Dashboard protejat
│   │   └── api/               # API routes
│   ├── components/            # Componente UI reutilizabile
│   ├── lib/                   # Utilitare (auth, Prisma, utils)
│   └── middleware/            # Next.js middleware
├── prisma/                    # Schema și migrații database
├── .env                       # Variabile de mediu
└── package.json              # Dependințe și scripturi
```

## 🚀 Cum să rulezi proiectul

### 1. Instalare dependințe
```bash
npm install
```

### 2. Configurare mediu
Copiază `.env.example` în `.env` și completează variabilele:

```bash
cp .env.example .env.local
```

Variabile necesare:
- `NEXTAUTH_SECRET`: Cheie secretă pentru NextAuth.js
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Pentru Google OAuth (opțional)
- `DATABASE_URL`: URL conexiune database

### 3. Configurare database
```bash
# Generează Prisma client
npx prisma generate

# Rulează migrațiile
npx prisma migrate dev --name init

# (Opțional) Vizualizează database
npx prisma studio
```

### 4. Pornire server development
```bash
npm run dev
```

Aplicația va fi disponibilă la: **http://localhost:3000**

## 📱 Pagini disponibile

### Publice
- `/` - Landing page cu prezentare și prețuri
- `/pricing` - Pagină detaliată cu prețuri și FAQ
- `/auth/login` - Autentificare utilizatori
- `/auth/register` - Înregistrare utilizatori noi

### Private (după autentificare)
- `/dashboard` - Dashboard principal cu statistici și progres
- `/dashboard/settings` - Configurare Stripe, furnizori facturi și date companie
- `/dashboard/invoices` - Lista completă cu filtrare și căutare
- `/dashboard/profile` - Gestionarea profilului și securitatea contului

## 🎯 Flux utilizator

1. **Landing page**: Utilizatorul vede beneficiile și prețurile
2. **Înregistrare**: Creare cont cu email/password sau Google
3. **Dashboard**: Vizualizare status configurare și statistici
4. **Configurare**:
   - Conectare cont Stripe (OAuth)
   - Alegere furnizor facturi (SmartBill/FGO)
   - Setări facturare (seria, TVA, companie)
5. **Automatizare**: Webhook Stripe → Generare factură → Email client

## 🔧 Features implementate

✅ **Completate**:
- Setup Next.js 14 cu TypeScript și Turbopack
- UI modern cu Tailwind CSS + ShadCN UI + Heroicons
- Bază de date cu Prisma ORM (SQLite dev, PostgreSQL prod)
- Autentificare NextAuth.js (credentials + Google OAuth)
- Landing page română cu secțiuni complete
- Dashboard funcțional cu statistici și progres
- Pagină setări cu tabs pentru Stripe/Furnizori/Companie
- Lista facturilor cu filtrare și căutare avansată
- Pagină prețuri cu FAQ detaliată
- Gestionare profil utilizator
- Schema database completă pentru users/invoices/settings
- API-uri pentru toate funcționalitățile

✅ **Stripe Integration Completă**:
- OAuth Stripe Connect pentru utilizatori (conectare conturi)
- Sistem abonament complet (Free → Pro 29€/lună)
- Stripe Checkout și Customer Portal
- Webhook-uri pentru gestionarea abonamentelor
- Dashboard cu management abonament

🚧 **În dezvoltare**:
- Webhook-uri pentru generare facturi automate (la plățile utilizatorilor)
- API SmartBill/FGO pentru generare facturi conforme
- Sistem email pentru trimiterea facturilor către clienții finali

## 💡 Planul de monetizare

- **Plan Free**: 3 facturi gratuite
- **Plan Pro**: 29€/lună pentru facturi nelimitate + features premium

## 🔐 Securitate

- Criptarea token-urilor Stripe
- Validare server-side pentru toate API-urile  
- Rate limiting pentru webhook-uri
- Sanitizare date utilizator

## 🚀 Configurarea Stripe (ESENȚIALĂ)

Pentru a funcționa complet, trebuie să configurezi Stripe în 2 moduri:

### 1. **Pentru Abonamente** (ca să primești TU banii de la utilizatori):
- Creează cont Stripe personal/business
- Configurează produsul "Pro Plan" (29€/lună)  
- Obține cheile API și adaugă-le în `.env`
- **Rezultat**: Primești 29€/lună de la fiecare utilizator Pro

### 2. **Pentru OAuth** (ca utilizatorii să-și conecteze conturile):
- Activează Stripe Connect în dashboard
- Configurează OAuth redirect URLs
- **Rezultat**: Utilizatorii pot conecta propriile conturi Stripe

**📖 Ghid complet**: Vezi `STRIPE_SETUP.md` pentru instrucțiuni pas cu pas

## 📝 Dezvoltare următoare

1. **SmartBill API** - Generare facturi conforme cu legislația RO
2. **FGO API** - Alternativă pentru generare facturi  
3. **Email service** - Trimitere automată facturi către clienți finali
4. **Webhook facturi** - Generare automată la plățile utilizatorilor
5. **Raportare avansată** - Analytics și insights pentru utilizatori

---

**Dezvoltat pentru piața românească** 🇷🇴  
*Automatizează-ți facturarea și economisește timp prețios!*