# Báo Cáo Kỹ Thuật: Module Bảo Mật Cơ Sở Dữ Liệu — "Database-as-a-Fortress"

> **Dự án:** Hệ thống E-Commerce Demo — So sánh Backend Bảo mật và Backend Dễ bị tấn công  
> **Module:** Lớp phòng thủ tại tầng cơ sở dữ liệu (Database-Level Defense Layer)  
> **Phạm vi:** `e_commerce_secure` — Áp dụng độc lập, không ảnh hưởng DB vulnerable

---

## 1. Bối Cảnh và Vấn Đề

Trong kiến trúc ứng dụng web thông thường, lớp bảo mật thường chỉ được xây dựng ở tầng ứng dụng (Application Layer): kiểm tra JWT, validate input, sử dụng Prepared Statements. Tuy nhiên, nếu tầng ứng dụng bị xâm phạm (ví dụ: kẻ tấn công chiếm được shell của backend container), toàn bộ dữ liệu trong cơ sở dữ liệu vẫn có thể bị đọc, sửa, hoặc leo thang đặc quyền thông qua các truy vấn SQL trực tiếp.

Module **"Database-as-a-Fortress"** giải quyết vấn đề này bằng cách xây dựng **ba lớp phòng thủ độc lập ngay tại tầng DB**, hoạt động kể cả khi backend bị bypass hoàn toàn.

---

## 2. Công Nghệ Thế Giới Đang Sử Dụng

### 2.1 MySQL Enterprise Firewall (SQL Allowlist)

Các doanh nghiệp lớn sử dụng **MySQL Enterprise Firewall** — một tính năng có trong bản thương mại MySQL Enterprise Edition — để bảo vệ DB khỏi các luồng truy vấn bất hợp pháp. Cơ chế hoạt động gồm hai giai đoạn:

1. **Giai đoạn học (Recording Mode):** Firewall "học" tất cả các truy vấn hợp lệ mà ứng dụng gửi lên trong môi trường staging, tạo thành một _allowlist_ (danh sách trắng) các query pattern được phép.
2. **Giai đoạn bảo vệ (Protecting Mode):** Mọi truy vấn không khớp với allowlist đều bị từ chối ngay tại DB, trước khi được thực thi.

### 2.2 Stored Procedures với DEFINER=root

Song song với Enterprise Firewall, các tổ chức thường sử dụng **Stored Procedures (SP)** như một lớp trung gian giao tiếp. Thay vì cho phép ứng dụng gửi truy vấn SQL tùy ý, ứng dụng chỉ được gọi các SP đã định nghĩa sẵn. SP thường được tạo với quyền `DEFINER=root` hoặc `DEFINER=db_admin`, nghĩa là SP chạy với đặc quyền của người tạo ra nó — thường là tài khoản DB có toàn quyền.

---

## 3. Nhược Điểm của Cách Tiếp Cận Hiện Tại

| Vấn đề                       | Mô tả                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chi phí**                  | MySQL Enterprise Firewall chỉ có trong bản thương mại, không phù hợp với dự án vừa và nhỏ sử dụng MySQL Community/MariaDB                                                 |
| **False Positive**           | Nếu quá trình "học" thiếu sót (thiếu một số query hiếm gặp), Firewall sẽ chặn cả truy vấn hợp lệ trong production — gây gián đoạn dịch vụ                                 |
| **Rủi ro DEFINER=root**      | Khi SP chạy với quyền root, nếu kẻ tấn công chiếm được backend và có thể gọi SP, hoặc khai thác lỗ hổng logic trong SP, chúng vẫn có đặc quyền root trên toàn bộ DB       |
| **Leo thang đặc quyền**      | Với quyền `UPDATE` trực tiếp trên bảng `accounts`, một backend bị chiếm quyền có thể thực thi `UPDATE accounts SET role='ADMIN' WHERE id=123` để tự thăng cấp thành admin |
| **Thiếu lớp phòng thủ cuối** | Nếu bypass được ứng dụng (RCE, SSRF, SQL injection chuỗi), không có cơ chế nào ở tầng DB ngăn chặn truy vấn độc hại                                                       |

---

## 4. Đóng Góp Mới — Ba Lớp Phòng Thủ Tầng DB

