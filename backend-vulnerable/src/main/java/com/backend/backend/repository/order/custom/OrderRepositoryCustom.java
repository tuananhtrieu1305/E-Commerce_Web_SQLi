package com.backend.backend.repository.order.custom;

import com.backend.backend.builder.order.OrderSearchBuilder;
import com.backend.backend.model.order.OrderDTO;
import com.backend.backend.repository.order.entity.OrderEntity;

import java.util.List;

public interface OrderRepositoryCustom {
    List<OrderDTO> getOrder(OrderSearchBuilder orderSearchBuilder);
    OrderEntity createOrder(OrderSearchBuilder orderSearchBuilder);
}
