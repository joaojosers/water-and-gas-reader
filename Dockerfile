# Usando a imagem base do Node.js
FROM node:16

# Definir o diretório de trabalho
WORKDIR /usr/src/app

# Copiar arquivos package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código para o diretório de trabalho
COPY . .

# Compilar o TypeScript
RUN npm run build

# Expor a porta da aplicação
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