Nhóm đề xuất và triển khai một kiến trúc phòng thủ ba lớp hoàn toàn không yêu cầu bản Enterprise, tận dụng các tính năng có sẵn trong MySQL 8.0 Community:

```
┌─────────────────────────────────────────────────────────┐
│                   Backend Application                    │
│              (Spring Boot — app_secure user)             │
└──────────────────────────┬──────────────────────────────┘
                           │ Chỉ có quyền SELECT/INSERT/UPDATE
                           │ trên v_* views + EXECUTE on SPs
                           │ Không có DELETE — Soft Delete qua UPDATE
                           ▼
┌─────────────────────────────────────────────────────────┐
│           LAYER 1: DB-side SQL Allowlist Gateway        │
│   13 Updatable Views (SECURITY DEFINER sp_definer)      │
│   v_accounts_public: ẨN password_hash (Data Masking)    │
│   ✗ SELECT * FROM accounts  → Access Denied             │
│   ✓ SELECT * FROM v_accounts_public → An toàn           │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│         LAYER 2: Stored Object Security                 │
│   SPs chạy với DEFINER=sp_definer (không phải root)     │
│   sp_authenticate_account: xử lý password nội bộ       │
│   Triggers validate input độc lập với backend           │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│     LAYER 3: Dual-Layer Privilege Escalation Prevention │
│   Trigger trg_audit_role_change kiểm tra CURRENT_USER() │
│   app_secure cố UPDATE role → severity='CRITICAL'       │
│                           → SIGNAL SQLSTATE '45000'     │
│   Admin thực hiện → severity='LOW' → ghi log bình thường│
└─────────────────────────────────────────────────────────┘
```

### 4.1 Lớp 1: DB-side SQL Allowlist Gateway — Updatable Views với Virtual Data Masking

**Ý tưởng cốt lõi:** Thay vì dùng Enterprise Firewall để "học" và chặn query, nhóm xây dựng một _Gateway Tất định (Deterministic Gateway)_ bằng cách sử dụng **13 Updatable View 1-to-1** ánh xạ trực tiếp lên 13 bảng gốc. User `app_secure` (user mà backend sử dụng) **không có bất kỳ đặc quyền nào trên bảng gốc** — chỉ được phép thao tác qua các view này.

**Cơ chế:** Mỗi view được định nghĩa với `SQL SECURITY DEFINER` và `DEFINER='sp_definer'@'%'`. Khi `app_secure` truy vấn view, MySQL tự động chuyển sang chạy dưới quyền của `sp_definer` (user có quyền đọc/ghi bảng gốc). `app_secure` chỉ biết đến view, không thể biết tên bảng gốc là gì.

**Virtual Data Masking — `v_accounts_public`:**

View dành cho bảng `accounts` được đặt tên `v_accounts_public` để thể hiện rõ phạm vi truy cập công khai. Thay vì liệt kê toàn bộ cột, view chỉ khai báo tường minh 7 cột an toàn — cột `password_hash` bị loại khỏi định nghĩa view, không thể truy cập dù qua UNION-based SQLi hay bất kỳ hình thức tấn công nào tác động tại tầng ứng dụng. Backend cần xác thực mật khẩu phải gọi Stored Procedure `sp_authenticate_account` riêng biệt — SP chạy dưới quyền `sp_definer` và chỉ trả về kết quả xác thực, không trả về hash thô.

**Triển khai — `02.5-updatable-views.sql`:**

```sql
-- View accounts: chỉ expose 7 cột an toàn — password_hash bị ẩn tại tầng định nghĩa View
CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_accounts_public AS
SELECT
    id,
    username,
    email,
    role,
    created_at,
    updated_at,
    deleted
FROM accounts;
-- password_hash không xuất hiện → UNION-based SQLi cũng không lấy được

-- Backend xác thực đăng nhập — BẮT BUỘC gọi SP:
CALL sp_authenticate_account('user@email.com', 'plain_password');
-- SP chạy dưới quyền sp_definer, tự so sánh hash nội bộ, trả về kết quả boolean

-- Các view còn lại: liệt kê cột tường minh, không dùng SELECT *
CREATE OR REPLACE DEFINER='sp_definer'@'%' SQL SECURITY DEFINER VIEW v_products AS
SELECT id, title, product_info, price, stock, cate_id, seller_id,
       created_at, updated_at, deleted
FROM products;
-- ... (13 views tổng cộng)
```

