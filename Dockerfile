FROM node:22-alpine AS builder
ARG BUILD_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=${BUILD_ENV}

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/ProyectoVouchFE/server/server.mjs"]
