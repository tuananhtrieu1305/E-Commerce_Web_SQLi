package com.backend.backend.converter.order;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.backend.backend.builder.order.OrderItemSearchBuilder;
import com.backend.backend.builder.order.OrderSearchBuilder;
import com.backend.backend.utils.MapUtil;

@Component
public class OrderSearchBuilderConverter {
    public OrderSearchBuilder paramsToBuilder(Map<String, Object> params) {
        return new OrderSearchBuilder.Builder()
                .setId(MapUtil.getObject(params, "id", Integer.class))
                .setCustomer_name(MapUtil.getObject(params, "customer_name", String.class))
                .setAddress(MapUtil.getObject(params, "address", String.class))
                .setPhone(MapUtil.getObject(params, "phone", String.class))
                .setEndTime(MapUtil.getObject(params, "endTime", String.class))
                .setStartTime(MapUtil.getObject(params, "startTime", String.class))
                .setMax_cost(MapUtil.getObject(params, "max_cost", Integer.class))
                .setMin_cost(MapUtil.getObject(params, "min_cost", Integer.class))
                .setPayment_status(MapUtil.getObject(params, "payment_status", String.class))
                .build();
    }

    public OrderSearchBuilder bodyToBuilder(Map<String, Object> body) {
        OrderSearchBuilder.Builder builder = new OrderSearchBuilder.Builder()
                .setCustomer_id(MapUtil.getObject(body, "customer_id", Integer.class))
                .setAddress(MapUtil.getObject(body, "address", String.class))
                .setPhone(MapUtil.getObject(body, "phone", String.class))
                .setNote(MapUtil.getObject(body, "note", String.class));

        if (body.containsKey("order_items")) {
            List<Map<String, Object>> orderItems = (List<Map<String, Object>>) body.get("order_items");
            builder.setOrder_items(convertOrderItems(orderItems));
        }
        if (body.containsKey("payment_method")) {
            builder.setPaymentMethod(MapUtil.getObject(body, "payment_method", String.class));
        }

        return builder.build();
    }

    private List<OrderItemSearchBuilder> convertOrderItems(List<Map<String, Object>> orderItems) {
        if (orderItems == null) return null;

        return orderItems.stream()
                .map(item -> new OrderItemSearchBuilder.Builder()
                        .setProd_id(MapUtil.getObject(item, "prod_id", Integer.class))
                        .setQuantity(MapUtil.getObject(item, "quantity", Integer.class))
                        .build())
                .collect(Collectors.toList());
    }
}