**Kết quả kiểm chứng — quyền của `app_secure`:**

```sql
-- app_secure KHÔNG THỂ:
SELECT * FROM accounts;              -- ERROR 1142: SELECT command denied
SELECT password_hash FROM accounts;  -- ERROR 1142: SELECT command denied

-- app_secure CÓ THỂ (qua view — nhưng password_hash vẫn không có):
SELECT * FROM v_accounts_public;     -- OK — kết quả không chứa password_hash
INSERT INTO v_products ...;          -- OK (updatable view)
CALL sp_search_products(...);        -- OK (EXECUTE được cấp)
```

**So sánh với Enterprise Firewall:**

| Tiêu chí              | MySQL Enterprise Firewall   | Updatable View Gateway (Nhóm)             |
| --------------------- | --------------------------- | ----------------------------------------- |
| Chi phí               | Trả phí                     | Miễn phí (MySQL Community)                |
| False Positive        | Có (nếu học thiếu)          | **0%** (gateway tất định)                 |
| Cơ chế                | Học và so khớp pattern      | Hạn chế đặc quyền tại DB                  |
| Bypass-able           | Có (nếu query khớp pattern) | Không (không có quyền bảng gốc)           |
| **Data Masking**      | ❌ Không tích hợp sẵn       | **✅ Tích hợp trong định nghĩa View**     |
| **Password exposure** | ⚠️ Phụ thuộc cấu hình       | **✅ Ẩn tại tầng View, không thể bypass** |

**Ảnh hưởng lên JPA — tích hợp minh họa:**

Để JPA (Spring Data JPA + Hibernate) hoạt động bình thường mà không cần viết lại toàn bộ query, tất cả JPA Entity trong `backend-secure` được cập nhật annotation `@Table` trỏ vào view thay vì bảng gốc:

```java
// backend-secure/src/main/java/.../entity/AccountEntity.java

@Entity
@Table(name = "v_accounts_public")                       // ← trỏ vào view công khai
@SQLDelete(sql = "UPDATE v_accounts_public SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
public class AccountEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String username;
    private String email;
    private String role;
    // Không có field password — xác thực qua SP riêng biệt
}
```

Hibernate validate schema tại startup sẽ tìm `v_accounts_public`, `v_products`... và các view này tồn tại sẵn — ứng dụng khởi động bình thường mà không cần bất kỳ thay đổi nào ở tầng Service hay Repository.

---

### 4.2 Lớp 2: Stored Object Security — DEFINER Tách Biệt + Least Privilege

**Vấn đề của DEFINER=root:** Khi SP chạy với quyền root, nếu kẻ tấn công khai thác được lỗ hổng logic trong SP (ví dụ: Second-Order SQL Injection), chúng có toàn quyền trên DB.

**Giải pháp:** Tạo một user chuyên biệt `sp_definer` có quyền đầy đủ trên schema `e_commerce_secure`, nhưng **không thể đăng nhập từ xa bởi ứng dụng**. Toàn bộ SP, Trigger, và View đều được định nghĩa với `DEFINER='sp_definer'@'%'`.

**Nguyên tắc Least Privilege cho `app_secure`:**

User `app_secure` chỉ nhận quyền tối thiểu cần thiết để vận hành. Cụ thể, quyền `DELETE` hoàn toàn không được cấp trên bất kỳ view nào — mọi thao tác "xóa" của backend phải thực hiện dưới dạng Soft Delete thông qua `UPDATE ... SET deleted = true`. Điều này đảm bảo kể cả khi backend bị chiếm hoàn toàn, kẻ tấn công cũng không thể xóa vật lý dữ liệu khỏi hệ thống.

**Thiết lập phân quyền — `03-users.sql`:**

