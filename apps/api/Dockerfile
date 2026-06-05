FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/api/prisma apps/api/prisma

RUN npm ci

COPY apps/api apps/api

RUN npm run build -w apps/api

EXPOSE 4000

CMD ["npm", "run", "start", "-w", "apps/api"]
