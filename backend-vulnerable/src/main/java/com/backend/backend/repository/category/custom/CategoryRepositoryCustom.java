package com.backend.backend.repository.category.custom;

import com.backend.backend.model.category.CategoryProductResponseDTO;

import java.util.List;

public interface CategoryRepositoryCustom {
    List<CategoryProductResponseDTO> getCategoriesWithProducts();
}
