FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY apps/api/package*.json ./

RUN npm install

# Copy source code and Prisma schema
COPY apps/api .
COPY packages/database/prisma/schema.prisma ./prisma/schema.prisma

# Generate Prisma Client
RUN npx prisma generate

# Build the specific app
RUN npx nest build

EXPOSE 3000

# Start command for development (handles compilation)
CMD ["npm", "run", "start:dev"]
