# Railway deployment Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create a simple start script
RUN echo '#!/bin/sh\nexec npm run preview -- --host 0.0.0.0 --port ${PORT:-4173}' > start.sh && \
    chmod +x start.sh

# Expose port
EXPOSE ${PORT:-4173}

# Start the application
CMD ["./start.sh"]