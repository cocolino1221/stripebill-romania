# 🚀 Ghid Deployment pe Vercel

Aplicația ta **StripeBill RO** este gata pentru deployment! Iată cum să o pui online gratuit pe Vercel.

## 📋 Pregătire pentru Deployment

### ✅ Ce am pregătit deja:
- [x] Schema Prisma configurată pentru PostgreSQL
- [x] Package.json cu script-urile corecte
- [x] Vercel.json pentru configurare
- [x] .env.example cu toate variabilele necesare
- [x] Git commit cu toate fișierele

---

## 🌐 PASUL 1: Creează Repository pe GitHub

1. **Mergi la GitHub.com** și creează un repository nou:
   - Nume: `stripebill-saas`
   - Public sau Private (preferabil Private)
   - **NU** inițializa cu README

2. **Push codul local**:
```bash
cd /Users/constantinpristavita/StripeBill
git branch -M main
git remote add origin https://github.com/[username]/stripebill-saas.git
git push -u origin main
```

---

## 🚀 PASUL 2: Deploy pe Vercel

### Opțiunea A: Deploy cu GitHub (Recomandat)

1. **Mergi la vercel.com** și logează-te
2. **Import repository**:
   - Click "New Project"
   - Import de pe GitHub
   - Selectează repository-ul `stripebill-saas`
   
3. **Configurează Environment Variables**:
   ```
   DATABASE_URL = [vei obține de la Vercel Postgres]
   NEXTAUTH_URL = https://[project-name].vercel.app
   NEXTAUTH_SECRET = [generează random string]
   STRIPE_SECRET_KEY = sk_live_...
   STRIPE_PUBLISHABLE_KEY = pk_live_...  
   STRIPE_WEBHOOK_SECRET = whsec_...
   STRIPE_PRO_PRICE_ID = price_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
   ```

4. **Deploy**: Click "Deploy"

### Opțiunea B: Deploy cu Vercel CLI

```bash
# Login la Vercel
npx vercel login

# Deploy
npx vercel --prod
```

---

## 🗄️ PASUL 3: Configurează Database (Vercel Postgres)

1. **În Vercel Dashboard**:
   - Mergi la proiectul tău
   - Tab "Storage" 
   - Click "Create" → "Postgres"
   - Nume: `stripebill-db`

2. **Copiază DATABASE_URL**:
   - Vercel va genera automat DATABASE_URL
   - Adaugă-l în Environment Variables

3. **Run Migrații**:
```bash
# Local - conectat la database-ul Vercel
npm run db:migrate
```

---

## 🔧 PASUL 4: Configurează Stripe pentru Producție

### Pentru Abonamente (banii tăi):

1. **Stripe Dashboard** → https://dashboard.stripe.com/
2. **Schimbă la Live mode** (toggle în partea stângă sus)
3. **Creează produsul Pro**:
   - Products → Create product
   - "StripeBill Pro" - €29.00/month
   - Copiază `price_id`

4. **Webhook pentru abonamente**:
   - Webhooks → Add endpoint  
   - URL: `https://[project-name].vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`
   - Copiază webhook secret

5. **Actualizează .env în Vercel** cu cheile LIVE

---

## 📊 PASUL 5: Testarea în Producție

### Test 1: Landing Page
- Mergi la `https://[project-name].vercel.app`
- Verifică că landing page-ul se încarcă

### Test 2: Înregistrare
- `/auth/register` → creează cont
- Verifică că te redirectează la dashboard

### Test 3: Settings  
- Dashboard → Settings → Tab Stripe
- Verifică că vezi token-ul generat automat
- Copiază URL webhook pentru utilizatori

### Test 4: SmartBill
- Tab "Furnizor Facturi" 
- Configurează SmartBill cu credentiale reale
- Testează conexiunea

### Test 5: Plată Pro
- `/pricing` → "Upgrade la Pro"
- Plătește cu card real (va fi billed)
- Verifică că statusul se schimbă în Pro

---

## 🌍 PASUL 6: Configurează Domeniul Custom (Opțional)

1. **Cumpără domeniu** (ex: stripebill.ro)
2. **În Vercel**:
   - Settings → Domains
   - Add domain
   - Configurează DNS

3. **Actualizează toate URL-urile**:
   - `NEXTAUTH_URL`
   - Stripe webhook URLs
   - Documentația pentru utilizatori

---

## 📈 PASUL 7: Monitorizare și Scaling

### Analytics Vercel:
- Vezi traficul în Vercel Dashboard
- Monitorizează performance-ul
- Verifică logs pentru erori

### Webhook Logs:
- Vercel → Functions → Vezi execuțiile
- Stripe → Events → Vezi webhook-urile
- SmartBill → API logs

### Database Scaling:
- Vercel Postgres scalează automat
- Monitorizează usage în dashboard

---

## 🔒 Variabile de Mediu Complete

Pentru producție, ai nevoie de:

```env
# Database (Vercel Postgres)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://stripebill-saas.vercel.app"
NEXTAUTH_SECRET="super-secret-random-string-64-chars-min"

# Stripe LIVE Keys
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..." 
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Stripe Products  
STRIPE_PRO_PRICE_ID="price_1ABC123..."

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 🆘 Troubleshooting Deployment

### Error: "Database connection failed"
- Verifică că DATABASE_URL este corect
- Run `npm run db:migrate` pentru migrații

### Error: "NextAuth configuration error"  
- Verifică NEXTAUTH_URL și NEXTAUTH_SECRET
- Asigură-te că NEXTAUTH_URL e exact domeniul Vercel

### Error: "Stripe webhook failed"
- Verifică STRIPE_WEBHOOK_SECRET
- Testează webhook-ul în Stripe Dashboard

### Error: "Build failed"
- Verifică că toate dependințele sunt în package.json
- Rulează `npm run build` local pentru debug

---

## 🎉 După Deployment

### Pentru Utilizatori:
1. **Înregistrare** pe `https://[project].vercel.app`
2. **Configurare webhook** Stripe cu token-ul lor
3. **SmartBill setup** cu credentialele lor
4. **Upgrade la Pro** pentru facturi nelimitate

### Pentru Tine:
1. **Primești €29/lună** pentru fiecare utilizator Pro
2. **Monitorizezi** aplicația prin Vercel Dashboard  
3. **Scaling automat** - Vercel se ocupă de trafic
4. **Support utilizatori** prin email/chat

---

## 💰 Revenue Tracking

În Stripe Dashboard poți vedea:
- **MRR** (Monthly Recurring Revenue)
- **Churn rate** (utilizatori care anulează)
- **Growth metrics** (utilizatori noi Pro)

**Target: 100 utilizatori Pro = €2,900/lună = €34,800/an! 🎯**

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://prisma.io/docs

**🇷🇴 Aplicația ta SaaS pentru piața românească este gata să fie profitabilă!**