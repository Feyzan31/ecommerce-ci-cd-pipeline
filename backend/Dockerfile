# Utilise Node 22 (compatible Vite et moderne)
FROM node:22-alpine

# Dossier de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installe les outils de build nécessaires pour compiler better-sqlite3
# (python3, make, g++) puis installe les dépendances et recompile le module nativement
RUN apk add --no-cache python3 make g++ \
  && npm ci \
  && npm rebuild better-sqlite3 --build-from-source \
  && apk del python3 make g++

# Copie du reste du code de l'application
COPY . .

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=4000

# Exposition du port
EXPOSE 4000

# Commande de démarrage
CMD ["node", "src/index.js"]
