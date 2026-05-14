package com.backend.backend.service.order;

import java.util.List;
import java.util.Map;

import com.backend.backend.model.order.OrderDTO;
import com.backend.backend.model.request.OrderCreateRequest;

public interface OrderService {
    List<OrderDTO> getOrder(Map<String, Object> params);
    OrderDTO createOrder( Map<String, Object> body);
    OrderDTO updateOrder(Integer id, Map<String, Object> body);
    void deleteOrder(Integer id);

    // ✅ SECURE: Method chấp nhận validated DTO thay vì raw Map
    OrderDTO createOrderFromRequest(OrderCreateRequest request);
}
