# frontend/Dockerfile
FROM node:18-alpine

# Устанавливаем http-server
RUN npm install -g http-server

# Копируем все файлы внутрь контейнера
WORKDIR /app
COPY . .

# Открываем порт
EXPOSE 8081

# Запускаем сервер
CMD ["http-server", ".", "-p", "8585"]
