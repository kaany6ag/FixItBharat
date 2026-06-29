FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/build .
ENV PORT=8080
EXPOSE 8080
CMD ["serve", "-s", ".", "-l", "8080"]
