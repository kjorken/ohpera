FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
