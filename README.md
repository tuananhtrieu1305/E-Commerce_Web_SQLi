# 🛒 Tech Store Website

Website bán đồ công nghệ gồm ba thành phần: Frontend (React + Vite), Backend (Spring Boot) và Database (MySQL).

## 📂 Cấu trúc dự án


```bash
project-root/
|── frontend/    # React + Vite
|── backend/     # Spring Boot
└── database/    # Database script (.sql)
```

## 🚀 Hướng dẫn cài đặt
1️⃣ Clone dự án
```bash
git clone https://github.com/tuananhtrieu1305/E-Commerce_Web.git
```
2️⃣ Cài đặt Ollama + Model phi3:mini

Cài Ollama tại: [Ollama](https://ollama.com/)

Tải model:
```bash
ollama pull phi3:mini
```
3️⃣ Thiết lập MySQL Database

B1: Mở MySQL Workbench

B2: Chọn Server → Data Import

B3: Import file:
```bash
database/database.sql
```
B4: Đảm bảo MySQL chạy ở cổng 80 (localhost:80)

4️⃣ Chạy Backend (Spring Boot)

Mở thư mục backend
```bash
cd backend
```
Cài dependencies

IntelliJ IDEA sẽ tự tải, hoặc tự chạy:
```bash
mvn clean install
```
Cấu hình application.properties.uat
```bash
spring.datasource.url=jdbc:mysql://localhost:80/<database_name>
spring.datasource.username=root
spring.datasource.password=<your_password>
```
Chạy project

Chạy file:
```bash
src/main/java/.../ProjectApplication.java
```
5️⃣ Chạy Frontend (React + Vite)
```bash
cd ../frontend
npm install
npm run dev
```
## 🎉 Hoàn tất

Dự án gồm frontend + backend + database + AI model đã chạy đầy đủ trên máy bạn.

## ℹ️ Chi tiết dự án

Chi tiết dự án vui lòng tham khảo trong báo cáo tại [đây](https://drive.google.com/uc?export=download&id=1YEc06GDoh3Ez3qjNSXSq-O7JkYZHomzl)
