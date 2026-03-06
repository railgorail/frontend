# Use official Node.js image as the base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package.json .
COPY package-lock.json* .

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port Vite uses
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host"]