```sql
-- Tạo sp_definer — chạy trước tất cả script khác
CREATE USER IF NOT EXISTS 'sp_definer'@'%' IDENTIFIED BY 'DefinerPass@2024';
GRANT ALL PRIVILEGES ON `e_commerce_secure`.* TO 'sp_definer'@'%';

-- Tạo app_secure — user của backend
CREATE USER IF NOT EXISTS 'app_secure'@'%' IDENTIFIED BY 'SecurePass@2024';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'app_secure'@'%';

-- Chỉ cấp SELECT, INSERT, UPDATE — KHÔNG có DELETE (Least Privilege)
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_accounts_public` TO 'app_secure'@'%';
GRANT SELECT, INSERT, UPDATE ON `e_commerce_secure`.`v_products`        TO 'app_secure'@'%';
-- ... (13 views)
GRANT EXECUTE ON `e_commerce_secure`.* TO 'app_secure'@'%';

-- KHÔNG CÓ: SELECT/INSERT/UPDATE/DELETE trên bảng gốc
-- KHÔNG CÓ: DELETE trên bất kỳ view nào
-- KHÔNG CÓ: DROP, ALTER, CREATE, TRUNCATE, GRANT
```

**Ma trận đặc quyền sau khi thiết lập:**

| Tác tử       | Bảng gốc    | v\_\* Views                             | Stored Procedures | Triggers        |
| ------------ | ----------- | --------------------------------------- | ----------------- | --------------- |
| `root`       | Toàn quyền  | Toàn quyền                              | Toàn quyền        | Toàn quyền      |
| `sp_definer` | Toàn quyền  | Toàn quyền                              | DEFINER           | DEFINER         |
| `app_secure` | **Từ chối** | SELECT / INSERT / UPDATE (không DELETE) | EXECUTE           | Không trực tiếp |

**Stored Procedures — Parameterized + Allow-list:**

```sql
-- sp_search_products: Allow-list mapping cho ORDER BY
CREATE DEFINER='sp_definer'@'%' PROCEDURE sp_search_products(
    IN p_keyword   VARCHAR(255),
    IN p_sort      VARCHAR(20),
    ...
)
BEGIN
    -- ✅ Allow-list mapping — KHÔNG dùng p_sort trực tiếp
    SET @safe_sort = CASE p_sort
        WHEN 'price_asc'  THEN 'p.price ASC'
        WHEN 'price_desc' THEN 'p.price DESC'
        WHEN 'newest'     THEN 'p.created_at DESC'
        ELSE 'p.created_at DESC'   -- Fallback an toàn
    END;
    -- Dù p_sort = "price; DROP TABLE products--"
    -- → CASE không match → fallback 'p.created_at DESC' → an toàn

    SET @sql = CONCAT('SELECT ... FROM products p WHERE ... ORDER BY ', @safe_sort);
    PREPARE stmt FROM @sql;
    EXECUTE stmt USING @kw;   -- keyword qua prepared statement
    DEALLOCATE PREPARE stmt;
END$$
```

---

### 4.3 Lớp 3: Dual-Layer Privilege Escalation Prevention với Severity Alerting

**Kịch bản tấn công cần ngăn chặn:**

```
[Kẻ tấn công chiếm backend container]
    └─→ Lấy được credentials của app_secure từ application.properties
    └─→ Kết nối trực tiếp đến MySQL với user app_secure
    └─→ Thực thi: UPDATE accounts SET role='ADMIN' WHERE id=attacker_id
    └─→ Kết quả mong muốn của kẻ tấn công: leo thang lên quyền ADMIN
