# Railway deployment Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set build-time environment variables
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_OPENAI_API_KEY
ARG VITE_HUGGINGFACE_TOKEN
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_APP_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY
ENV VITE_HUGGINGFACE_TOKEN=$VITE_HUGGINGFACE_TOKEN
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_APP_URL=$VITE_APP_URL

# Build the application with environment variables
RUN npm run build

# Verify build output
RUN ls -la dist/

# Expose port
EXPOSE $PORT

# Start the application using Express server
CMD ["npm", "start"]