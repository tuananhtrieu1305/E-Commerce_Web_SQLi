package com.backend.backend.service.category.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.backend.converter.category.CategoryProductResponseDTOConverter;
import com.backend.backend.model.category.CategoryProductResponseDTO;
import com.backend.backend.model.product.CategoryDTO;
import com.backend.backend.repository.category.CategoryRepository;
import com.backend.backend.repository.category.entity.CategoryEntity;
import com.backend.backend.service.category.CategoryService;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryProductResponseDTOConverter categoryProductResponseDTOConverter;

    @Override
    public List<CategoryProductResponseDTO> getCategoriesWithProducts() {
        List<CategoryEntity> entities = categoryRepository.findAllWithProducts();
        return categoryProductResponseDTOConverter.toCategoryProductResponseDTOList(entities);
    }

    @Override
    public List<CategoryDTO> getCategoryOnly() {
        return categoryRepository.findAllCategoryOnly();
    }
}