```

**Giải pháp — Trigger State-Machine với Severity Classification:**

Trigger `trg_audit_role_change` hoạt động như một **State-Machine độc lập tại tầng DB**, được kích hoạt tự động trước mỗi lệnh `UPDATE` trên cột `role` của bảng `accounts`. Trigger kiểm tra `CURRENT_USER()` — hàm của MySQL trả về **tên user DB đang thực thi lệnh**, không phải user của ứng dụng hay JWT token — và phân loại sự kiện theo ba mức độ nghiêm trọng (`severity`):

- **`CRITICAL`** — `app_secure` cố thay đổi `role`: bị Hard-Reject ngay lập tức, ghi log trước khi rollback
- **`LOW`** — `root`, `sp_definer`, hoặc `admin` thực hiện thay đổi: tác vụ quản trị hợp lệ, ghi log bình thường
- **`HIGH`** — Nguồn không thuộc whitelist: đáng ngờ, ghi log để điều tra

```sql
-- Bảng audit log với cột severity phân loại mức độ nghiêm trọng
CREATE TABLE IF NOT EXISTS security_audit_log (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    event_time  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    table_name  VARCHAR(50)  NOT NULL,
    operation   VARCHAR(30)  NOT NULL,
    affected_id INT          DEFAULT NULL,
    old_value   TEXT         DEFAULT NULL,
    new_value   TEXT         DEFAULT NULL,
    notes       TEXT         DEFAULT NULL,
    severity    VARCHAR(20)  NOT NULL DEFAULT 'LOW'
        COMMENT 'CRITICAL | HIGH | LOW — mức độ nghiêm trọng của sự kiện bảo mật'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger phân loại severity theo CURRENT_USER()
CREATE DEFINER='sp_definer'@'%' TRIGGER trg_audit_role_change
BEFORE UPDATE ON accounts
FOR EACH ROW
BEGIN
    DECLARE v_severity VARCHAR(20) DEFAULT 'HIGH';

    IF OLD.role != NEW.role THEN

        IF CURRENT_USER() REGEXP '^app_secure@' THEN
            SET v_severity = 'CRITICAL';
            INSERT INTO security_audit_log (..., severity)
            VALUES ('accounts', 'PRIVILEGE_ESCALATION_ATTEMPT', ..., 'CRITICAL');
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB SECURITY] Unauthorized role escalation attempt from backend user';

        ELSEIF CURRENT_USER() REGEXP '^(root|sp_definer|admin)@' THEN
            SET v_severity = 'LOW';
            INSERT INTO security_audit_log (..., severity)
            VALUES ('accounts', 'ROLE_CHANGE', ..., 'LOW');

        ELSE
            SET v_severity = 'HIGH';
            INSERT INTO security_audit_log (..., severity)
            VALUES ('accounts', 'ROLE_CHANGE_SUSPICIOUS', ..., 'HIGH');
        END IF;

    END IF;
END$$
```

**Luồng xử lý khi bị tấn công:**

```
app_secure → UPDATE accounts SET role='ADMIN' WHERE id=1
    │
    ▼ (MySQL kích hoạt trigger BEFORE UPDATE)
    │
    ├─ CURRENT_USER() = 'app_secure@172.22.0.5'
    ├─ REGEXP '^app_secure@' → TRUE
    ├─ SET v_severity = 'CRITICAL'
    ├─ INSERT INTO security_audit_log (severity='CRITICAL') ← ghi log trước khi reject
    └─ SIGNAL SQLSTATE '45000' → Transaction bị rollback
       └─ Backend nhận: SQL Error 45000: [DB SECURITY] Unauthorized role escalation attempt
       └─ security_audit_log.severity = 'CRITICAL' — Admin phát hiện ngay
       └─ role KHÔNG thay đổi
```

**Truy vấn audit log qua SP với lọc severity:**

```sql
-- Admin xem ngay các sự kiện nghiêm trọng nhất
CALL sp_get_audit_log(50, 'CRITICAL');

