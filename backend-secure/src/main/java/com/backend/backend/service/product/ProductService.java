package com.backend.backend.service.product;

import java.util.List;
import java.util.Map;

import com.backend.backend.model.product.ProductDTO;
import com.backend.backend.model.request.ProductCreateRequest;
import com.backend.backend.model.request.ProductUpdateRequest;

public interface ProductService {
    List<ProductDTO> getProduct(Map<String, Object> params);
    ProductDTO createProduct(Map<String, Object> body);
    ProductDTO updateProduct(Integer id, Map<String, Object> body);
    void deleteProduct(Integer id);
    List<ProductDTO> createListProducts(List<Map<String, Object>> bodyList);
    List<ProductDTO> searchProductsForChatbot(Map<String, Object> aiParams);
    List<ProductDTO> getTopBestSellerProducts(int limit) ;
    List<ProductDTO> getTopRatedProducts(int limit);

    // ✅ SECURE: Method chấp nhận validated DTO thay vì raw Map
    ProductDTO createProductFromRequest(ProductCreateRequest request);
    List<ProductDTO> createListProductsFromRequest(List<ProductCreateRequest> requestList);
    ProductDTO updateProductFromRequest(Integer id, ProductUpdateRequest request);
}
