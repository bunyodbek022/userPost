FROM node:22-alpine
RUN npm install -g pnpm
WORKDIR /app

# Keshni optimallashtirish uchun avval lock fayllar
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Kodni nusxalash va build
COPY . .
RUN pnpm build

EXPOSE 3000
# NestJS'da start:prod buyrug'i (yoki o'zingizda pnpm start:prod bo'lsa)
CMD ["pnpm", "run", "start:prod"]