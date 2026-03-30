FROM node:20-alpine AS base

# Fase 1: Instalar dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Fase 2: Fazer o Build 
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Fase 3: Rodar a aplicação (Imagem final super leve)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/roles.json ./roles.json

EXPOSE 3000

CMD ["node", "server.js"]
