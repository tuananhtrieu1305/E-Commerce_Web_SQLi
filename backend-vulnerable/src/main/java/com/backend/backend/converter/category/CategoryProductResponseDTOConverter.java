package com.backend.backend.converter.category;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.backend.backend.model.category.CategoryProductResponseDTO;
import com.backend.backend.model.category.ProductSummaryDTO;
import com.backend.backend.repository.category.entity.CategoryEntity;
import com.backend.backend.repository.product.entity.ProductEntity;

@Component
public class CategoryProductResponseDTOConverter {
    public CategoryProductResponseDTO toCategoryProductResponseDTO(CategoryEntity category) {
        CategoryProductResponseDTO responseDTO = new CategoryProductResponseDTO();

        responseDTO.setCategory_name(category.getCate_name());

        if (category.getProduct() != null && !category.getProduct().isEmpty()) {
            List<ProductSummaryDTO> productSummaryDTOs = new ArrayList<>();
            for (ProductEntity productEntity : category.getProduct()) {
                productSummaryDTOs.add(toProductSummaryDTO(productEntity));
            }
            responseDTO.setProducts(productSummaryDTOs);
        }

        return responseDTO;
    }

    public List<CategoryProductResponseDTO> toCategoryProductResponseDTOList(List<CategoryEntity> categories) {
        List<CategoryProductResponseDTO> dtoList = new ArrayList<>();
        for (CategoryEntity category : categories) {
            dtoList.add(toCategoryProductResponseDTO(category));
        }
        return dtoList;
    }

    private ProductSummaryDTO toProductSummaryDTO(ProductEntity product) {
        ProductSummaryDTO summaryDTO = new ProductSummaryDTO();

        summaryDTO.setProduct_id(product.getId());
        summaryDTO.setProduct_name(product.getTitle());
        summaryDTO.setStock(product.getStock());

        return summaryDTO;
    }
}
