# Use Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install
RUN npm install -g nodemon

# Copy the rest of the code
COPY . .

# Expose the app port
EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]