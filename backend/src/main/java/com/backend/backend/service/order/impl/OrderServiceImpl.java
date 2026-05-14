package com.backend.backend.service.order.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.backend.builder.order.OrderItemSearchBuilder;
import com.backend.backend.builder.order.OrderSearchBuilder;
import com.backend.backend.converter.order.OrderDTOConverter;
import com.backend.backend.converter.order.OrderSearchBuilderConverter;
import com.backend.backend.model.order.OrderDTO;
import com.backend.backend.repository.account.UserRepository;
import com.backend.backend.repository.account.entity.UserEntity;
import com.backend.backend.repository.cart.CartRepository;
import com.backend.backend.repository.order.OrderItemRepository;
import com.backend.backend.repository.order.OrderRepository;
import com.backend.backend.repository.order.entity.OrderEntity;
import com.backend.backend.repository.order.entity.OrderItemEntity;
import com.backend.backend.repository.order.specification.OrderSpecification;
import com.backend.backend.repository.payment.PaymentRepository;
import com.backend.backend.repository.payment.entity.PaymentEntity;
import com.backend.backend.repository.product.ProductRepository;
import com.backend.backend.repository.product.entity.ProductEntity;
import com.backend.backend.service.order.OrderService;
import com.backend.backend.utils.exception.ResourceNotFoundException;

@Service
public class OrderServiceImpl implements OrderService {
    @Autowired
    private OrderSearchBuilderConverter orderSearchBuilderConverter;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderDTOConverter orderDTOConverter;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CartRepository cartRepository;

