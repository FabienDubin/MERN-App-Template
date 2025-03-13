FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Vérifier si Vite est installé globalement
RUN npm list -g vite || echo "Vite n'est pas installé"