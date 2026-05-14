package com.backend.backend.service.order;

import java.util.List;
import java.util.Map;

import com.backend.backend.model.order.OrderDTO;

public interface OrderService {
    List<OrderDTO> getOrder(Map<String, Object> params);
    OrderDTO createOrder( Map<String, Object> body);
    OrderDTO updateOrder(Integer id, Map<String, Object> body);
    void deleteOrder(Integer id);
}
