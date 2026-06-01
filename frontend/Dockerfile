# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY vite.config.js .
COPY index.html .
COPY src ./src
RUN npm ci
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
