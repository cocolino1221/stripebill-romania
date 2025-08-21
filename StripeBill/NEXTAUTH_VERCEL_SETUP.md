# 🔐 NextAuth.js pe Vercel - Setup Complet

## 🎯 Environment Variables OBLIGATORII

### **1. NEXTAUTH_SECRET (CRITICAL)**
```env
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
```

**Generează cu:**
```bash
openssl rand -base64 32
```
Sau: https://generate-secret.vercel.app/32

### **2. NEXTAUTH_URL (CRITICAL)**
```env
# Production
NEXTAUTH_URL=https://stripebill-romania.vercel.app

# Preview
NEXTAUTH_URL=https://stripebill-romania-git-main.vercel.app
```

### **3. Database pentru sesiuni**
```env
DATABASE_URL=postgresql://default:password@host:5432/verceldb
```

### **4. Google OAuth (opțional)**
```env
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
```

---

## ⚙️ **Configurare în Vercel Dashboard**

### **PASUL 1: Environment Variables**
Vercel Dashboard → **Settings** → **Environment Variables**

**Adaugă pentru Production:**
| Key | Value | Environment |
|-----|-------|-------------|
| `NEXTAUTH_SECRET` | `your-32-char-secret` | Production |
| `NEXTAUTH_URL` | `https://stripebill-romania.vercel.app` | Production |
| `DATABASE_URL` | `postgresql://...` | Production |
| `GOOGLE_CLIENT_ID` | `your-google-id` | Production |
| `GOOGLE_CLIENT_SECRET` | `your-google-secret` | Production |

### **PASUL 2: Google OAuth Setup** 
Dacă folosești Google login:

1. **Google Cloud Console** → API & Services → Credentials
2. **Create OAuth 2.0 Client ID**
3. **Authorized redirect URIs**:
   ```
   https://stripebill-romania.vercel.app/api/auth/callback/google
   ```
4. **Copy Client ID & Secret** → Vercel Environment Variables

---

## 🔧 **Verificări după Deploy**

### **Test 1: NextAuth Config**
Verifică că endpoint-ul funcționează:
```
https://your-app.vercel.app/api/auth/providers
```
Ar trebui să returneze JSON cu provider-ii configurați.

### **Test 2: Login Page**
```
https://your-app.vercel.app/auth/login
```
Pagina de login se încarcă corect.

### **Test 3: Google OAuth** (dacă configurat)
```
https://your-app.vercel.app/api/auth/signin/google
```
Redirect către Google OAuth.

### **Test 4: Session**
După login, verifică:
```
https://your-app.vercel.app/api/auth/session
```
Returnează datele utilizatorului logat.

---

## 🚨 **Probleme Frecvente & Soluții**

### **❌ Error: "Cannot resolve module 'next-auth'"**
**Soluție:** 
```bash
npm install next-auth @auth/prisma-adapter
```

### **❌ Error: "NEXTAUTH_URL missing"**
**Soluție:** Adaugă în Vercel Environment Variables:
```env
NEXTAUTH_URL=https://your-app.vercel.app
```

### **❌ Error: "NEXTAUTH_SECRET missing"**
**Soluție:** Generează și adaugă secret:
```bash
openssl rand -base64 32
```

### **❌ Google OAuth Error: "redirect_uri_mismatch"**
**Soluție:** În Google Cloud Console, adaugă exact:
```
https://your-app.vercel.app/api/auth/callback/google
```

### **❌ Database Connection Error**
**Soluție:** Verifică că `DATABASE_URL` este correct și că Vercel Postgres este configurat.

### **❌ Session not persisting**
**Soluție:** Verifică că:
- `NEXTAUTH_SECRET` este setat
- Cookies sunt permise în browser
- HTTPS este activat în production

---

## 🎯 **Pentru StripeBill Specific**

### **Configurația actuală funcționează cu:**
- ✅ **Credentials login** - email/password
- ✅ **Google OAuth** - sign in cu Google
- ✅ **Database sessions** - Prisma + PostgreSQL
- ✅ **Secure cookies** - HTTPS în production
- ✅ **JWT strategy** - optimizat pentru Vercel

### **Flow complet:**
```
1. User merge la /auth/login
2. Introduce email/password SAU click Google
3. NextAuth verifică credentials
4. Session se salvează în database
5. User e redirectat la /dashboard
6. Middleware verifică session pe toate paginile protejate
```

---

## ✅ **Checklist Final**

**Înainte de deploy:**
- [ ] `NEXTAUTH_SECRET` generat (32+ characters)
- [ ] `NEXTAUTH_URL` setat la URL-ul Vercel
- [ ] `DATABASE_URL` configurat pentru Vercel Postgres
- [ ] Google OAuth configurat (dacă folosești)
- [ ] Toate Environment Variables adăugate în Vercel

**După deploy:**
- [ ] `/api/auth/providers` returnează JSON
- [ ] `/auth/login` se încarcă
- [ ] Login cu email/password funcționează
- [ ] Login cu Google funcționează (dacă configurat)
- [ ] `/dashboard` este accesibil după login
- [ ] Logout funcționează corect

---

## 📞 **Links Utile**

- **NextAuth.js Docs**: https://next-auth.js.org/
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Google OAuth Setup**: https://console.developers.google.com/
- **Prisma Adapter**: https://next-auth.js.org/adapters/prisma

**🇷🇴 NextAuth.js pe Vercel va funcționa perfect pentru StripeBill!**