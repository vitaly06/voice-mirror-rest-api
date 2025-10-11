
# Development stage
FROM node:20-alpine AS development

WORKDIR /usr/src/app

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

# Копируем только необходимые файлы
COPY package.json yarn.lock ./
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma
COPY --from=development /usr/src/app/uploads ./uploads

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Создаем необходимые директории и устанавливаем права
RUN mkdir -p uploads storage && chown -R nestjs:nodejs /usr/src/app

USER nestjs

EXPOSE 3000

CMD ["yarn", "start:prod"]