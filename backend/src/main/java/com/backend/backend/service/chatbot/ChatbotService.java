package com.backend.backend.service.chatbot;

import com.backend.backend.model.product.ProductDTO;
import com.backend.backend.service.product.ProductService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatbotService {

    private final ChatClient chatClient;
    @Autowired private ProductService productService;
    @Autowired private ObjectMapper objectMapper;

    @Autowired
    public ChatbotService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public List<ProductDTO> queryProducts(String userQuery) {

        String systemPrompt = buildSystemPrompt();

        try {
            String jsonResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userQuery)
                    .call()
                    .content();

            System.out.println("============================================");
            System.out.println("DEBUG: JSON THÔ TỪ AI (Nhiệm vụ mới):");
            System.out.println(jsonResponse);
            System.out.println("============================================");

            Map<String, Object> aiParams = parseJsonToMap(jsonResponse);

            if (aiParams.containsKey("priceQuery")) {
                String priceQuery = (String) aiParams.get("priceQuery");
                // Gọi hàm Java để xử lý logic giá
                Map<String, Integer> priceRange = parsePriceQuery(priceQuery);

                // Thêm minPrice/maxPrice đã được Java xử lý vào map
                aiParams.putAll(priceRange);
            }

            return productService.searchProductsForChatbot(aiParams);

        } catch (Exception e) {
            System.err.println("Lỗi khi xử lý chatbot (có thể do parse JSON): " + e.getMessage());
            return List.of();
        }
    }

    private Map<String, Integer> parsePriceQuery(String priceQuery) {
        Map<String, Integer> priceRange = new HashMap<>();
        if (priceQuery == null) return priceRange;

        String query = priceQuery.toLowerCase();

        // 1. Tìm số (có thể là số thập phân, ví dụ: 10.5 hoặc 10,5)
        Matcher numberMatcher = Pattern.compile("([\\d,.]+)").matcher(query);
        if (!numberMatcher.find()) return priceRange; // Không tìm thấy số

        // Chuẩn hóa số: "10,5" -> "10.5"
        String numberStr = numberMatcher.group(1).replaceAll(",", ".");
        double number = Double.parseDouble(numberStr);

        // 2. Xử lý đơn vị (triệu, k)
        if (query.contains("triệu")) {
            number *= 1000000;
        } else if (query.contains("k") || query.contains("nghìn") || query.contains("ngàn")) {
            number *= 1000;
        }

        int finalPrice = (int) number; // Chuyển về số nguyên

        // 3. Xử lý logic khoảng
        if (query.contains("dưới") || query.contains("tối đa") || query.contains("không quá")) {
            // "dưới 600k" -> {"maxPrice": 600000}
            priceRange.put("maxPrice", finalPrice);
        } else if (query.contains("trên") || query.contains("tối thiểu")) {
            priceRange.put("minPrice", finalPrice);
        } else if (query.contains("khoảng")) {
            // "khoảng 550k" -> cho khoảng giá +/- 20%
            priceRange.put("minPrice", (int) (finalPrice * 0.8)); // -20%
            priceRange.put("maxPrice", (int) (finalPrice * 1.2)); // +20%
        } else {
            // Trường hợp "giá 550000" (không có từ "khoảng")
            priceRange.put("minPrice", (int) (finalPrice * 0.9)); // -10%
            priceRange.put("maxPrice", (int) (finalPrice * 1.1)); // +10%
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