#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const required = [
  { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', desc: 'Clerk publishable key (client)' },
  { key: 'CLERK_SECRET_KEY', desc: 'Clerk secret key (server)' },
  { key: 'DATABASE_URL', desc: 'Postgres DATABASE_URL' },
  { key: 'JWT_SECRET', desc: 'JWT secret for tokens' },
  { key: 'VERCEL_TOKEN', desc: 'Vercel API token for Blob presign' }
]

console.log('\nChecking environment variables (.env.local + process.env)\n')

let missing = []
for (const r of required) {
  const val = process.env[r.key]
  if (!val) {
    missing.push(r)
    console.log(`✖ ${r.key} — MISSING — ${r.desc}`)
  } else {
    const safe = r.key.includes('KEY') || r.key.includes('SECRET') || r.key.includes('TOKEN')
    console.log(`✓ ${r.key} — OK${safe ? ' (hidden)' : ''}`)
  }
}

console.log('\nSummary:')
if (missing.length === 0) {
  console.log('All required environment variables are present.')
  process.exit(0)
} else {
  console.log(`${missing.length} required variable(s) missing:`)
  missing.forEach(m => console.log(` - ${m.key}: ${m.desc}`))
  console.log('\nPlease copy env.local.example to .env.local and fill the missing keys, or set them in your deployment environment.')
  process.exit(2)
}
