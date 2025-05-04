# Build stage
FROM node:18 as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve bằng một static server (vd: serve)
FROM node:18-slim
WORKDIR /app

RUN npm install -g serve
COPY --from=build /app/dist ./dist

# Render set biến môi trường PORT, app phải lắng nghe cổng đó
ENV PORT 3000
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "0.0.0.0:$PORT"]
