package com.backend.backend.service.chatbot;

import com.backend.backend.model.product.ProductDTO;
import com.backend.backend.service.product.ProductService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatbotService {

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    @Autowired private ProductService productService;
    @Autowired private ObjectMapper objectMapper;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    private final OkHttpClient httpClient = new OkHttpClient();

    public List<ProductDTO> queryProducts(String userQuery) {
        String systemPrompt = buildSystemPrompt();

        try {
            String jsonResponse = callGeminiApi(systemPrompt, userQuery);

            System.out.println("============================================");
            System.out.println("DEBUG: JSON THÔ TỪ GEMINI:");
            System.out.println(jsonResponse);
            System.out.println("============================================");

            Map<String, Object> aiParams = parseJsonToMap(jsonResponse);

            if (aiParams.containsKey("priceQuery")) {
                String priceQuery = (String) aiParams.get("priceQuery");
                Map<String, Integer> priceRange = parsePriceQuery(priceQuery);
                aiParams.putAll(priceRange);
            }

            return productService.searchProductsForChatbot(aiParams);

        } catch (Exception e) {
            System.err.println("Lỗi khi xử lý chatbot (có thể do parse JSON): " + e.getMessage());
            return List.of();
        }
    }

    // ============================================================
    // Gọi Gemini API qua REST (OkHttp)
    // ============================================================
    private String callGeminiApi(String systemPrompt, String userQuery) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;

        // Build request body theo Gemini API format
        String requestBody = objectMapper.writeValueAsString(Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ),
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", userQuery)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.1,
                        "responseMimeType", "application/json"
                )
        ));

        Request request = new Request.Builder()
                .url(url)
                .post(RequestBody.create(requestBody, MediaType.parse("application/json")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Gemini API error: " + response.code() + " - " + response.body().string());
            }
            String responseBody = response.body().string();
            JsonNode root = objectMapper.readTree(responseBody);
            return root.at("/candidates/0/content/parts/0/text").asText();
        }
    }

    private Map<String, Integer> parsePriceQuery(String priceQuery) {
        Map<String, Integer> priceRange = new HashMap<>();
        if (priceQuery == null) return priceRange;

        String query = priceQuery.toLowerCase();

        Matcher numberMatcher = Pattern.compile("([\\d,.]+)").matcher(query);
        if (!numberMatcher.find()) return priceRange;

        String numberStr = numberMatcher.group(1).replaceAll(",", ".");
        double number = Double.parseDouble(numberStr);

        if (query.contains("triệu")) {
            number *= 1000000;
        } else if (query.contains("k") || query.contains("nghìn") || query.contains("ngàn")) {
            number *= 1000;
        }

        int finalPrice = (int) number;

        if (query.contains("dưới") || query.contains("tối đa") || query.contains("không quá")) {
            priceRange.put("maxPrice", finalPrice);
        } else if (query.contains("trên") || query.contains("tối thiểu")) {
            priceRange.put("minPrice", finalPrice);
        } else if (query.contains("khoảng")) {
            priceRange.put("minPrice", (int) (finalPrice * 0.8));
            priceRange.put("maxPrice", (int) (finalPrice * 1.2));
        } else {
            priceRange.put("minPrice", (int) (finalPrice * 0.9));
            priceRange.put("maxPrice", (int) (finalPrice * 1.1));
        }

        System.out.println("DEBUG: Java đã xử lý giá: '" + priceQuery + "' -> " + priceRange);
        return priceRange;
    }

    // Prompt
    private String buildSystemPrompt() {
        String validKeys = "`keywords`, `priceQuery`, `sellerName`";

        return "Bạn là một robot trích xuất JSON. Hãy tuân thủ NGHIÊM NGẶT các quy tắc sau:\n"
                + "1. Chỉ dùng các key sau: " + validKeys + ".\n"
                + "2. `keywords`: Gom tất cả các từ khóa tìm kiếm (tên, loại) vào đây.\n"
                + "3. `priceQuery`: Trích xuất NGUYÊN GỐC cụm từ liên quan đến giá (ví dụ: 'khoảng 10 triệu', 'dưới 500k', 'giá 550000').\n"
                + "4. `sellerName`: Chỉ trích xuất tên người bán nếu có.\n"
                + "5. TUYỆT ĐỐI KHÔNG ĐƯỢC SUY DIỄN. Nếu người dùng không nói về giá, KHÔNG được thêm `priceQuery`.\n"
                + "6. Nếu không trích xuất được gì, trả về {}.\n"
                + "7. CHỈ trả về JSON. Không một lời giải thích.\n"
                + "\n"
                + "--- VÍ DỤ --- \n"
                + "Input: \"máy tính giá khoảng 10 triệu\"\n"
                + "Output: {\"keywords\": \"máy tính\", \"priceQuery\": \"khoảng 10 triệu\"}\n"
                + "\n"
                + "Input: \"áo phông coolmate giá 200k\"\n"
                + "Output: {\"keywords\": \"áo phông\", \"sellerName\": \"coolmate\", \"priceQuery\": \"giá 200k\"}\n"
                + "\n"
                + "Input: \"tôi muốn mua chuột\"\n"
                + "Output: {\"keywords\": \"chuột\"}\n"
                + "\n"
                + "Input: \"chúc một ngày tốt lành\"\n"
                + "Output: {}\n"
                + "--- KẾT THÚC VÍ DỤ ---";
    }

    private Map<String, Object> parseJsonToMap(String jsonString) throws Exception {
        if (jsonString == null || jsonString.isBlank()) {
            return new HashMap<>();
        }
        String cleanedJson = jsonString
                .replace("```json", "")
                .replace("```", "")
                .trim();
        if (cleanedJson.isEmpty() || cleanedJson.equals("\"\"")) {
            return new HashMap<>();
        }
        return objectMapper.readValue(cleanedJson, new TypeReference<Map<String, Object>>() {});
    }

    // ============================================================
    // ❌ ERROR-BASED SQLi — raw SQL + KHÔNG bắt lỗi → lộ MySQL error
    // POST /api/chatbot/raw-search?keyword=xxx
    // ============================================================
    public List<ProductDTO> rawSearch(String keyword) {
        // ❌ String concatenation trực tiếp + KHÔNG TRY-CATCH
        // → MySQL error message trả thẳng về client qua GlobalExceptionHandler
        String sql = "SELECT * FROM products WHERE deleted = false AND title LIKE '%" + keyword + "%'";

        jakarta.persistence.Query query = entityManager.createNativeQuery(sql,
                com.backend.backend.repository.product.entity.ProductEntity.class);

        @SuppressWarnings("unchecked")
        List<com.backend.backend.repository.product.entity.ProductEntity> entities = query.getResultList();

        List<ProductDTO> results = new java.util.ArrayList<>();
        for (com.backend.backend.repository.product.entity.ProductEntity entity : entities) {
            ProductDTO dto = new ProductDTO();
            dto.setId(entity.getId());
            dto.setTitle(entity.getTitle());
            dto.setProductInfo(entity.getProduct_info());
            dto.setPrice(entity.getPrice());
            dto.setStock(entity.getStock());
            results.add(dto);
        }
        return results;
    }
}