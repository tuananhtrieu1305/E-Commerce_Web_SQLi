package com.backend.backend.repository.order.custom.impl;

import com.backend.backend.builder.order.OrderItemSearchBuilder;
import com.backend.backend.builder.order.OrderSearchBuilder;
import com.backend.backend.model.order.OrderDTO;
import com.backend.backend.model.order.OrderItemDTO;
import com.backend.backend.repository.account.UserRepository;
import com.backend.backend.repository.account.entity.UserEntity;
import com.backend.backend.repository.order.custom.OrderRepositoryCustom;
import com.backend.backend.repository.order.entity.OrderEntity;
import com.backend.backend.repository.order.entity.OrderItemEntity;
import com.backend.backend.repository.product.ProductRepository;
import com.backend.backend.repository.product.entity.ProductEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

// ============================================================
// ✅ SECURE: Parameterized Queries — chống SQL Injection
// Tất cả user input được truyền qua setParameter(), KHÔNG concat chuỗi
// ============================================================
@Repository
public class OrderRepositoryImpl implements OrderRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public List<OrderDTO> getOrder(OrderSearchBuilder builder) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT o.id, o.user_id, o.total_cost, o.address, o.phone, o.note, "
                + "o.created_at, o.updated_at, u.fullname as customer_name, "
                + "oi.id as item_id, oi.prod_id, oi.item_quantity, oi.item_price, "
                + "p.title as product_title, "
                + "pm.status as payment_status, pm.method as payment_method "
                + "FROM orders o "
                + "LEFT JOIN users u ON o.user_id = u.id "
                + "LEFT JOIN order_items oi ON o.id = oi.order_id "
                + "LEFT JOIN products p ON oi.prod_id = p.id "
                + "LEFT JOIN payments pm ON o.id = pm.order_id ");

        StringBuilder where = new StringBuilder("WHERE o.deleted = false ");
        Map<String, Object> paramMap = new LinkedHashMap<>();

        // ✅ Parameterized: user input → :param → setParameter()
        if (builder.getId() != null) {
            where.append("AND o.id = :id ");
            paramMap.put("id", builder.getId());
        }
        if (builder.getCustomer_id() != null) {
            where.append("AND o.user_id = :customerId ");
            paramMap.put("customerId", builder.getCustomer_id());
        }
        if (builder.getAddress() != null && !builder.getAddress().isEmpty()) {
            where.append("AND o.address LIKE :address ");
            paramMap.put("address", "%" + builder.getAddress() + "%");
        }
        if (builder.getPhone() != null && !builder.getPhone().isEmpty()) {
            where.append("AND o.phone LIKE :phone ");
            paramMap.put("phone", "%" + builder.getPhone() + "%");
        }
        if (builder.getCustomer_name() != null && !builder.getCustomer_name().isEmpty()) {
            where.append("AND u.fullname LIKE :customerName ");
            paramMap.put("customerName", "%" + builder.getCustomer_name() + "%");
        }
        if (builder.getStartTime() != null && !builder.getStartTime().isEmpty()) {
            where.append("AND DATE(o.created_at) >= :startTime ");
            paramMap.put("startTime", builder.getStartTime());
        }
        if (builder.getEndTime() != null && !builder.getEndTime().isEmpty()) {
            where.append("AND DATE(o.created_at) <= :endTime ");
            paramMap.put("endTime", builder.getEndTime());
        }
        if (builder.getMin_cost() != null) {
            where.append("AND o.total_cost >= :minCost ");
            paramMap.put("minCost", builder.getMin_cost());
        }
        if (builder.getMax_cost() != null) {
            where.append("AND o.total_cost <= :maxCost ");
            paramMap.put("maxCost", builder.getMax_cost());
        }
        if (builder.getPayment_status() != null && !builder.getPayment_status().isEmpty()) {
            where.append("AND pm.status = :paymentStatus ");
            paramMap.put("paymentStatus", builder.getPayment_status());
        }

        sql.append(where);
        sql.append(" ORDER BY o.created_at DESC, oi.id ASC");

        Query query = entityManager.createNativeQuery(sql.toString());

        // ✅ Bind tất cả parameter an toàn
        paramMap.forEach(query::setParameter);

        List<Object[]> results = query.getResultList();
        Map<Integer, OrderDTO> orderMap = new LinkedHashMap<>();

        for (Object[] row : results) {
            Integer orderId = (Integer) row[0];
            OrderDTO order = orderMap.get(orderId);
            if (order == null) {
                order = new OrderDTO();
                order.setId(orderId);
                order.setCustomer_id((Integer) row[1]);
                order.setTotal_cost((Integer) row[2]);
                order.setAddress((String) row[3]);
                order.setPhone((String) row[4]);
                order.setNote((String) row[5]);
                order.setCreated_at(row[6] != null ? ((Timestamp) row[6]).toLocalDateTime() : null);
                order.setUpdated_at(row[7] != null ? ((Timestamp) row[7]).toLocalDateTime() : null);
                order.setCustomer_name((String) row[8]);
                order.setOrder_items(new ArrayList<>());

                String paymentStatus = (String) row[14];
                if (paymentStatus != null) {
                    order.setPayment_status(paymentStatus);
                } else {
                    order.setPayment_status("PENDING");
                }

                orderMap.put(orderId, order);
            }
            if (row[9] != null) {
                OrderItemDTO item = new OrderItemDTO();
                item.setId((Integer) row[9]);
                item.setProd_id((Integer) row[10]);
                item.setItem_quantity((Integer) row[11]);
                item.setItem_price((Integer) row[12]);
                item.setProduct_name((String) row[13]);

                if (item.getItem_quantity() != null && item.getItem_price() != null) {
                    item.setTotal_price(item.getItem_quantity() * item.getItem_price());
                }

                order.getOrder_items().add(item);
            }
        }
        return new ArrayList<>(orderMap.values());
    }

    @Override
    public OrderEntity createOrder(OrderSearchBuilder orderSearchBuilder) {
        UserEntity user = userRepository.findById(orderSearchBuilder.getCustomer_id())
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setAddress(orderSearchBuilder.getAddress());
        order.setPhone(orderSearchBuilder.getPhone());
        order.setNote(orderSearchBuilder.getNote());
        order.setCreated_at(LocalDateTime.now());
        order.setUpdated_at(LocalDateTime.now());

        int totalCost = 0;
        List<OrderItemEntity> orderItems = new ArrayList<>();

        for (OrderItemSearchBuilder itemRequest : orderSearchBuilder.getOrder_items()) {
            ProductEntity product = productRepository.findById(itemRequest.getProd_id())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Sản phẩm " + product.getTitle() + " không đủ số lượng trong kho"
                );
            }

            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setItem_quantity(itemRequest.getQuantity());
            orderItem.setItem_price(product.getPrice());

            totalCost += product.getPrice() * itemRequest.getQuantity();
            orderItems.add(orderItem);
        }

        order.setTotal_cost(totalCost);

        OrderEntity savedOrder = entityManager.merge(order);

        for (OrderItemEntity orderItem : orderItems) {
            orderItem.setOrder(savedOrder);
            entityManager.persist(orderItem);
        }

        savedOrder.setOrderItems(orderItems);

        return savedOrder;
    }
}
