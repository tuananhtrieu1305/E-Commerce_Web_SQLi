package com.backend.backend.converter.cart;

import com.backend.backend.model.cart.CartItemDTO;
import com.backend.backend.repository.cart.entity.CartItem;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;


@Component
public class CartItemDTOConverter {
    public CartItemDTO toDTO(CartItem i){
        if (i == null) return null;
        return CartItemDTO.builder()
                .id(i.getId())
                .productId(i.getProductId())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice() == null ? BigDecimal.ZERO : i.getUnitPrice())
                .lineTotal(i.getLineTotal() == null ? BigDecimal.ZERO : i.getLineTotal())
                .build();
    }
}
