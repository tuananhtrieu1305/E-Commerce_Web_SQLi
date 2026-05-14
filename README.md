# 🛒 E-Commerce Web Security Demo

Website bán hàng công nghệ được thiết kế theo mô hình **A/B Testing** nhằm đối chứng và kiểm chứng hiệu quả của phương pháp phòng chống SQL Injection thông qua **Database-Level Defense Layer** (Bảo mật 2 lớp).

Hệ thống cung cấp sẵn hai phiên bản Backend chạy song song:
1. **Vulnerable Backend:** Code bị cố tình để lọt lỗ hổng bảo mật, nối chuỗi SQL trực tiếp, sử dụng tài khoản Database `root`.
2. **Secure Backend:** Áp dụng "Defense-in-Depth". Sử dụng prepared statements (JPA/Hibernate kết hợp Stored Procedures), phân quyền nguyên tắc tối thiểu (`app_secure` least privilege user) và các ràng buộc dữ liệu trực tiếp tại MySQL (Check Constraints, Triggers, Views).

---

## 📂 Cấu trúc dự án

```bash
project-root/
├── frontend/             # React + Vite (Cổng giao tiếp UI)
├── backend-vulnerable/   # Spring Boot (Chứa lỗ hổng SQLi) - Port 8081
├── backend-secure/       # Spring Boot (Bảo mật 2 lớp) - Port 8082
├── database/             # Scripts khởi tạo cấu trúc và dữ liệu cho DB
│   └── init/             # Chứa các file SQL tạo Views, Triggers, Procedures, Users
├── docker-compose.yml    # File cấu hình môi trường Docker
└── .env                  # Cấu hình biến môi trường
```

---

## 🚀 Hướng dẫn cài đặt và khởi chạy (Với Docker)

Dự án đã được "Docker hóa" (containerization) hoàn toàn, bạn **không cần** cài đặt Java, Node.js hay MySQL trên máy thật.

### Yêu cầu tiên quyết:
- Đã cài đặt [Docker](https://docs.docker.com/get-docker/) và Docker Compose trên máy.
- Đã cài đặt Git.

### Bước 1: Clone dự án
```bash
git clone https://github.com/tuananhtrieu1305/E-Commerce_Web.git
cd E-Commerce_Web
```

### Bước 2: Khởi chạy toàn bộ hệ thống
Mở terminal tại thư mục gốc của dự án (`project-root`) và chạy lệnh sau:
```bash
docker compose up -d
```
Lệnh này sẽ tự động:
- Khởi tạo Database MySQL và tự động chạy các script phân quyền, tạo dữ liệu mẫu.
- Build và chạy `backend-vulnerable` (Cổng 8081).
- Build và chạy `backend-secure` (Cổng 8082).
- Build và chạy `frontend` (Cổng 5173).

*Lưu ý: Quá trình pull images và build ở lần đầu tiên có thể mất vài phút.*

### Bước 3: Truy cập ứng dụng
Sau khi các container báo trạng thái `Healthy/Started`, bạn truy cập vào Frontend qua trình duyệt:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔄 Cách chuyển đổi (Switch) giữa hai chế độ test

Mặc định, Frontend sẽ gọi API tới **Secure Backend** (Cổng 8082). Để đối chứng và test các lỗ hổng trên **Vulnerable Backend** (Cổng 8081), bạn làm như sau:

1. Mở file `.env` ở thư mục gốc của dự án.
2. Sửa biến `VITE_BACKEND_URL`:
   - Để dùng bản **bảo mật**: `VITE_BACKEND_URL=http://localhost:8082`
   - Để dùng bản **cố tình để hổng**: `VITE_BACKEND_URL=http://localhost:8081`
3. Cập nhật lại cấu hình cho Frontend container mà không cần build lại:
```bash
docker compose up -d
```
4. F5 lại trình duyệt và tiến hành test các payload SQL Injection.

---

## 🛑 Cách dừng ứng dụng

Để tắt hệ thống và dừng các container, chạy lệnh:
```bash
docker compose down
```

Nếu muốn xóa toàn bộ cả database để lần sau hệ thống tự tạo mới lại dữ liệu từ đầu, thêm cờ `-v`:
```bash
docker compose down -v
```

---

## ℹ️ Tài liệu tham khảo

Chi tiết về thiết kế kiến trúc, các lỗi đã fix và cách hệ thống phòng chống Data Manipulation ở tầng Database vui lòng tham khảo **Báo cáo Đồ án** của dự án.
