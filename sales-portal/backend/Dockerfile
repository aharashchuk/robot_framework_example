FROM node:18

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json отдельно для кэширования
COPY package*.json ./

# Устанавливаем зависимости внутри контейнера
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Собираем TypeScript
RUN npm run build

# Указываем порт
EXPOSE 5000

# Запускаем приложение
CMD ["npm", "run", "start"]
