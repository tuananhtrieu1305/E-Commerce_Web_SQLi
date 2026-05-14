package com.backend.backend.api;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.model.product.ProductDTO;
import com.backend.backend.model.request.ProductCreateRequest;
import com.backend.backend.model.request.ProductUpdateRequest;
import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.service.product.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/product")
public class ProductAPI {
    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getProduct(@RequestParam Map<String, Object> params) {
        List<ProductDTO> products = productService.getProduct(params);
        return ResponseEntity.ok(ApiResponse.success(products, "Get Products succeeded!"));
    }

    @GetMapping("/top-buyer")
    public ResponseEntity<List<ProductDTO>> getTopBestSellerProducts(
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<ProductDTO> result = productService.getTopBestSellerProducts(limit);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/top-rated")
    public ResponseEntity<List<ProductDTO>> getTopRatedProducts(
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<ProductDTO> result = productService.getTopRatedProducts(limit);
        return ResponseEntity.ok(result);
    }

    // ✅ SECURE: @Valid → kích hoạt @Pattern allow-list validation trên DTO
    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {
        ProductDTO newProduct = productService.createProductFromRequest(request);
        ApiResponse<ProductDTO> response = ApiResponse.success(newProduct, "Create product succeeded!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> createListProducts(
            @Valid @RequestBody List<ProductCreateRequest> requestList) {
        List<ProductDTO> newProducts = productService.createListProductsFromRequest(requestList);
        ApiResponse<List<ProductDTO>> response = ApiResponse.success(newProducts, "Create List Product succeeded!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ✅ SECURE: @Valid → kích hoạt @Pattern allow-list validation trên DTO
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Integer id,
            @Valid @RequestBody ProductUpdateRequest request) {
        ProductDTO updatedProduct = productService.updateProductFromRequest(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedProduct, "Update product succeeded!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Delete product succeeded!"));
    }

}
