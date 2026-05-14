package com.backend.backend.service.chatbot;

import com.backend.backend.model.product.ProductDTO;
import com.backend.backend.service.product.ProductService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * ✅ SECURE: ChatbotService sử dụng Gemini API (thay thế Ollama)
 * - Gọi Gemini REST API qua OkHttp
 * - API Key đọc từ environment variable GEMINI_API_KEY
 * - Không sử dụng Spring AI framework → giảm attack surface
 */
@Service
public class ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotService.class);

    // Gemini API endpoint
    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private static final MediaType JSON_MEDIA_TYPE = MediaType.get("application/json; charset=utf-8");

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Autowired
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    private final OkHttpClient httpClient;

    public ChatbotService() {
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    /**
     * Xử lý query từ user → gọi Gemini API → trích xuất JSON → tìm sản phẩm
     */
    public List<ProductDTO> queryProducts(String userQuery) {
        try {
            // 1. Gọi Gemini API để trích xuất thông tin tìm kiếm
            String jsonResponse = callGeminiApi(userQuery);

            logger.info("Gemini API response: {}", jsonResponse);

            // 2. Parse JSON response thành map
            Map<String, Object> aiParams = parseJsonToMap(jsonResponse);

            // 3. Xử lý logic giá (nếu có)
            if (aiParams.containsKey("priceQuery")) {
                String priceQuery = (String) aiParams.get("priceQuery");
                Map<String, Integer> priceRange = parsePriceQuery(priceQuery);
                aiParams.putAll(priceRange);
            }

            // 4. Tìm kiếm sản phẩm trong DB
            return productService.searchProductsForChatbot(aiParams);

        } catch (Exception e) {
            logger.error("Chatbot processing error: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Gọi Gemini REST API qua OkHttp
     */
    private String callGeminiApi(String userQuery) throws IOException {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_KEY is not configured");
        }

        String systemPrompt = buildSystemPrompt();

        // Tạo request body theo Gemini API format
        // Sử dụng system_instruction + user content
        String requestBody = objectMapper.writeValueAsString(Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ),
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", userQuery))
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0.1,
                        "responseMimeType", "application/json"
                )
        ));

        // Build HTTP request
        String url = GEMINI_API_URL + "?key=" + geminiApiKey;

        Request request = new Request.Builder()
                .url(url)
                .post(RequestBody.create(requestBody, JSON_MEDIA_TYPE))
                .build();

        // Execute request
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No body";
                logger.error("Gemini API error [{}]: {}", response.code(), errorBody);
                throw new IOException("Gemini API returned status: " + response.code());
            }

            String responseBody = response.body() != null ? response.body().string() : "";

            // Parse Gemini response → lấy text content
            return extractTextFromGeminiResponse(responseBody);
        }
    }

    /**
     * Extract text content từ Gemini API response JSON
     * Response format: { "candidates": [{ "content": { "parts": [{ "text": "..." }] } }] }
     */
    private String extractTextFromGeminiResponse(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode candidates = root.path("candidates");

        if (candidates.isArray() && candidates.size() > 0) {
            JsonNode firstCandidate = candidates.get(0);
            JsonNode parts = firstCandidate.path("content").path("parts");

            if (parts.isArray() && parts.size() > 0) {
                return parts.get(0).path("text").asText("");
            }
        }

        logger.warn("Empty or unexpected Gemini response structure");
        return "{}";
    }

    // ============================================================
    // Price parsing logic (giữ nguyên từ bản cũ)
    // ============================================================

    private Map<String, Integer> parsePriceQuery(String priceQuery) {
        Map<String, Integer> priceRange = new HashMap<>();
        if (priceQuery == null) return priceRange;

        String query = priceQuery.toLowerCase();

        // 1. Tìm số (có thể là số thập phân, ví dụ: 10.5 hoặc 10,5)
        Matcher numberMatcher = Pattern.compile("([\\d,.]+)").matcher(query);
        if (!numberMatcher.find()) return priceRange;

        // Chuẩn hóa số: "10,5" -> "10.5"
        String numberStr = numberMatcher.group(1).replaceAll(",", ".");
        double number = Double.parseDouble(numberStr);

        // 2. Xử lý đơn vị (triệu, k)
        if (query.contains("triệu")) {
            number *= 1000000;
        } else if (query.contains("k") || query.contains("nghìn") || query.contains("ngàn")) {
            number *= 1000;
        }

        int finalPrice = (int) number;

        // 3. Xử lý logic khoảng
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

        logger.debug("Price parsed: '{}' -> {}", priceQuery, priceRange);
        return priceRange;
    }

    // ============================================================
    // System Prompt (giữ nguyên logic từ bản cũ)
    // ============================================================

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
                + "Input: \"tai nghe không dây giá dưới 600000\"\n"
                + "Output: {\"keywords\": \"tai nghe không dây\", \"priceQuery\": \"giá dưới 600000\"}\n"
                + "\n"
                + "Input: \"tai nghe giá khoảng 550000\"\n"
                + "Output: {\"keywords\": \"tai nghe\", \"priceQuery\": \"giá khoảng 550000\"}\n"
                + "\n"
                + "Input: \"tai nghe giá không quá 550000\"\n"
                + "Output: {\"keywords\": \"tai nghe\", \"priceQuery\": \"giá không quá 550000\"}\n"
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
}