-- Admin xem tất cả sự kiện gần đây
CALL sp_get_audit_log(100, NULL);
```

**Tại sao không thể bypass?**

`CURRENT_USER()` là hàm nội tại của MySQL server, trả về tên user DB thực tế của session hiện tại. Kẻ tấn công **không thể giả mạo** giá trị này bằng cách:

- Thay đổi JWT payload (JWT không liên quan đến `CURRENT_USER()`)
- Gọi `SET CURRENT_USER = 'root'` (không tồn tại lệnh này)
- Sử dụng SQL injection trong query (trigger chạy ở server-side, không phụ thuộc nội dung query)

Cách duy nhất để bypass là đăng nhập DB bằng user khác không phải `app_secure` — điều này đòi hỏi phải có credentials của `root` hoặc `sp_definer`, vốn không được lưu trong ứng dụng.

---

## 5. Kiến Trúc Tổng Thể — Script Init Database

Toàn bộ hệ thống phòng thủ được khởi tạo thông qua các script SQL chạy tuần tự theo thứ tự bảng chữ cái khi MySQL container khởi động lần đầu:

| Thứ tự | File                               | Mục đích                                                                                                   |
| ------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1      | `00-schema-data.sql`               | Schema và dữ liệu mẫu cho DB vulnerable                                                                    |
| 2      | `00-vulnerable-schema.sql`         | Schema DB vulnerable                                                                                       |
| 3      | `01-secure-schema.sql`             | Schema 13 bảng gốc cho DB secure                                                                           |
| 4      | **`01.9-create-definer-user.sql`** | Tạo `sp_definer` (phải chạy trước 02 và 02.5)                                                              |
| 5      | **`02-secure-objects.sql`**        | CHECK constraints, Audit log (+ cột `severity`), Views đặc thù, Triggers (+ IF/ELSEIF severity logic), SPs |
| 6      | **`02.5-updatable-views.sql`**     | 13 Updatable Views — `v_accounts_public` ẩn `password_hash`, cột khai báo tường minh                       |
| 7      | **`03-users.sql`**                 | Tạo `app_secure`, thu hồi quyền bảng gốc, cấp SELECT/INSERT/UPDATE (không DELETE)                          |
| 8      | `04-security-audit.sql`            | Cấu hình bổ sung cho audit                                                                                 |

**Lý do cần `01.9-create-definer-user.sql`:** MySQL Docker entrypoint chạy script theo thứ tự tên file. Cả `02-secure-objects.sql` và `02.5-updatable-views.sql` đều khai báo `DEFINER='sp_definer'@'%'` — nếu `sp_definer` chưa tồn tại tại thời điểm đó, MySQL sẽ báo lỗi syntax và bỏ qua toàn bộ script. File `01.9-create-definer-user.sql` giải quyết vấn đề phụ thuộc vòng (dependency ordering) này.

---

## 6. Các Lớp Bảo Vệ Bổ Sung

Ngoài ba lớp chính, nhóm còn triển khai thêm:

### 6.1 CHECK Constraints — Validate tại tầng Schema

```sql
ALTER TABLE products
    ADD CONSTRAINT IF NOT EXISTS chk_product_price CHECK (price >= 0),
    ADD CONSTRAINT IF NOT EXISTS chk_product_stock CHECK (stock >= 0);

ALTER TABLE orders
    ADD CONSTRAINT IF NOT EXISTS chk_order_phone
    CHECK (phone REGEXP '^[0-9]{10,11}$');
```

Dù backend gửi `price = -999999` hay `phone = 'DROP TABLE'`, DB sẽ từ chối ngay tại constraint, trước khi dữ liệu được ghi.

### 6.2 Input Validation Triggers

```sql
-- Từ chối username chứa ký tự SQL injection đặc trưng
CREATE DEFINER='sp_definer'@'%' TRIGGER trg_validate_account_insert
BEFORE INSERT ON accounts
FOR EACH ROW
BEGIN
    IF NEW.username REGEXP '[\'\"\\\;]'
        OR NEW.username LIKE '%--%'
        OR NEW.username LIKE '%xp_%'
    THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Invalid characters in username';
    END IF;
END$$
```

### 6.3 Phone Format Validation

```sql
-- Kiểm tra định dạng số điện thoại tại tầng DB
CREATE DEFINER='sp_definer'@'%' TRIGGER trg_validate_order_phone_insert
BEFORE INSERT ON orders FOR EACH ROW
BEGIN
    IF NEW.phone NOT REGEXP '^[0-9]{10,11}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Phone must be 10-11 digits only';
    END IF;
END$$
```

### 6.4 Transactional Order Processing với SELECT FOR UPDATE

```sql
-- sp_create_order_safe: chống race condition
START TRANSACTION;
    SELECT stock, price INTO v_stock, v_price
    FROM products WHERE id = p_prod_id AND deleted = 0
    FOR UPDATE;             -- ← Lock row, ngăn 2 user mua cùng lúc

    IF v_stock < p_quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[DB SECURITY] Insufficient stock';
    END IF;

    UPDATE products SET stock = stock - p_quantity WHERE id = p_prod_id;
    INSERT INTO orders (...) VALUES (...);
