# TC-05 Fuzzing Payloads - Syntax Blind Spots

Mục tiêu: chỉ bắn vào các điểm mù cú pháp mà prepared statement không chặn trực tiếp, chủ yếu là `ORDER BY`, `LIMIT`, và tên cột/sort key động.

Target chính cho secure backend: `GET /api/security/sp-search`

Target đối chứng cho vulnerable backend: `GET /api/product?title=...&sortBy=...`

## 1) ORDER BY Mapping / Sort Key

| Case | Payload | Mục tiêu | Kỳ vọng |
|---|---|---|---|
| TC-05-01 | `sortBy=price_asc` | baseline hợp lệ | LOW |
| TC-05-02 | `sortBy=price_desc` | baseline hợp lệ | LOW |
| TC-05-03 | `sortBy=name_asc` | baseline hợp lệ | LOW |
| TC-05-04 | `sortBy=newest` | baseline hợp lệ | LOW |
| TC-05-05 | `sortBy=price_asc, id` | thử chèn thêm cột trong ORDER BY | MEDIUM |
| TC-05-06 | `sortBy=price_asc; DROP TABLE products--` | ORDER BY injection cổ điển | CRITICAL |
| TC-05-07 | `sortBy=CASE WHEN 1=1 THEN p.price END` | thử ép parser chấp nhận biểu thức | CRITICAL |
| TC-05-08 | `sortBy=information_schema` | thử leo sang metadata | CRITICAL |

## 2) LIMIT / Numeric Blind Spot

| Case | Payload | Mục tiêu | Kỳ vọng |
|---|---|---|---|
| TC-05-09 | `limit=1` | baseline hợp lệ | LOW |
| TC-05-10 | `limit=0` | kiểm tra fallback | LOW |
| TC-05-11 | `limit=-1` | kiểm tra xử lý giá trị âm | MEDIUM |
| TC-05-12 | `limit=999999` | kiểm tra giới hạn lớn | MEDIUM |

## 3) Search Text / Comment-style Probes

| Case | Payload | Mục tiêu | Kỳ vọng |
|---|---|---|---|
| TC-05-13 | `title=' UNION SELECT 1,2,3--` | chọc vào pattern SQLi rõ ràng | CRITICAL |
| TC-05-14 | `title=abc' OR '1'='1` | payload cổ điển | CRITICAL |
| TC-05-15 | `title=normal text --` | comment marker nhẹ | MEDIUM |

## 4) Gợi ý cách dùng

Chạy mỗi payload độc lập và ghi lại:
- HTTP status code
- Có bị WAF chặn hay không
- Có log entry mới trong `security_audit_log` hay không
- Severity được gán: `LOW`, `MEDIUM`, `CRITICAL`

Nếu muốn biến file này thành script tự động, có thể bọc danh sách trên vào một test harness gọi lần lượt endpoint `/api/security/sp-search` và `/api/product`.