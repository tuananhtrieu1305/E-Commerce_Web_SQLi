package com.backend.backend.service.cart;

import com.backend.backend.converter.cart.CartDTOConverter;
import com.backend.backend.model.cart.CartDTO;
import com.backend.backend.model.cart.CartItemDTO;
import com.backend.backend.repository.cart.CartItemRepository;
import com.backend.backend.repository.cart.CartRepository;
import com.backend.backend.repository.cart.entity.Cart;
import com.backend.backend.repository.cart.entity.CartItem;
import com.backend.backend.repository.product.ProductRepository;
import com.backend.backend.repository.product.entity.ProductEntity;
import com.backend.backend.service.order.OrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final OrderService orderService;
    private final CartDTOConverter cartConv;

    private static final int MONEY_SCALE = 0;
    private static final RoundingMode MONEY_RM = RoundingMode.HALF_UP;

    private void populateImages(CartDTO cartDTO) {
        if (cartDTO == null || cartDTO.getItems() == null) return;

        for (CartItemDTO itemDTO : cartDTO.getItems()) {
            productRepo.findById(itemDTO.getProductId()).ifPresent(product -> {
                if (product.getImages() != null && !product.getImages().isEmpty()) {
                    itemDTO.setImage(product.getImages().get(0).getImage_path());
                }
            });
        }
    }

    private void reprice(Cart cart) {
        if (cart == null) return;
        BigDecimal subtotal = BigDecimal.ZERO;

        if (cart.getItems() != null) {
            for (CartItem i : cart.getItems()) {
                BigDecimal unit = i.getUnitPrice() == null ? BigDecimal.ZERO : i.getUnitPrice();
                int qty = (i.getQuantity() == null || i.getQuantity() < 0) ? 0 : i.getQuantity();

                BigDecimal line = unit.multiply(BigDecimal.valueOf(qty))
                        .setScale(MONEY_SCALE, MONEY_RM);

                i.setLineTotal(line);
                subtotal = subtotal.add(line);
            }
        }

        subtotal = subtotal.setScale(MONEY_SCALE, MONEY_RM);
        cart.setSubtotal(subtotal);
        cart.setGrandTotal(subtotal);
    }

    @Override
    public List<CartItemDTO> getCart(Integer userId) {
        Cart cart = cartRepo.findByUserId(userId)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUserId(userId);
                    return cartRepo.save(c);
                });

        CartDTO cartDTO = cartConv.toDTO(cart);
        populateImages(cartDTO);
        return cartDTO.getItems();
    }

    @Override
    public CartDTO addItem(Integer userId, Integer productId, int qty) {
        if (qty <= 0) throw new IllegalArgumentException("Quantity must be > 0");

        Cart cart = cartRepo.findByUserId(userId)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUserId(userId);
                    return cartRepo.save(c);
                });

        ProductEntity product = productRepo.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        if (qty > product.getStock()) {
            throw new IllegalStateException("Sản phẩm '" + product.getTitle() + "' chỉ còn lại " + product.getStock() + " cái trong kho.");
        }
        BigDecimal price = BigDecimal.valueOf(product.getPrice());
        int pid = productId;

        CartItem item = cart.getItems().stream()
                .filter(i -> pid == i.getProductId())
                .findFirst()
                .orElseGet(() -> {
                    CartItem it = new CartItem();
                    it.setCart(cart);
                    it.setProductId(pid);
                    it.setUnitPrice(price);
                    it.setQuantity(0);
                    cart.getItems().add(it);
                    return it;
                });

        item.setQuantity(qty);
        item.setLineTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

        reprice(cart);
        cartRepo.save(cart);

        CartDTO res = cartConv.toDTO(cart);
        populateImages(res);
        return res;
    }

    @Override
    public CartDTO setQty(Integer userId, Integer productId, int qty) {
        if (qty < 0) throw new IllegalArgumentException("Quantity must be ≥ 0");
        CartItem item = itemRepo.findByCart_UserIdAndProductId(userId, productId)
                .orElseThrow(() -> new EntityNotFoundException("Cart item not found"));
        Cart cart = item.getCart();
        ProductEntity product = productRepo.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        if (qty > product.getStock()) {
            throw new IllegalStateException("Số lượng yêu cầu vượt quá tồn kho (Còn lại: " + product.getStock() + ")");
        }
        if (qty == 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(qty);
            item.setLineTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(qty)));
        }
        reprice(cart);
        cartRepo.save(cart);

        CartDTO res = cartConv.toDTO(cart);
        populateImages(res);
        return res;
    }

    @Override
    public CartDTO removeItem(Integer userId, Integer itemId) {
        CartItem item = itemRepo.findByCart_UserIdAndProductId(userId, itemId)
                .orElseThrow(() -> new EntityNotFoundException("Cart item not found"));

        Cart cart = item.getCart();
        cart.getItems().remove(item);
        reprice(cart);

        CartDTO res = cartConv.toDTO(cartRepo.save(cart));
        populateImages(res);
        return res;
    }
}