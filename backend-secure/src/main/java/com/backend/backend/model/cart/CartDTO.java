package com.backend.backend.model.cart;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CartDTO {
    private Integer id ;
    private Integer userId;
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal grandTotal;

    @Builder.Default
    private List<CartItemDTO> items = new ArrayList<>();

}
