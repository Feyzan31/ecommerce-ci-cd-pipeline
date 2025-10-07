# ---- Build (Vite/React) ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime (Nginx) ----
FROM nginx:1.27-alpine
# Copie du build statique
COPY --from=build /app/dist /usr/share/nginx/html
# Configuration par défaut suffit pour un SPA simple. Sinon, ajouter une conf custom.
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]