FROM node:20-alpine

WORKDIR /app

# Instalamos o express apenas
RUN npm install express

COPY server.mjs .

EXPOSE 8099

CMD [ "node", "server.mjs" ]
