FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy source code
COPY frontend ./frontend
COPY backend ./backend

# Build frontend
RUN cd frontend && npm run build

# Copy frontend build to backend
RUN mkdir -p backend/frontend-dist && cp -r frontend/dist/* backend/frontend-dist/

# Generate Prisma client and build backend
RUN cd backend && npx prisma generate && npx tsc

WORKDIR /app/backend

EXPOSE 8080

CMD ["npm", "run", "start"]
