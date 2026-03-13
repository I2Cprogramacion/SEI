# ⚡ Referencia Rápida - Quick Fix Guide

## 🔴 Errors & Quick Fixes

### Feature Policy Warnings (Clerk)
```
❌ Feature Policy: Saltándose "keyboard-map"
```
**Fix:** Ctrl+Shift+R (Hard refresh)  
**Why:** Navegador en caché, Clerk usa Feature-Policy internamente

---

### Clerk Props Deprecated
```
❌ "afterSignInUrl" is deprecated
```
**Status:** ✅ FIXED  
**File:** `app/layout.tsx`  
**Deploy:** Needed

---

### Cookie __cf_bm Partitioned
```
❌ Cookie "particionada" faltante
```
**Status:** ⚠️ Cloudflare side  
**Action:** Configure in Cloudflare Dashboard  
**Workaround:** Modern browsers auto-partition

---

### User Not Loaded
```
❌ Clerk: user no está cargado todavía
```
**Status:** ✅ FIXED  
**File:** `app/dashboard/page.tsx`  
**Deploy:** Needed

---

### Perfil No Encontrado
```
❌ No se encontraron datos de tu perfil en la base de datos
```
**Solutions:**
1. **Quick:** Reregister at `/registro`
2. **Admin:** Run SQL from `docs/SQL-DIAGNOSTICO-PERFILES.sql`

---

## 📋 Deployment Checklist

- [ ] `git pull origin main`
- [ ] Verify commits:
  - [ ] `5b4ed7d` - Feature-Policy & cookies
  - [ ] `04fbbcc` - Clerk warnings & profiles
  - [ ] `f5ef9dc` - Documentation
- [ ] Railway/Vercel redeploys automatically
- [ ] Hard refresh: Ctrl+Shift+R
- [ ] Test login/register flow
- [ ] Check F12 console for errors

---

## 🔍 Quick Diagnostics

### Check Headers
```javascript
// Browser F12 Console
fetch('/').then(r => {
  console.log('Permissions-Policy:', r.headers.get('Permissions-Policy'))
  console.log('X-Content-Type-Options:', r.headers.get('X-Content-Type-Options'))
})
```

### Check Clerk Loading
```javascript
// Browser F12 Console
// Buscar en Network tab: "auth"
// Debería decir: loaded ✅
```

### Check Profile Loading
```javascript
// Browser F12 Console
// Ir a /dashboard
// Buscar en console:
// "🔄 [Dashboard] Iniciando carga del perfil..."
// Esperar por "✅" o "❌"
```

---

## 🗄️ Quick SQL Checks

### User exists?
```sql
SELECT * FROM investigadores 
WHERE LOWER(correo) = 'email@example.com' LIMIT 1;
```

### User problems?
```sql
-- Run all diagnostics
-- See: docs/SQL-DIAGNOSTICO-PERFILES.sql
```

---

## 📞 Quick Support

| Issue | Action | Time |
|-------|--------|------|
| Feature-Policy warnings | Ctrl+Shift+R | Immediate |
| Clerk warnings | Deploy changes | 2-5 min |
| Cookie warning | Cloudflare config | Days |
| Perfil no encontrado | SQL diagnóstico | Minutes |
| Other | See docs/ | Varies |

---

## 📁 Documentation Index

```
docs/
├── CORRECCIONES-APLICADAS.md ............. Initial fixes summary
├── TROUBLESHOOTING-PERFILES.md .......... Complete troubleshooting
├── SQL-DIAGNOSTICO-PERFILES.sql ........ 11 SQL diagnostic queries
├── RESUMEN-FINAL-SOLUCIONES.md ......... Full solution summary
└── QUICK-FIX-GUIDE.md ................. This file
```

---

## 🚀 Deploy Command

```bash
# Local
git pull origin main
npm run build
npm run test

# Automatic via Railway/Vercel
# Just push to main branch
git push origin main
```

---

## ✅ Post-Deploy Verification

1. **Immediate (1 min)**
   - [ ] F12 → Console → No major errors
   - [ ] Clerk loads ✅
   - [ ] Headers show Permissions-Policy ✅

2. **5 minutes**
   - [ ] Can login at `/iniciar-sesion`
   - [ ] Can register at `/registro`
   - [ ] Dashboard loads `/dashboard`

3. **Within day**
   - [ ] Monitor logs for errors
   - [ ] Check new user registrations
   - [ ] Test OCR upload flow

---

## 🎯 Know Your Commits

| Hash | Message | Deploy? |
|------|---------|---------|
| `5b4ed7d` | Feature-Policy, BD, cookies | YES |
| `04fbbcc` | Clerk warnings, profiles | YES |
| `f5ef9dc` | Documentation | NO (docs only) |

---

## ⏱️ Timing Expectations

| Action | Time | Notes |
|--------|------|-------|
| Build | 2-3 min | Railway/Vercel |
| Deploy | 1-2 min | Redirect traffic |
| Cache clear | 1-5 min | Browser hardrefresh |
| **Total** | **5-10 min** | Full deployment |

---

## 🆘 Emergency Rollback

If something breaks:

```bash
# Revert to last known good
git revert HEAD~2
git push origin main

# Then deploy again
# Railway/Vercel auto-redeploy
```

---

**Last Updated:** March 13, 2026  
**Status:** ✅ All Changes Ready for Deploy  
**Next Action:** Run `git push origin main`
