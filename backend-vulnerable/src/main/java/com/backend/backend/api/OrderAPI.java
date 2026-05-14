package com.backend.backend.api;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.model.order.OrderDTO;
import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.service.order.OrderService;

@RestController
@RequestMapping("/api/order")
public class OrderAPI {
    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getOrder(@RequestParam Map<String, Object> params) {
        List<OrderDTO> orders = orderService.getOrder(params);
        return ResponseEntity.ok(ApiResponse.success(orders, "Get order succeeded!"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> createOrder(@RequestBody Map<String, Object> body) {
        OrderDTO newOrder = orderService.createOrder(body);
        ApiResponse<OrderDTO> response = ApiResponse.success(newOrder, "Create order succeeded!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrder(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        OrderDTO updatedOrder = orderService.updateOrder(id, body);
        return ResponseEntity.ok(ApiResponse.success(updatedOrder, "Update order succeeded!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Integer id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Delete order succeeded!"));
    }
    
    @GetMapping("/history/{userId}")
    public List<OrderDTO> getOrderHistory(@PathVariable Integer userId,
                                          @RequestParam(required = false) Map<String, Object> params) {
        params.put("customer_id", userId);
        List<OrderDTO> res = orderService.getOrder(params);
        return res;
    }
}
