# Stage 1: Build the Angular application (including SSR)
FROM node:20-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
# Run the build command as defined in package.json, which should handle SSR
RUN npm run build --configuration=production

# Stage 2: Serve the application with Node.js (SSR)
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json for runtime dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev # Install only production dependencies

# Copy the entire built application directory from the builder stage
# This should include both 'browser' and 'server' subdirectories
COPY --from=builder /app/dist/sigiv-web-ui /app/dist/sigiv-web-ui

# Default port for Angular SSR
EXPOSE 4000

CMD ["npm", "run", "serve:ssr:sigiv-web-ui"]
