package com.backend.backend.repository.cart;

import com.backend.backend.repository.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart,Integer> {
    Optional<Cart> findByUserId(Integer userid);


}

