
# Development stage
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Устанавливаем базовые системные зависимости
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg

# Устанавливаем Nest CLI глобально
RUN yarn global add @nestjs/cli

# Копируем файлы зависимостей
COPY package.json yarn.lock ./

# Устанавливаем зависимости
RUN yarn install

# Копируем остальные файлы
COPY . .

# Создаем необходимые директории
RUN mkdir -p uploads storage

# Генерируем Prisma Client
RUN yarn prisma generate

# Собираем приложение
RUN yarn build

# Production stage
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Устанавливаем только необходимые системные зависимости для продакшена
RUN apk add --no-cache \
    ffmpeg

# Копируем файлы Node.js
COPY package.json yarn.lock ./
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma
COPY --from=development /usr/src/app/uploads ./uploads
RUN pip3 install --no-cache-dir numpy opencv-python librosa scipy

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Создаем необходимые директории и устанавливаем права
RUN mkdir -p uploads storage wav2lip/checkpoints && \
    chown -R nestjs:nodejs /usr/src/app && \
    chmod +x /usr/src/app/wav2lip/inference.py

USER nestjs

EXPOSE 3000

CMD ["yarn", "start:prod"]