package com.backend.backend.model.cart;

import com.backend.backend.model.product.ProductDTO;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CartItemDTO {
    private Integer id;
    private Integer productId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private String productTitle;
    private String image;
   ;
}
