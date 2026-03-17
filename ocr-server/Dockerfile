# Multi-stage build para optimizar tamaño de imagen
# Etapa 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./

# Instalar dependencias (incluyendo dev si existen)
RUN npm ci --only=production

# Etapa 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalación de dependencias del sistema necesarias para Tesseract.js
# Tesseract necesita libc, libstdc++, etc.
RUN apk add --no-cache \
    libstdc++ \
    g++ \
    make \
    python3 \
    ca-certificates

# Copiar node_modules desde builder (optimización de tamaño)
COPY --from=builder /app/node_modules ./node_modules

# Copiar código de la aplicación
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8001) + '/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Variables de entorno predeterminadas
ENV NODE_ENV=production
ENV PORT=8001

# Exponer puerto
EXPOSE 8001

# Comando de inicio
CMD ["node", "server.js"]
