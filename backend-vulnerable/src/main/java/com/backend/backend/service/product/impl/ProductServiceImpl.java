package com.backend.backend.service.product.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.backend.builder.product.ProductSearchBuilder;
import com.backend.backend.repository.product.custom.ProductRepositoryCustom;
import com.backend.backend.converter.product.ProductDTOConverter;
import com.backend.backend.converter.product.ProductSearchBuilderConverter;
import com.backend.backend.model.product.ProductDTO;
import com.backend.backend.repository.category.CategoryRepository;
import com.backend.backend.repository.category.entity.CategoryEntity;
import com.backend.backend.repository.product.ProductImageRepository;
import com.backend.backend.repository.product.ProductRepository;
import com.backend.backend.repository.product.SellerRepository;
import com.backend.backend.repository.product.entity.ProductEntity;
import com.backend.backend.repository.product.entity.ProductImageEntity;
import com.backend.backend.repository.product.entity.SellerEntity;
import com.backend.backend.service.product.ProductService;
import com.backend.backend.utils.ImageUtil;
import com.backend.backend.utils.exception.DuplicateRecordException;
import com.backend.backend.utils.exception.ResourceNotFoundException;

@Service
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductSearchBuilderConverter productSearchBuilderConverter;

    @Autowired
    private ProductRepositoryCustom productRepositoryCustom;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private ProductDTOConverter productDTOConverter;

    @Override
    public List<ProductDTO> getProduct(Map<String, Object> params) {
        // ❌ VULNERABLE: Dùng ProductRepositoryCustom (string concatenation)
        // → Union-based SQLi, Time-based Blind SQLi
        ProductSearchBuilder productSearchBuilder = productSearchBuilderConverter.paramsToBuilder(params);

        // Lấy sortBy từ params cho ORDER BY injection
        String sortBy = params.get("sortBy") != null ? params.get("sortBy").toString() : null;

        return productRepositoryCustom.getProduct(productSearchBuilder, sortBy);
    }

    @Override
    @Transactional
    public ProductDTO createProduct(Map<String, Object> body) {
        ProductSearchBuilder productSearchBuilder = productSearchBuilderConverter.bodyToBuilder(body);
        if (productRepository.existsByTitleAndDeletedFalse(productSearchBuilder.getTitle())) {
            throw new DuplicateRecordException("Product with name '" + productSearchBuilder.getTitle() + "' already " +
                    "existed");
        }

        ProductEntity productEntity = new ProductEntity();
        productEntity.setTitle(productSearchBuilder.getTitle());
        productEntity.setProduct_info(productSearchBuilder.getProductInfo());
        productEntity.setPrice(productSearchBuilder.getPrice());
        productEntity.setStock(productSearchBuilder.getStock());
        productEntity.setCreated_at(LocalDateTime.now());
        productEntity.setUpdated_at(LocalDateTime.now());
        productEntity.setDeleted(false);

        SellerEntity seller = sellerRepository.findBySellerName(productSearchBuilder.getSellerName());
        if (seller == null) {
            seller = new SellerEntity();
            seller.setSeller_name(productSearchBuilder.getSellerName());
            seller.setSeller_info("Auto-created seller");
            seller = sellerRepository.save(seller);
        }
        productEntity.setSeller(seller);

        CategoryEntity category = categoryRepository.findByCateName(productSearchBuilder.getCategoryName());
        if (category == null) {
            category = new CategoryEntity();
            category.setCate_name(productSearchBuilder.getCategoryName());
            category = categoryRepository.save(category);
        }
        productEntity.setCategory(category);

        if (productSearchBuilder.getImages() != null && !productSearchBuilder.getImages().isEmpty()) {
            List<ProductImageEntity> imageEntities = new ArrayList<>();

            for (String base64Image : productSearchBuilder.getImages()) {
                if (base64Image != null && !base64Image.isEmpty()) {
                    String imagePath = ImageUtil.saveImage(base64Image);

                    ProductImageEntity imageEntity = new ProductImageEntity();
                    imageEntity.setImage_path(imagePath);
                    imageEntity.setProduct(productEntity);
                    imageEntities.add(imageEntity);
                }
            }

            productEntity.setImages(imageEntities);
        }

        ProductEntity savedProduct = productRepository.save(productEntity);

        return productDTOConverter.toProductDTO(savedProduct);
    }

    @Override
    @Transactional
    public List<ProductDTO> createListProducts(List<Map<String, Object>> bodyList) {
        List<ProductEntity> entitiesToProcess = new ArrayList<>();

        for (Map<String, Object> body : bodyList) {
            ProductSearchBuilder builder = productSearchBuilderConverter.bodyToBuilder(body);
            String title = builder.getTitle();

            Optional<ProductEntity> existingProductOpt = productRepository.findByTitleIncludeDeleted(title);

            if (existingProductOpt.isPresent()) {
                ProductEntity existingProduct = existingProductOpt.get();

                if (existingProduct.getDeleted()) {
                    existingProduct.setProduct_info(builder.getProductInfo());
                    existingProduct.setPrice(builder.getPrice());
                    existingProduct.setStock(builder.getStock());
                    existingProduct.setDeleted(false);
                    existingProduct.setUpdated_at(LocalDateTime.now());

                    CategoryEntity category = categoryRepository.findByCateName(builder.getCategoryName());
                    if (category == null) {
                        category = new CategoryEntity();
                        category.setCate_name(builder.getCategoryName());
                        category = categoryRepository.save(category);
                    }
                    existingProduct.setCategory(category);

                    SellerEntity seller = sellerRepository.findBySellerName(builder.getSellerName());
                    if (seller == null) {
                        seller = new SellerEntity();
                        seller.setSeller_name(builder.getSellerName());
                        seller = sellerRepository.save(seller);
                    }
                    existingProduct.setSeller(seller);

                    existingProduct.getImages().clear();
                    if (builder.getImages() != null && !builder.getImages().isEmpty()) {
                        List<ProductImageEntity> newImages = new ArrayList<>();
                        for (String base64Image : builder.getImages()) {
                            String imagePath = ImageUtil.saveImage(base64Image);
                            ProductImageEntity imageEntity = new ProductImageEntity();
                            imageEntity.setImage_path(imagePath);
                            imageEntity.setProduct(existingProduct);
                            newImages.add(imageEntity);
                        }
                        existingProduct.getImages().addAll(newImages);
                    }

                    entitiesToProcess.add(existingProduct);

                } else {
                    throw new DuplicateRecordException("Product with name '" + title + "' already existed!");
                }

            } else {
                ProductEntity newProduct = new ProductEntity();
                newProduct.setTitle(title);
                newProduct.setProduct_info(builder.getProductInfo());
                newProduct.setPrice(builder.getPrice());
                newProduct.setStock(builder.getStock());
                newProduct.setCreated_at(LocalDateTime.now());
                newProduct.setUpdated_at(LocalDateTime.now());
                newProduct.setDeleted(false);

                CategoryEntity category = categoryRepository.findByCateName(builder.getCategoryName());
                if (category == null) {
                    category = new CategoryEntity();
                    category.setCate_name(builder.getCategoryName());
                    category = categoryRepository.save(category);
                }
                newProduct.setCategory(category);

                SellerEntity seller = sellerRepository.findBySellerName(builder.getSellerName());
                if (seller == null) {
                    seller = new SellerEntity();
                    seller.setSeller_name(builder.getSellerName());
                    seller = sellerRepository.save(seller);
                }
                newProduct.setSeller(seller);

                if (builder.getImages() != null && !builder.getImages().isEmpty()) {
                    List<ProductImageEntity> imageEntities = new ArrayList<>();
                    for (String base64Image : builder.getImages()) {
                        String imagePath = ImageUtil.saveImage(base64Image);
                        ProductImageEntity imageEntity = new ProductImageEntity();
                        imageEntity.setImage_path(imagePath);
                        imageEntity.setProduct(newProduct);
                        imageEntities.add(imageEntity);
                    }
                    newProduct.setImages(imageEntities);
                }
                entitiesToProcess.add(newProduct);
            }
        }

        List<ProductEntity> savedEntities = productRepository.saveAll(entitiesToProcess);

        List<ProductDTO> resultDTOs = new ArrayList<>();
        for (ProductEntity savedEntity : savedEntities) {
            resultDTOs.add(productDTOConverter.toProductDTO(savedEntity));
        }
        return resultDTOs;
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Integer id, Map<String, Object> body) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        if (body.containsKey("title")) {
            product.setTitle((String) body.get("title"));
        }
        if (body.containsKey("product_info")) {
            product.setProduct_info((String) body.get("product_info"));
        }
        if (body.containsKey("price")) {
            product.setPrice((Integer) body.get("price"));
        }
        if (body.containsKey("stock")) {
            product.setStock((Integer) body.get("stock"));
        }
        if (body.containsKey("cate_name")) {
            String categoryName = (String) body.get("cate_name");
            CategoryEntity category = categoryRepository.findByCateName(categoryName);
            if (category == null) {
                category = new CategoryEntity();
                category.setCate_name(categoryName);
                category = categoryRepository.save(category);
            }
            product.setCategory(category);
        }
        if (body.containsKey("seller_name")) {
            String sellerName = (String) body.get("seller_name");
            SellerEntity seller = sellerRepository.findBySellerName(sellerName);
            if (seller == null) {
                seller = new SellerEntity();
                seller.setSeller_name(sellerName);
                seller = sellerRepository.save(seller);
            }
            product.setSeller(seller);
        }

        if (body.containsKey("images")) {
            product.getImages().clear();

            List<String> base64Images = (List<String>) body.get("images");
            if (base64Images != null && !base64Images.isEmpty()) {
                List<ProductImageEntity> newImages = new ArrayList<>();
                for (String base64Image : base64Images) {
                    String imagePath = ImageUtil.saveImage(base64Image);
                    ProductImageEntity imageEntity = new ProductImageEntity();
                    imageEntity.setImage_path(imagePath);
                    imageEntity.setProduct(product);
                    newImages.add(imageEntity);
                }
                product.getImages().addAll(newImages);
            }
        }

        product.setUpdated_at(LocalDateTime.now());
        ProductEntity updatedProduct = productRepository.save(product);

        return productDTOConverter.toProductDTO(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Integer id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> searchProductsForChatbot(Map<String, Object> aiParams) {
        // ❌ VULNERABLE: Chatbot search cũng dùng custom repo (string concat)
        ProductSearchBuilder builder = new ProductSearchBuilder.Builder()
                .setTitle(aiParams.get("keywords") != null ? aiParams.get("keywords").toString() : null)
                .setSellerName(aiParams.get("sellerName") != null ? aiParams.get("sellerName").toString() : null)
                .setMinPrice(aiParams.get("minPrice") != null ? Integer.parseInt(aiParams.get("minPrice").toString()) : null)
                .setMaxPrice(aiParams.get("maxPrice") != null ? Integer.parseInt(aiParams.get("maxPrice").toString()) : null)
                .build();
        return productRepositoryCustom.getProduct(builder, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getTopBestSellerProducts(int limit) {
        if (limit <= 0) {
            limit = 10; // default nếu FE không truyền hoặc truyền bậy
        }

        // 1. Lấy list productId đã sort theo số user mua giảm dần
        List<com.backend.backend.model.product.BestSellerIdOnly> bestIds =
                productRepository.findBestSellerIds();

        // 2. Cắt top N id
        List<Integer> ids = bestIds.stream()
                .map(com.backend.backend.model.product.BestSellerIdOnly::getProductId)
                .limit(limit)
                .toList();

        if (ids.isEmpty()) {
            return new ArrayList<>();
        }

        // 3. Lấy full ProductEntity theo id
        List<ProductEntity> entities = productRepository.findAllById(ids);

        // 4. Đưa về map để giữ đúng thứ tự best-seller
        Map<Integer, ProductDTO> dtoMap = new java.util.HashMap<>();
        for (ProductEntity entity : entities) {
            dtoMap.put(entity.getId(), productDTOConverter.toProductDTO(entity));
        }

        // 5. Trả list DTO theo đúng thứ tự ids (bán chạy nhất → ít hơn)
        List<ProductDTO> result = new ArrayList<>();
        for (Integer id : ids) {
            ProductDTO dto = dtoMap.get(id);
            if (dto != null) {
                result.add(dto);
            }
        }

        return result;
    }

        @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getTopRatedProducts(int limit) {
        if (limit <= 0) {
            limit = 10; // default
        }

        // 1. Lấy danh sách productId đã sort theo avg star giảm dần
        List<com.backend.backend.model.product.BestRatedIdOnly> bestIds =
                productRepository.findBestRatedIds();

        // 2. Cắt top N id
        List<Integer> ids = bestIds.stream()
                .map(com.backend.backend.model.product.BestRatedIdOnly::getProductId)
                .limit(limit)
                .toList();

        if (ids.isEmpty()) {
            return new ArrayList<>();
        }

        // 3. Lấy full ProductEntity theo id
        List<ProductEntity> entities = productRepository.findAllById(ids);

        // 4. Đưa vào map để khôi phục đúng thứ tự theo ids
        java.util.Map<Integer, ProductDTO> dtoMap = new java.util.HashMap<>();
        for (ProductEntity entity : entities) {
            dtoMap.put(entity.getId(), productDTOConverter.toProductDTO(entity));
        }

        // 5. Trả kết quả theo đúng thứ tự top-rated
        List<ProductDTO> result = new ArrayList<>();
        for (Integer id : ids) {
            ProductDTO dto = dtoMap.get(id);
            if (dto != null) {
                result.add(dto);
            }
        }

        return result;
    }


}
