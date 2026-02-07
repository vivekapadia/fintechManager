FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the specific app
RUN npx nest build

EXPOSE 3000

# Start command for development (handles compilation)
CMD ["npm", "run", "start:dev"]