    @Override
    public List<OrderDTO> getOrder(Map<String, Object> params) {
        if (params.containsKey("customer_id")) {
            try {
                // Chuyển đổi an toàn sang số
                String userIdStr = String.valueOf(params.get("customer_id"));

                if (userIdStr != null && !userIdStr.equals("null") && !userIdStr.isEmpty()) {
                    Integer userId = Integer.parseInt(userIdStr);

                    // Gọi hàm tìm kiếm trực tiếp (Bỏ qua SearchBuilder)
                    List<OrderEntity> userOrders = orderRepository.findByUserId(
                            userId,
                            Sort.by(Sort.Direction.DESC, "id") // Mới nhất lên đầu
                    );

                    return orderDTOConverter.toOrderDTOList(userOrders);
                }
            } catch (Exception e) {
                // Nếu lỗi thì bỏ qua
            }
        }
        OrderSearchBuilder orderSearchBuilder = orderSearchBuilderConverter.paramsToBuilder(params);
        Specification<OrderEntity> spec = OrderSpecification.findByCriteria(orderSearchBuilder);
        List<OrderEntity> entities = orderRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "id"));
        return orderDTOConverter.toOrderDTOList(entities);}
   

    @Transactional
    @Override
    public OrderDTO createOrder(Map<String, Object> body) {
        OrderSearchBuilder builder = orderSearchBuilderConverter.bodyToBuilder(body);

        UserEntity user = userRepository.findById(builder.getCustomer_id())
                .orElseThrow(() -> new ResourceNotFoundException("User can not be found with ID: " + builder.getCustomer_id()));

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setAddress(builder.getAddress());
        order.setPhone(builder.getPhone());
        order.setNote(builder.getNote());
        order.setCreated_at(java.time.LocalDateTime.now());
        order.setUpdated_at(java.time.LocalDateTime.now());


        int totalCost = 0;
        List<OrderItemEntity> orderItems = new ArrayList<>();

        for (OrderItemSearchBuilder itemRequest : builder.getOrder_items()) {
            ProductEntity product = productRepository.findById(itemRequest.getProd_id())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemRequest.getProd_id()));

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalStateException("Product '" + product.getTitle() + "' doesn't have enough in stock.");
            }

            product.setStock(product.getStock() - itemRequest.getQuantity());

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setProduct(product);
            orderItem.setItem_quantity(itemRequest.getQuantity());
            orderItem.setItem_price(product.getPrice());
            orderItem.setOrder(order);

            orderItems.add(orderItem);

            totalCost += product.getPrice() * itemRequest.getQuantity();
        }

        order.setOrderItems(orderItems);
        order.setTotal_cost(totalCost);
        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        String method = builder.getPaymentMethod();
        if (method == null) method = "COD";

        if (method.equalsIgnoreCase("BANK")) {
            payment.setMethod("BANK");
            payment.setStatus("PENDING_PAYMENT");
        } else {
            payment.setMethod("COD");
            payment.setStatus("PENDING");
        }
        payment.setPaid_at(null);

        order.setPayment(payment);

        OrderEntity savedOrder = orderRepository.save(order);

        return orderDTOConverter.toOrderDTO(savedOrder);
    }

    @Transactional
    @Override
    public OrderDTO updateOrder(Integer id, Map<String, Object> body) {
        OrderSearchBuilder builder = orderSearchBuilderConverter.bodyToBuilder(body);

        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        if (order.getOrderItems() != null) {
            for (OrderItemEntity existingItem : order.getOrderItems()) {
                ProductEntity product = existingItem.getProduct();
                product.setStock(product.getStock() + existingItem.getItem_quantity());
            }
            order.getOrderItems().clear();
        }

        order.setAddress(builder.getAddress());
        order.setPhone(builder.getPhone());
        order.setNote(builder.getNote());
        order.setUpdated_at(java.time.LocalDateTime.now());

        int totalCost = 0;
        if (builder.getOrder_items() != null && !builder.getOrder_items().isEmpty()) {
            for (OrderItemSearchBuilder itemRequest : builder.getOrder_items()) {
                ProductEntity product = productRepository.findById(itemRequest.getProd_id())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found ID: " + itemRequest.getProd_id()));

                if (product.getStock() < itemRequest.getQuantity()) {
                    throw new IllegalStateException("Product '" + product.getTitle() + "' doesn't have enough in " +
                            "stock.");
                }

                product.setStock(product.getStock() - itemRequest.getQuantity());

                OrderItemEntity newOrderItem = new OrderItemEntity();
                newOrderItem.setProduct(product);
                newOrderItem.setItem_quantity(itemRequest.getQuantity());
                newOrderItem.setItem_price(product.getPrice());
                newOrderItem.setOrder(order);

                order.getOrderItems().add(newOrderItem);

                totalCost += product.getPrice() * itemRequest.getQuantity();
            }
        }

        order.setTotal_cost(totalCost);

        updatePaymentDetails(order, body);

        OrderEntity updatedOrder = orderRepository.save(order);

        return orderDTOConverter.toOrderDTO(updatedOrder);
    }

    @Transactional
    @Override
    public void deleteOrder(Integer id) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        if (order.getOrderItems() != null) {
            for (OrderItemEntity orderItem : order.getOrderItems()) {
                ProductEntity product = orderItem.getProduct();
                product.setStock(product.getStock() + orderItem.getItem_quantity());
            }
        }

        orderRepository.delete(order);
    }

    private void updatePaymentDetails(OrderEntity order, Map<String, Object> body) {
        if (!body.containsKey("payment_status") && !body.containsKey("payment_method")) {
            return;
        }

        PaymentEntity payment = order.getPayment();

        if (payment == null) {
            payment = new PaymentEntity();
            payment.setOrder(order);
            order.setPayment(payment);
        }

        boolean paymentUpdated = false;
        if (body.containsKey("payment_status")) {
            payment.setStatus((String) body.get("payment_status"));
            paymentUpdated = true;
        }
        if (body.containsKey("payment_method")) {
            payment.setMethod((String) body.get("payment_method"));
            paymentUpdated = true;
        }
        if (paymentUpdated) {
            payment.setPaid_at(LocalDateTime.now());
        }
    }
}
