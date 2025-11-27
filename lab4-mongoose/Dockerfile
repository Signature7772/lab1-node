# Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Копіюємо тільки package.json спочатку для кешування npm install
COPY package*.json ./

RUN npm install --production

# Копіюємо решту файлів
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]