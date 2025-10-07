# --- Backend Node + SQLite ---
FROM node:22-slim

WORKDIR /app

# Copie uniquement les fichiers nécessaires pour installer les dépendances
COPY package*.json ./

# Installe les outils pour compiler better-sqlite3 puis les dépendances
RUN apt-get update \
  && apt-get install -y python3 make g++ \
  && npm ci \
  && npm rebuild better-sqlite3 --build-from-source \
  && apt-get remove -y python3 make g++ \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

# Copie du code source
COPY . .

# Création du dossier data pour la base SQLite
RUN mkdir -p /app/data

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Lancement de l'application
CMD ["node", "src/index.js"]
