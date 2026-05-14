package com.backend.backend.converter.product;

import com.backend.backend.builder.product.ProductSearchBuilder;
import com.backend.backend.utils.MapUtil;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ProductSearchBuilderConverter {
    public ProductSearchBuilder paramsToBuilder(Map<String, Object> params) {
        return new ProductSearchBuilder.Builder()
                .setId(MapUtil.getObject(params, "id", Integer.class))
                .setCategoryName(MapUtil.getObject(params, "category_name", String.class))
                .setMinPrice(MapUtil.getObject(params, "minPrice", Integer.class))
                .setMaxPrice(MapUtil.getObject(params, "maxPrice", Integer.class))
                .setProductInfo(MapUtil.getObject(params, "product_info", String.class))
                .setSellerName(MapUtil.getObject(params, "seller_name", String.class))
                .setTitle(MapUtil.getObject(params, "title", String.class))
                .setStartTime(MapUtil.getObject(params, "start_time", String.class))
                .setEndTime(MapUtil.getObject(params, "end_time", String.class))
                .setMinStock(MapUtil.getObject(params, "min_stock", Integer.class))
                .setMaxStock(MapUtil.getObject(params, "max_stock", Integer.class))
                .build();
    }

    public ProductSearchBuilder bodyToBuilder(Map<String, Object> body) {
        return new ProductSearchBuilder.Builder()
                .setSellerName(MapUtil.getObject(body, "seller_name", String.class))
                .setCategoryName(MapUtil.getObject(body, "cate_name", String.class))
                .setTitle(MapUtil.getObject(body, "title", String.class))
                .setProductInfo(MapUtil.getObject(body, "product_info", String.class))
                .setPrice(MapUtil.getObject(body, "price", Integer.class))
                .setStock(MapUtil.getObject(body, "stock", Integer.class))
                .setImages((List<String>) body.get("images"))
                .build();
    }
}
