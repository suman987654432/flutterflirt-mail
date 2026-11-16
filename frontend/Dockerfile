FROM node:20-alpine AS builder

WORKDIR /app

ENV IS_DOCKER=true
ENV NEXT_PUBLIC_API_URL=http://backend:8080

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV IS_DOCKER=true
ENV NEXT_PUBLIC_API_URL=http://backend:8080

# Copy standalone build and static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
