package com.backend.backend.repository.cart;

import com.backend.backend.repository.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem,Integer> {

    Optional<CartItem> findByCart_UserIdAndProductId(Integer userId, Integer productId);
//    Optional<CartItem> findByPrpAndCart_UserId(Integer itemId, Integer userId);

}