COMMIT;
```

### 6.5 Audit Log với Severity Classification

Mọi sự kiện nhạy cảm (thay đổi role, soft-delete) đều được ghi vào bảng `security_audit_log` thông qua trigger, với cột `severity` phân loại mức độ nghiêm trọng để Admin có thể ưu tiên xử lý:

| severity   | Ý nghĩa                                                    | Hành động đề xuất             |
| ---------- | ---------------------------------------------------------- | ----------------------------- |
| `CRITICAL` | `app_secure` cố thực hiện thao tác ngoài phạm vi cho phép  | Điều tra ngay, block session  |
| `HIGH`     | Thao tác nhạy cảm từ user không thuộc whitelist            | Xem xét và xác minh danh tính |
| `LOW`      | Tác vụ quản trị bình thường từ `root`/`sp_definer`/`admin` | Lưu trữ để audit              |

```sql
-- Truy vấn nhanh các sự kiện nguy hiểm nhất
CALL sp_get_audit_log(50, 'CRITICAL');

-- Kết quả mẫu khi bị tấn công:
-- id | event_time          | operation                    | severity
-- 1  | 2024-01-15 10:32:01 | PRIVILEGE_ESCALATION_ATTEMPT | CRITICAL
```

---

## 7. Tổng Kết Ưu Điểm

| Khả năng                        | Dùng Enterprise Firewall + DEFINER=root | Giải pháp của Nhóm                             |
| ------------------------------- | --------------------------------------- | ---------------------------------------------- |
| Chặn query tùy ý từ backend     | ✅ (pattern matching)                   | ✅ (không có quyền bảng gốc)                   |
| False Positive                  | ⚠️ Có thể xảy ra                        | **✅ 0%**                                      |
| Chi phí                         | ❌ Trả phí                              | **✅ Miễn phí**                                |
| Chặn leo thang đặc quyền        | ❌ Không                                | **✅ Trigger Hard-Reject**                     |
| Audit log tự động               | ⚠️ Cần cấu hình riêng                   | **✅ Tích hợp sẵn**                            |
| Tương thích JPA                 | ✅                                      | **✅ (qua updatable views)**                   |
| Race condition                  | ❌ Không xử lý                          | **✅ SELECT FOR UPDATE**                       |
| Validate input tại DB           | ❌ Không                                | **✅ Trigger + CHECK constraints**             |
| **Virtual Data Masking**        | ❌ Không                                | **✅ `v_accounts_public` ẩn `password_hash`**  |
| **Least Privilege (no DELETE)** | ❌ Không                                | **✅ Chỉ SELECT/INSERT/UPDATE**                |
| **Severity Alerting**           | ❌ Không                                | **✅ CRITICAL/HIGH/LOW theo `CURRENT_USER()`** |

---

## 8. Kết Luận

Module "Database-as-a-Fortress" chứng minh rằng có thể xây dựng một hệ thống phòng thủ đa lớp hiệu quả tại tầng cơ sở dữ liệu mà không cần phụ thuộc vào các giải pháp thương mại đắt tiền. Ba lớp phòng thủ hoạt động **độc lập với tầng ứng dụng** — nghĩa là kể cả khi toàn bộ backend bị xâm phạm, kẻ tấn công vẫn không thể:

1. **Đọc `password_hash`** — bị ẩn bởi Virtual Data Masking tại định nghĩa View; xác thực mật khẩu chỉ thực hiện nội bộ trong SP
2. **Xóa vật lý dữ liệu** — không có quyền `DELETE`; mọi thao tác "xóa" đều là Soft Delete có thể phục hồi
3. **Leo thang đặc quyền** — bị Hard-Reject bởi Trigger, đồng thời ghi log `severity='CRITICAL'` để Admin phát hiện ngay
4. **Đọc/ghi bảng gốc** — bị chặn bởi SQL Allowlist Gateway (Updatable Views)
5. **Khai thác lỗ hổng SP với quyền root** — SPs chạy với `DEFINER=sp_definer`, không phải root

Đây là một mô hình **Defense-in-Depth** (phòng thủ theo chiều sâu) thực tiễn, có thể áp dụng trực tiếp cho bất kỳ hệ thống nào sử dụng MySQL 8.0+ Community Edition.
