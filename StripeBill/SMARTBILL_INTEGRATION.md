# 📋 SmartBill Integration - Ghid Complet

Aplicația ta **StripeBill RO** acum generează automat facturi în SmartBill când utilizatorii primesc plăți în conturile lor Stripe conectate.

## 🎯 Cum funcționează

### Fluxul complet:
1. **Utilizatorul conectează Stripe** → OAuth Stripe Connect
2. **Utilizatorul configurează SmartBill** → Username & API Key
3. **Clientul plătește utilizatorul** → Stripe webhook
4. **Factură automată în SmartBill** → Generare & Email

---

## 🔧 Configurarea SmartBill

### PASUL 1: Obține credentialele SmartBill

1. **Logează-te în SmartBill**:
   - Mergi la [https://www.smartbill.ro](https://www.smartbill.ro)
   - Logează-te cu contul tău

2. **Găsește API credentialele**:
   - **Settings** → **Integrări** → **API**
   - Notează-ți **Username**-ul (de obicei e email-ul)
   - Generează sau găsește **API Key**-ul

### PASUL 2: Configurează în aplicație

1. **Mergi la Settings**:
   - Dashboard → Settings → Tab "Furnizor Facturi"

2. **Alege SmartBill**:
   - Selectează "SmartBill" din opțiuni
   - Completează seria facturilor (ex: "FAC")

3. **Adaugă credentialele**:
   - **Utilizator SmartBill**: username-ul tău SmartBill
   - **API Key SmartBill**: cheia API

4. **Testează conexiunea**:
   - Click "Testează conexiunea"
   - Ar trebui să vezi: "🎉 Conexiunea cu SmartBill a fost stabilită cu succes!"

---

## 🧪 Testarea Integrării

### Test 1: Verificare Conexiune
```bash
# Din aplicație, în tab Settings → Furnizor Facturi
# Completează credentialele SmartBill și click "Testează conexiunea"
```

**Rezultat așteptat**: Mesaj de succes verde

### Test 2: Simulare Plată (Webhook)

Pentru a testa generarea facturilor, trebuie să simulezi o plată în contul Stripe conectat:

1. **Folosește Stripe CLI** (opțional):
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger payment_intent.succeeded --add payment_intent:account=acct_utilizatorului
```

2. **Sau fă o plată reală test**:
   - Folosește cardurile test Stripe
   - Plătește în contul conectat al utilizatorului

**Rezultat așteptat**:
- Factură nouă în database (vizibilă în Dashboard → Facturi)
- Factură generată în SmartBill
- Email trimis clientului (dacă are email)

---

## 📊 Monitorizarea Facturilor

### În Dashboard aplicație:
- **Facturi** → Lista tuturor facturilor generate
- **Status**: `generated`, `sent`, `failed`
- **Detalii**: Date client, sumă, seria factură

### În SmartBill Dashboard:
- Facturile apar automat cu seria configurată
- PDF-ul poate fi descărcat direct din SmartBill
- Email-urile sunt trimise automat clientului

---

## 🔍 Structura Facturilor Generate

### Date incluse automat:
- **Client**: Nume din Stripe shipping/billing
- **Email**: Pentru trimiterea facturilor
- **Adresă**: Dacă disponibilă în Stripe
- **Sumă**: Convertită automat din Stripe (EUR → RON)
- **TVA**: 19% (standard România)
- **Descriere**: Informații plată Stripe

### Exemplu factură:
```
Serie: FAC-001
Client: Ion Popescu
Email: ion@example.com
Serviciu: Serviciu digital - Plată Stripe pi_123abc
Suma: 100.00 RON + 19.00 TVA = 119.00 RON TOTAL
```

---

## ⚙️ Configurări Avansate

### 1. Seria facturilor
- Poate fi personalizată în Settings → Furnizor Facturi
- Exemplu: "FAC", "FACT", "INV"

### 2. Convertirea valutelor
- EUR → RON: 1 EUR ≈ 5 RON (rate fixă)
- Pentru rate live, se poate integra API de schimb valutar

### 3. Date companie
- Configurate în Settings → Date Companie
- Apar pe toate facturile generate

---

## 🚨 Depanarea Problemelor

### Problema: "Conexiune eșuată"
**Soluții**:
- Verifică username-ul și API key-ul SmartBill
- Asigură-te că contul SmartBill are API activat
- Verifică că nu ai firewall care blochează SmartBill API

### Problema: "Factură nu se generează"
**Verificări**:
1. Utilizatorul are Stripe conectat?
2. SmartBill este configurat corect?
3. Utilizatorul mai are facturi disponibile (Free: 3, Pro: nelimitat)?
4. Webhook-ul Stripe funcționează?

### Problema: "Email nu se trimite"
**Cauze**:
- Clientul nu are email în datele Stripe
- SmartBill email service temporar indisponibil
- Email invalid/bounced

---

## 📈 Limitări și Plan Facturi

### Plan FREE:
- **3 facturi gratuite** pe cont
- După epuizare: mesaj în webhook logs

### Plan PRO (29€/lună):
- **Facturi nelimitate**
- Toate funcționalitățile premium

### Verificare limite:
```typescript
// În webhook, se verifică automat:
const canGenerateInvoice = user.subscriptionStatus === 'active' || user.freeInvoicesUsed < 3
```

---

## 🔐 Securitate și Conformitate

### Date protejate:
- ✅ API key-urile SmartBill sunt criptate în database
- ✅ Webhook-urile Stripe sunt verificate cu signature
- ✅ Toate API-urile necesită autentificare

### Conformitate română:
- ✅ TVA 19% aplicată automat
- ✅ Format CUI/CIF validat
- ✅ Numerotare secvențială facturi
- ✅ Date companie complete pe factură

---

## 📞 Suport Tehnic

### Log-uri utile:
```bash
# În aplicație - consola browser
console.log pentru erori SmartBill

# În server logs
npm run dev # vezi webhook processing

# În Stripe Dashboard
Events → Vezi toate webhook-urile procesate
```

### Contacte:
- **Probleme SmartBill API**: support@smartbill.ro
- **Probleme Stripe**: dashboard.stripe.com/support
- **Probleme aplicație**: logs din browser/server

---

## 🎉 Rezultatul Final

După configurare completă:

**✅ Pentru tine (proprietarul aplicației)**:
- Primești 29€/lună din abonamentele utilizatorilor
- Ai dashboard pentru monitorizarea tuturor facturilor
- Poți vedea statistici complete de utilizare

**✅ Pentru utilizatori**:
- Facturi generate automat la fiecare plată primită
- Email-uri automate către clienții lor
- Conformitate completă cu legislația română
- Economie de timp și eliminarea erorilor manuale

**🇷🇴 Perfect pentru piața românească!**