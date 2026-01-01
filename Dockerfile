FROM node:18-alpine

WORKDIR /app

# Instala o servidor web Express
RUN npm install express

# Copia o seu arquivo de código para dentro do addon
COPY server.js .

# Expõe a porta de acesso
EXPOSE 8099

# Comando para ligar o servidor
CMD [ "node", "server.js" ]