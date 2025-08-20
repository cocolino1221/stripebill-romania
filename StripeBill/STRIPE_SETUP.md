# 🚀 Configurarea Stripe pentru StripeBill RO

Acest ghid te va ajuta să configurezi Stripe pentru a primi plăți din abonamentele utilizatorilor (29€/lună pentru planul Pro) și pentru a permite utilizatorilor să-și conecteze propriile conturi Stripe pentru generarea automată de facturi.

## 📋 Tipuri de integrări Stripe

### 1. **Stripe Standard** (pentru ca TU să primești banii din abonamente)
- Aici configurezi contul TĂU personal/business Stripe
- Utilizatorii plătesc CĂTRE TINE abonamentul Pro (29€/lună)
- Banii din abonamente vin direct în contul TĂU

### 2. **Stripe Connect** (pentru conturile utilizatorilor)
- Permite utilizatorilor să-și conecteze propriile conturi Stripe
- Când utilizatorii primesc plăți în conturile lor Stripe → se generează facturi automat
- Tu nu ai acces la banii utilizatorilor, doar facilitezi conectarea

---

## 🏦 PASUL 1: Configurarea Contului TĂU Stripe (pentru a primi banii din abonamente)

### 1.1. Creează/Logează-te în Stripe Dashboard
- Mergi la [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
- Creează cont sau logează-te cu contul tău existent

### 1.2. Obține Cheile API
În dashboard-ul Stripe:
1. **Developers** → **API keys**
2. Copiază cheile și adaugă-le în `.env`:

```env
# Cheia ta secretă pentru backend
STRIPE_SECRET_KEY="sk_test_51ABC123..." 
# Cheia ta publică pentru frontend  
STRIPE_PUBLISHABLE_KEY="pk_test_51ABC123..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51ABC123..."
```

### 1.3. Creează Produsul "Plan Pro" 
1. **Products** → **Create product**
2. Setează:
   - **Name**: "StripeBill Pro"
   - **Description**: "Plan Pro cu facturi nelimitate"
   - **Pricing model**: Recurring
   - **Price**: €29.00
   - **Billing period**: Monthly

3. După creare, copiază **Price ID** (ex: `price_1ABC123...`) și adaugă în `.env`:
```env
STRIPE_PRO_PRICE_ID="price_1ABC123..."
```

### 1.4. Configurează Webhook pentru Abonamente
1. **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
3. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.updated`  
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

4. După creare, copiază **Webhook signing secret** și adaugă în `.env`:
```env
STRIPE_WEBHOOK_SECRET="whsec_1ABC123..."
```

---

## 🔗 PASUL 2: Configurarea Stripe Connect (pentru conturile utilizatorilor)

### 2.1. Activează Stripe Connect
1. În dashboard-ul Stripe → **Connect** → **Get started**
2. Alege **Platform** (nu Marketplace)
3. Completează informațiile despre platforma ta

### 2.2. Configurează OAuth pentru Connect
1. **Connect** → **Settings**
2. **OAuth settings**:
   - **Redirect URI**: `http://localhost:3000/api/stripe/connect/callback` (pentru dev)
   - Pentru producție: `https://yourdomain.com/api/stripe/connect/callback`

3. Copiază **Client ID** și adaugă în `.env`:
```env
STRIPE_CONNECT_CLIENT_ID="ca_ABC123..."
```

### 2.3. Webhook pentru Connected Accounts
1. **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
3. **Connect to**: Connect applications
4. **Events**:
   - `payment_intent.succeeded`
   - `checkout.session.completed`

---

## ⚙️ PASUL 3: Configurarea Finală

### 3.1. Verifică fișierul .env
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-please-change-this-in-production"

# Stripe (pentru abonamente - AICI îți adaugi cheia TA pentru a primi bani)
STRIPE_SECRET_KEY="sk_test_51ABC123..."
STRIPE_PUBLISHABLE_KEY="pk_test_51ABC123..."
STRIPE_WEBHOOK_SECRET="whsec_1ABC123..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51ABC123..."

# Stripe Connect (pentru OAuth cu conturile utilizatorilor)
STRIPE_CONNECT_CLIENT_ID="ca_ABC123..."

# Stripe Products & Prices (pentru abonamente)
STRIPE_PRO_PRICE_ID="price_1ABC123..."
```

### 3.2. Testarea în Dezvoltare
1. **Restart aplicația**: `npm run dev`
2. **Testează conectarea Stripe Connect**:
   - Mergi la `/dashboard/settings`
   - Click "Conectează Stripe" 
   - Ar trebui să te redirecteze la Stripe OAuth

3. **Testează abonamentul**:
   - Mergi la `/pricing`
   - Click "Upgrade la Pro"
   - Ar trebui să te redirecteze la Stripe Checkout

---

## 💳 PASUL 4: Teste cu Carduri Test

Pentru testare, folosește aceste carduri Stripe test:

### Carduri de Succes:
- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **Amex**: `3782 822463 10005`

### Carduri de Eroare:
- **Card declined**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`

**Date de expirare**: orice dată viitoare (ex: 12/25)
**CVC**: orice 3-4 cifre
**ZIP**: orice cod valid

---

## 🌍 PASUL 5: Deploy în Producție

### 5.1. Schimbă la Chei Live
În dashboard Stripe:
1. Toggle **View test data** OFF
2. Creează din nou produsul și webhook-urile
3. Actualizează `.env` cu cheile live (`sk_live_...`, `pk_live_...`)

### 5.2. Configurează Domeniul
1. Actualizează toate URL-urile de dezvoltare cu domeniul tău real
2. Actualizează redirect URI-urile în Stripe Connect settings
3. Actualizează endpoint URL-urile pentru webhook-uri

---

## 🎯 Rezultatul Final

După configurare, ai:

### ✅ Pentru Abonamente (TU primești banii):
- Utilizatorii pot cumpăra planul Pro (29€/lună)
- Banii vin direct în contul TĂU Stripe
- Abonamentele se gestionează automat (reînnoire, anulare, etc.)

### ✅ Pentru Utilizatori (ei își conectează conturile):
- Utilizatorii pot conecta propriile conturi Stripe prin OAuth
- Când utilizatorii primesc plăți → facturile se generează automat
- Tu nu ai acces la banii utilizatorilor, doar facilitezi procesul

### 📊 Dashboard Stripe:
- **Payments**: Vezi toate plățile pentru abonamente (banii TĂI)
- **Connect**: Vezi conturile conectate de utilizatori
- **Webhooks**: Monitorizează toate evenimentele

---

## 🆘 Suport și Troubleshooting

### Probleme Comune:

1. **Webhook failed**: Verifică URL-ul și SSL-ul
2. **OAuth error**: Verifică redirect URI-urile
3. **Payment failed**: Verifică cheile API și produsele

### Log-uri Utile:
```bash
# În aplicație
npm run dev

# În consola browser-ului
console.log pentru erori

# În Stripe Dashboard
Events → Vezi toate webhook-urile și erorile
```

**🎉 Felicitări! Stripe este configurat și gata să primești primii tăi €29/lună!**