FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Si votre application a besoin d'un fichier SQLite pour démarrer sans planter, 
# vous pouvez créer un fichier vide de placeholder ici.
# Si SQLite crée le fichier s'il n'existe pas, cette étape est optionnelle.
# RUN touch database.sqlite 

COPY . .
EXPOSE 4000

# CMD recommandé pour Node.js en production :
# Utilise la forme exec pour lancer Node directement. 
# Remplacez 'index.js' si votre script de démarrage est différent.
# Si votre 'package.json' start est "node index.js", vous pouvez l'utiliser directement.
# Si votre 'package.json' start est "npm run start", utilisez la ligne ci-dessous :
CMD ["npm", "run", "start"]
# Alternative (préférée) : CMD ["node", "index.js"]