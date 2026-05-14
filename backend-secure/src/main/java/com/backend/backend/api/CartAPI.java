package com.backend.backend.api;

import com.backend.backend.model.cart.CartDTO;
import com.backend.backend.model.cart.CartItemDTO;
import com.backend.backend.service.cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class CartAPI {
    @Autowired
    private CartService cartService;
    @GetMapping(value = "/api/cart/")
    public List<CartItemDTO> getCart(@RequestParam Map<String, Object> params) {
        int userId = toInt(params.get("userId"));
        return cartService.getCart(userId);
    }


    @PostMapping(value = "/api/cart/items/")
    public CartDTO addItem(@RequestBody Map<String, Object> body) {
        int userId    = toInt(body.get("userId"));
        int productId = toInt(body.get("productId"));
        int qty       = toInt(body.get("qty"));
        return cartService.addItem(userId, productId, qty);
    }

    @PutMapping("/api/cart/items/{productId}/qty")
    public CartDTO setQty(@RequestParam("userId") Integer userId,
                          @PathVariable Integer productId,
                          @RequestBody Map<String, Object> body) {
        int qty = toInt(body.get("qty"));
        return cartService.setQty(userId, productId, qty);
    }

    @DeleteMapping("/api/cart/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeItem( @RequestParam("userId") Integer userId,
                            @PathVariable Integer itemId
                          ) {
        cartService.removeItem(userId, itemId);
    }

    private int toInt(Object v) {
        return Integer.parseInt(String.valueOf(v));
    }
}
