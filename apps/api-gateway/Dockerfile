FROM node:16.15.0-alpine3.15 AS development
WORKDIR /app
COPY ../../package*.json ./ 
RUN npm install
COPY ../../ ./ 

FROM node:16.15.0-alpine3.15 AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY ../../package*.json ./
RUN npm install --only=production --omit=dev
RUN npm run build api-gateway
# COPY --from=development /app/dist/apps/api-gateway ./dist/apps/api-gateway
CMD ["node", "/app/dist/apps/api-gateway/main"]
