# Sử dụng Node.js làm base image
FROM node:18

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Mở cổng 3000 (hoặc cổng mà frontend sử dụng)
EXPOSE 3000

# Lệnh chạy ứng dụng
CMD ["npm", "run", "dev"]