package com.backend.backend.service.category;

import java.util.List;

import com.backend.backend.model.category.CategoryProductResponseDTO;
import com.backend.backend.model.product.CategoryDTO;

public interface CategoryService {
    public List<CategoryProductResponseDTO> getCategoriesWithProducts();
    public List<CategoryDTO> getCategoryOnly();
}
