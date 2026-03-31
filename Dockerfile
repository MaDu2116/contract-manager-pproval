# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace package files
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies
RUN npm install --workspace=server --workspace=client

# Copy source code
COPY server/ ./server/
COPY client/ ./client/

# Generate Prisma client
RUN cd server && npx prisma generate

# Build server
RUN cd server && npm run build

# Build client
RUN cd client && npm run build

# Stage 2: Production
FROM node:18-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY package.json ./
COPY server/package.json ./server/

RUN npm install --workspace=server --production
RUN cd server && npm install tsx

# Copy Prisma schema and seed
COPY server/prisma ./server/prisma/

# Generate Prisma client in production
RUN cd server && npx prisma generate

# Copy built server
COPY --from=builder /app/server/dist ./server/dist/

# Copy built client to serve as static files
COPY --from=builder /app/client/dist ./client/dist/

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]
