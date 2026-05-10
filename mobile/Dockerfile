FROM node:20-alpine

WORKDIR /app

# Instalar dependencias globales de expo
RUN npm install -g expo-cli

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puertos necesarios para Expo/Metro
# 8081: Metro Bundler
# 19000: Expo Packager
# 19001: Expo Server
# 19002: Expo DevTools (opcional)
EXPOSE 8081 19000 19001 19002

# Comando para iniciar expo en modo túnel o LAN
# Usamos --tunnel si queremos acceso externo fácil, o simplemente iniciamos
CMD ["npx", "expo", "start", "--web"]
