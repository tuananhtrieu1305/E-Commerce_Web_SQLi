package com.backend.backend.service.product;

import java.util.List;
import java.util.Map;

import com.backend.backend.model.product.ProductDTO;

public interface ProductService {
    List<ProductDTO> getProduct(Map<String, Object> params);
    ProductDTO createProduct(Map<String, Object> body);
    ProductDTO updateProduct(Integer id, Map<String, Object> body);
    void deleteProduct(Integer id);
    List<ProductDTO> createListProducts(List<Map<String, Object>> bodyList);
    List<ProductDTO> searchProductsForChatbot(Map<String, Object> aiParams);
    List<ProductDTO> getTopBestSellerProducts(int limit) ;
    List<ProductDTO> getTopRatedProducts(int limit);
}
