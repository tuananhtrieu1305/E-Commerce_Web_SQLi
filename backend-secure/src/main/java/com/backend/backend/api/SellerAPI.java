package com.backend.backend.api;

import com.backend.backend.model.product.ProductDTO;
import com.backend.backend.model.product.SellerDTO;
import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.service.seller.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/seller")
public class SellerAPI {
    @Autowired
    private SellerService sellerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SellerDTO>>> getSeller() {
        List<SellerDTO> res = sellerService.getSeller();
        return ResponseEntity.ok(ApiResponse.success(res, "Get Sellers succeeded!"));
    }
}
