FROM node:18-alpine

WORKDIR /app

RUN npm install express node-fetch

# Copia o arquivo com a nova extensão
COPY server.mjs .

EXPOSE 8099

# Executa o arquivo .mjs
CMD [ "node", "server.mjs" ]

