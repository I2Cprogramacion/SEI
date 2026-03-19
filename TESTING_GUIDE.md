# 🧪 Testing Guide - Admin Access Solution

## Quick Test (5 minutes)

### Test 1: Admin Access Works Instantly

**Setup:**
- Make sure you have a user with `es_admin=true` in BD

**Test:**
```bash
# In your browser console while logged in as admin:
fetch('/api/auth/verify-admin')
  .then(r => r.json())
  .then(console.log)
```

**Expected Output:**
```json
{
  "tieneAcceso": true,
  "esAdmin": true,
  "esEvaluador": false,
  "source": "clerk",
  "usuario": { "id": "...", "email": "...", "nombre": "..." }
}
```

**Verify:**
- Response time: < 100ms ✅
- No errors ✅

---

### Test 2: Admin Panel Access

**Test:**
1. Log in as admin user
2. Navigate to `https://yourapp.com/admin`

**Expected:**
- Page loads instantly (< 1 second) ✅
- No errors in console ✅
- Dashboard visible ✅

**Verify:**
- No 403 redirects ✅
- No 500 errors ✅
- Fast load ✅

---

### Test 3: Non-Admin Gets Denied

**Setup:**
- Log in as user with `es_admin=false`

**Test:**
1. Try to visit `/admin`

**Expected:**
- Immediately redirected to `/dashboard` ✅
- No error page ✅

**Verify:**
- Check response status in Network tab: 302/307 (redirect) ✅

---

## Detailed Testing (15 minutes)

### Test 4: Update Admin Status

**Setup:**
- You must be admin
- Have another user ID ready

**Test:**
```bash
curl -X POST https://yourapp.com/api/admin/update-investigador \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "investigadorId": "some-user-id",
    "es_admin": true,
    "es_evaluador": false
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Investigador actualizado y sincronizado",
  "investigador": {
    "id": "...",
    "nombre": "...",
    "correo": "...",
    "es_admin": true,
    "es_evaluador": false
  }
}
```

**Verify:**
- Status 200 ✅
- `success: true` ✅
- Clerk was updated (check Clerk dashboard) ✅

---

### Test 5: New Admin Can Access Panel

**After Test 4:**

1. Log out
2. Log in as the user you just made admin
3. Visit `/admin`

**Expected:**
- Access granted immediately ✅
- Dashboard loads ✅
- No 403 errors ✅

**Verify:**
- User can see admin sidebar ✅
- Can navigate to other admin pages ✅

---

### Test 6: Force Sync Endpoint

**Setup:**
- Be logged in as admin
- Have a user ID

**Test:**
```bash
curl -X POST https://yourapp.com/api/admin/sync-investigador-clerk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "investigadorId": "some-user-id"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Investigador sincronizado a Clerk",
  "investigador": { ... }
}
```

**Verify:**
- Status 200 ✅
- `success: true` ✅

---

## Performance Testing (10 minutes)

### Test 7: Response Time

**Test:**
1. Open DevTools (F12)
2. Go to Network tab
3. Log in as admin
4. Visit `/admin`
5. Check timing of `/api/auth/verify-admin` request

**Expected:**
- Time < 100ms ✅
- Most of it is network latency ✅
- No spinning/loading delays ✅

---

### Test 8: Load Admin Pages

**Test:**
1. In admin panel, click through pages:
   - Dashboard
   - Investigadores
   - Publicaciones
   - Proyectos

**Expected:**
- All load instantly ✅
- No verify-admin errors ✅
- Page-specific data loads normally ✅

---

## Troubleshooting Tests

### Test 9: What if verify-admin returns 403?

**If you see 403:**
```json
{
  "tieneAcceso": false,
  "esAdmin": false,
  "error": "No tienes permisos de administrador"
}
```

**Debug steps:**

1. Check BD:
```sql
SELECT es_admin FROM investigadores 
WHERE correo = 'your-email@example.com';
```

If returns `true`:
2. Force sync:
```bash
POST /api/admin/sync-investigador-clerk
```

3. Check Clerk claims in console:
```javascript
// After login, in console:
fetch('https://api.clerk.com/v1/me', {
  headers: { 'Authorization': 'Bearer YOUR_SESSION_TOKEN' }
})
.then(r => r.json())
.then(d => console.log(d.public_metadata))
```

---

### Test 10: What if verify-admin times out?

**If request hangs:**

1. Check browser Network tab - is request pending?
2. Check server logs for errors
3. Verify `CLERK_SECRET_KEY` is set in Vercel
4. Check Clerk API status at https://status.clerk.com/

---

## Automated Testing (Optional)

### Create a Test Script

```typescript
// test-admin-access.ts
async function testAdminAccess() {
  console.log('Testing admin access...')
  
  // Test 1: verify-admin endpoint
  const result = await fetch('/api/auth/verify-admin')
  const data = await result.json()
  
  if (!result.ok || !data.tieneAcceso) {
    console.error('❌ Admin access FAILED')
    return false
  }
  
  console.log('✅ Admin access works')
  
  // Test 2: Check response time
  const start = performance.now()
  await fetch('/api/auth/verify-admin')
  const duration = performance.now() - start
  
  if (duration > 100) {
    console.warn(`⚠️ Slow response: ${duration}ms`)
  } else {
    console.log(`✅ Fast response: ${duration}ms`)
  }
  
  return true
}

// Run test
testAdminAccess().then(success => {
  console.log(success ? '🎉 All tests passed!' : '❌ Tests failed')
})
```

---

## Checklist

- [ ] verify-admin endpoint responds < 100ms
- [ ] Admin can access `/admin` without redirect
- [ ] Non-admin gets redirected from `/admin`
- [ ] Update endpoint works (201 response)
- [ ] Updated user can access admin panel immediately
- [ ] Force sync endpoint works
- [ ] All admin pages load without errors
- [ ] No DB query timeouts
- [ ] No 500 errors
- [ ] Clerk claims are set correctly

---

## Success Criteria

If ALL of these are true, the solution is working:

✅ Admin access time < 100ms  
✅ No DB queries in admin verification  
✅ Automatic sync when status changes  
✅ Instant access after privilege change  
✅ No connection errors or timeouts  
✅ All admin pages accessible  

---

## Rollback (if needed)

If something breaks, you can rollback to the old endpoint:

1. Revert to previous commit:
```bash
git revert HEAD~3
```

2. Force push:
```bash
git push origin main -f
```

But this shouldn't be needed - the new solution is more reliable!

---

## Questions?

If tests fail:
1. Check [ADMIN_ACCESS_SOLUTION.md](./ADMIN_ACCESS_SOLUTION.md)
2. Check [docs/ADMIN_VERIFICATION_CLERK.md](./docs/ADMIN_VERIFICATION_CLERK.md)
3. Check server logs for errors
4. Verify environment variables in Vercel

Good luck! 🚀
