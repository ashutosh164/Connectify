FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
ENV ROLLUP_SKIP_NODEJS_NATIVE=1
RUN npm install --force
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
