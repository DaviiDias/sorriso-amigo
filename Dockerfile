FROM node:20-alpine

WORKDIR /app/server

COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/src ./src
COPY server/scripts ./scripts
COPY server/sql ./sql

WORKDIR /app
COPY code ./code

WORKDIR /app/server

EXPOSE 4000

CMD ["sh", "-c", "npm run db:init && npm start"]