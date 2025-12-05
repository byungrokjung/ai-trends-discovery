# Railway deployment Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/

# Expose port
EXPOSE $PORT

# Start the application using Express server
CMD ["npm", "start"]