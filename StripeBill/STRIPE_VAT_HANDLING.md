# 🧮 Gestionarea TVA-ului în Stripe - Ghid StripeBill

## 🎯 Problema Frecventă: Dublarea TVA-ului

### ❌ **Problema:**
Mulți utilizatori au prețurile în Stripe **cu TVA inclus** (ex: €121), dar aplicația mai adaugă odată TVA pe factură, rezultând:
- **Stripe**: €121 (cu TVA inclus)  
- **Factură**: €121 + 21% TVA = **€146.41** ❌ **GREȘIT!**

### ✅ **Soluția StripeBill:**
Setarea **"Prețurile din Stripe includ deja TVA?"** gestionează corect ambele scenarii.

---

## 📊 Cum Funcționează

### **Scenariul 1: Prețuri Stripe CU TVA inclus**
```
✅ BIFAT: "Prețurile din Stripe includ deja TVA?"

Stripe payment: €121
↓
StripeBill calculează: 
- Preț fără TVA: €121 ÷ 1.21 = €100
- TVA (21%): €21  
- Total factură: €121 ✅ CORECT
```

### **Scenariul 2: Prețuri Stripe FĂRĂ TVA**
```
❌ NEBIFAT: "Prețurile din Stripe includ deja TVA?"

Stripe payment: €100
↓
StripeBill calculează:
- Preț fără TVA: €100
- TVA (21%): €21
- Total factură: €121 ✅ CORECT  
```

---

## 🔧 Configurare în StripeBill

### **PASUL 1: Verifică prețurile din Stripe**

1. **Mergi la Stripe Dashboard** → Products
2. **Verifică prețurile** - sunt cu sau fără TVA?

**Exemple:**
- €121 pentru serviciu de €100 = **CU TVA inclus** (121 = 100 + 21% TVA)
- €100 pentru serviciu de €100 = **FĂRĂ TVA**

### **PASUL 2: Configurează în StripeBill**

1. **Dashboard** → **Setări** → **Date Companie**
2. **Găsește checkbox-ul**: *"Prețurile din Stripe includ deja TVA?"*
3. **Bifează dacă** prețurile din Stripe includ TVA
4. **Nu bifa dacă** prețurile din Stripe sunt fără TVA
5. **Salvează**

### **PASUL 3: Verifică rezultatul**

**✅ CU TVA inclus (bifat):**
- Indicator albastru: *"Facturile vor afișa prețul din Stripe ca 'cu TVA inclus'"*

**✅ FĂRĂ TVA (nebifat):**
- Indicator portocaliu: *"TVA-ul (21%) se va adăuga la prețul din Stripe"*

---

## 🧮 Exemple Concrete

### **Exemplu 1: SaaS cu prețuri inclusive**

**Configurare Stripe:**
- Produs: "SaaS Pro Plan"  
- Preț: €121/lună (include TVA 21%)

**Configurare StripeBill:**
- ✅ Bifat: "Prețurile din Stripe includ deja TVA?"
- TVA implicit: 21%

**Rezultat pe factură:**
```
Serviciu: SaaS Pro Plan
Preț fără TVA: €100.00
TVA (21%): €21.00
Total: €121.00 ✅ PERFECT
```

### **Exemplu 2: Consultanță cu prețuri exclusive**

**Configurare Stripe:**
- Produs: "Consultanță IT"
- Preț: €100/oră (fără TVA)

**Configurare StripeBill:**
- ❌ Nebifat: "Prețurile din Stripe includ deja TVA?"
- TVA implicit: 21%

**Rezultat pe factură:**
```
Serviciu: Consultanță IT  
Preț fără TVA: €100.00
TVA (21%): €21.00
Total: €121.00 ✅ PERFECT
```

### **Exemplu 3: Restaurant cu TVA redus**

**Configurare Stripe:**
- Produs: "Meniu restaurant"
- Preț: €111 (include TVA 11%)

**Configurare StripeBill:**
- ✅ Bifat: "Prețurile din Stripe includ deja TVA?"
- TVA implicit: 11%

**Rezultat pe factură:**
```
Serviciu: Meniu restaurant
Preț fără TVA: €100.00  
TVA (11%): €11.00
Total: €111.00 ✅ PERFECT
```

---

## ❓ Întrebări Frecvente

### **Q: Cum știu dacă prețurile mele din Stripe au TVA inclus?**
**A:** Verifică în Stripe Dashboard → Products. Dacă €121 pentru serviciu de €100, atunci ai TVA inclus.

### **Q: Ce se întâmplă dacă configurez greșit?**  
**A:** 
- Dacă bifezi greșit → Factură cu TVA prea mic
- Dacă nu bifezi greșit → Factură cu TVA prea mare (dublare)

### **Q: Pot schimba setarea după configurare?**
**A:** Da, oricând în Setări → Date Companie. Schimbarea afectează doar facturile viitoare.

### **Q: Funcționează cu toate cotele TVA?**
**A:** Da, cu toate cotele legale (0%, 11%, 21%). Calculul se face automat.

### **Q: Ce apare pe factură?**
**A:** Pe factură apar întotdeauna:
- Prețul fără TVA  
- TVA-ul calculat
- Totalul final
- Totul conform legislației române

---

## 🚨 Avertismente

### **⚠️ VERIFICĂ ÎNTOTDEAUNA:**
1. **Prețurile din Stripe** - cu sau fără TVA?
2. **Setarea din StripeBill** - corespunde cu Stripe?
3. **Prima factură generată** - suma este corectă?

### **❌ GREȘELI FRECVENTE:**
- Nu verifici prețurile din Stripe înainte de configurare
- Crezi că ai TVA inclus când de fapt nu ai
- Nu testezi cu o plată mică înainte de lansare

### **✅ BEST PRACTICES:**
- **Testează cu €1** înainte de lansare
- **Verifică facturile** la prima utilizare  
- **Documentează** configurația pentru echipă
- **Consultă un contabil** pentru interpretarea legală

---

## 🎯 Rezultatul Final

**✅ StripeBill gestionează corect:**
- Prețuri Stripe cu TVA inclus  
- Prețuri Stripe fără TVA
- Toate cotele legale TVA (0%, 11%, 21%)
- Facturi conforme cu legislația română
- Fără dublarea TVA-ului

**🇷🇴 Facturile generate sunt întotdeauna corecte și conforme ANAF!**