# Utilise Node 22 basé sur Debian (plus complet pour compiler les modules natifs)
FROM node:22-slim

WORKDIR /app

# Copie des dépendances
COPY package*.json ./

# Installe les dépendances système nécessaires à better-sqlite3
RUN apt-get update \
  && apt-get install -y python3 make g++ \
  && npm ci \
  && npm rebuild better-sqlite3 --build-from-source \
  && apt-get remove -y python3 make g++ \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

# Copie du code
COPY . .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "src/index.js"]
