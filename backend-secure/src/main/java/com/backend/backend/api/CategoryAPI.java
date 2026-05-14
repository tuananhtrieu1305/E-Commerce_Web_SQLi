package com.backend.backend.api;

import com.backend.backend.model.category.CategoryProductResponseDTO;
import com.backend.backend.model.product.CategoryDTO;
import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.service.category.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/category")
public class CategoryAPI {
    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryProductResponseDTO>>> getCategoriesWithProducts() {
        List<CategoryProductResponseDTO> data = categoryService.getCategoriesWithProducts();
        return ResponseEntity.ok(ApiResponse.success(data, "Get category with products succeeded!"));
    }

    @GetMapping("/only")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getCategoryOnly() {
        List<CategoryDTO> data = categoryService.getCategoryOnly();
        return ResponseEntity.ok(ApiResponse.success(data, "Get category succeeded!"));
    }
}
