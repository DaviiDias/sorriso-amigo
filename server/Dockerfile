FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/src ./src
COPY server/scripts ./scripts
COPY server/sql ./sql
COPY code /code

EXPOSE 4000

CMD ["npm", "start"]
