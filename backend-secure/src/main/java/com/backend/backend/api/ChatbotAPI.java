package com.backend.backend.api;

import com.backend.backend.model.chatbot.ChatbotRequest;
import com.backend.backend.model.product.ProductDTO;
import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.service.chatbot.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotAPI {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/query")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> handleChatQuery(
            @RequestBody ChatbotRequest request
    ) {
        List<ProductDTO> products = chatbotService.queryProducts(request.getQuery());
        return ResponseEntity.ok(ApiResponse.success(products, "Kết quả tìm kiếm từ chatbot"));
    }
}