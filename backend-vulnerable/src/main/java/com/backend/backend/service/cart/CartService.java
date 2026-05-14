package com.backend.backend.service.cart;

import com.backend.backend.model.cart.CartDTO;
import com.backend.backend.model.cart.CartItemDTO;

import java.util.List;

public interface CartService {
    List<CartItemDTO> getCart(Integer userId);
    CartDTO addItem(Integer userId, Integer productId, int qty);
    CartDTO setQty(Integer userId, Integer productId, int qty);
    CartDTO removeItem(Integer userId,Integer productId);
}
