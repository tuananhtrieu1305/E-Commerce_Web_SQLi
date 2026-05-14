package com.backend.backend.repository.product.custom;

import com.backend.backend.builder.product.ProductSearchBuilder;
import com.backend.backend.model.product.ProductDTO;

import java.util.List;

public interface ProductRepositoryCustom {
    List<ProductDTO> getProduct(ProductSearchBuilder productSearchBuilder);
}
