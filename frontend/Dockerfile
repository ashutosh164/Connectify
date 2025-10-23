# Build stage
FROM node:20 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage (serve static files)
FROM node:20
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve

EXPOSE 5173
# CMD ["serve", "-s", "dist", "-l", "5173"]
CMD ["npm", "run", "dev"]

