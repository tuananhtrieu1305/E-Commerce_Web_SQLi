package com.backend.backend.converter.product;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.backend.backend.model.product.CategoryDTO;
import com.backend.backend.model.product.ProductDTO;
import com.backend.backend.model.product.ProductImageDTO;
import com.backend.backend.model.product.SellerDTO;
import com.backend.backend.repository.product.entity.ProductEntity;
import com.backend.backend.repository.product.entity.ProductImageEntity;

@Component
public class ProductDTOConverter {

    @Autowired
    private ModelMapper modelMapper;

    public ProductDTO toProductDTO(ProductEntity product) {
        ProductDTO productDTO = modelMapper.map(product, ProductDTO.class);

        productDTO.setProductInfo(product.getProduct_info());
        productDTO.setCreatedAt(product.getCreated_at());
        productDTO.setUpdatedAt(product.getUpdated_at());

        // Set category info
        if (product.getCategory() != null) {
            CategoryDTO categoryDTO = modelMapper.map(product.getCategory(), CategoryDTO.class);
            productDTO.setCategory(categoryDTO);
        }

        // Set seller info
        if (product.getSeller() != null) {
            SellerDTO sellerDTO = modelMapper.map(product.getSeller(), SellerDTO.class);
            productDTO.setSeller(sellerDTO);
        }

        // Convert product images
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            List<ProductImageDTO> productImageDTOs = new ArrayList<>();
            for (ProductImageEntity imageEntity : product.getImages()) {
                productImageDTOs.add(convertToProductImageDTO(imageEntity));
            }
            productDTO.setImagePaths(productImageDTOs);
        }

        return productDTO;
    }

    private ProductImageDTO convertToProductImageDTO(ProductImageEntity productImage) {
        ProductImageDTO productImageDTO = modelMapper.map(productImage, ProductImageDTO.class);

        return productImageDTO;
    }
}