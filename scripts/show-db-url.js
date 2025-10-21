// Script simple para mostrar la DATABASE_URL desde las mismas variables que usa Next.js
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'No configurada')
console.log('POSTGRES_URL:', process.env.POSTGRES_URL || 'No configurada')
console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL || 'No configurada')


