FROM node:18

WORKDIR /app

# Only copy package.json (since package-lock.json is missing)
COPY package.json ./

# Use npm install instead of npm ci
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
# CMD npm run dev