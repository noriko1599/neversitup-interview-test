# ---- Base Node ----
FROM node:16-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies  
COPY package*.json ./
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 

# ---- Copy Files/Build ----
FROM dependencies AS build  
WORKDIR /app
COPY . /app
RUN npm run build

# --- Release with Alpine ----
FROM node:16-alpine AS release  
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["node", "dist/main"]
