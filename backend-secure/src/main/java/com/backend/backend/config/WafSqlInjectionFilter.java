package com.backend.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.regex.Pattern;

@Component
public class WafSqlInjectionFilter extends OncePerRequestFilter {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Pattern nhận diện SQL Injection cơ bản
    private static final Pattern SQLI_PATTERN = Pattern.compile(
            "(?i)(union\\s+select|select\\s+.*\\s+from|information_schema|--|;\\s*drop\\s+table)"
    );

    private String classifySeverity(String payload) {
        if (payload == null) {
            return "LOW";
        }

        if (payload.matches("(?i).*(union\\s+select|information_schema|;\\s*drop\\s+table).*")) {
            return "CRITICAL";
        }

        if (payload.matches("(?i).*(select\\s+.*\\s+from|--).*")) {
            return "MEDIUM";
        }

        return "LOW";
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Chỉ kiểm tra các request GET có tham số (như ô Tìm kiếm: ?title=...)
        if ("GET".equalsIgnoreCase(request.getMethod())) {
            String titleParam = request.getParameter("title");
            
            if (titleParam != null && SQLI_PATTERN.matcher(titleParam).find()) {
                // Lấy IP của người dùng (nếu qua proxy thì lấy từ header X-Forwarded-For)
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty()) {
                    ip = request.getRemoteAddr();
                }

                // Ghi log vào security_audit_log để con Bot Detector nhận diện
                try {
                    String sql = "INSERT INTO security_audit_log (db_name, table_name, operation, severity, ip, payload, reason, notes) " +
                                 "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    jdbcTemplate.update(sql, "e_commerce_secure", "products_search", "SQLI_ATTEMPT", classifySeverity(titleParam), ip, titleParam, "SQLi pattern detected", "SQLi in search query");
                    System.out.println("[WAF FILTER] Detected SQLi in Search. IP: " + ip);
                } catch (org.springframework.dao.DataAccessException e) {
                    System.err.println("Failed to write to audit log: " + e.getMessage());
                }
                
                // Trả về lỗi 403 không cho tìm kiếm
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Security Alert: Malicious input detected.");
                return;
            }
        }

        // Cho request đi tiếp bình thường nếu an toàn
        filterChain.doFilter(request, response);
    }
}
