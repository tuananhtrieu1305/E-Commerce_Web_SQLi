package com.backend.backend.converter.account;

import com.backend.backend.builder.account.AccountSearchBuilder;
import com.backend.backend.utils.MapUtil;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Component
public class AccountSearchBuilderConverter {
    public AccountSearchBuilder paramsToBuilder(Map<String, Object> params) {
        return new AccountSearchBuilder.Builder()
                .setId(MapUtil.getObject(params, "id", Integer.class))
                .setUsername(MapUtil.getObject(params, "username", String.class))
                .setEmail(MapUtil.getObject(params, "email", String.class))
                .setRole(MapUtil.getObject(params, "role", String.class))
                .setCreated_at(MapUtil.getObject(params, "created_at", LocalDateTime.class))
                .setUpdated_at(MapUtil.getObject(params, "updated_at", LocalDateTime.class))
                .setFullname(MapUtil.getObject(params, "fullname", String.class))
                .setAddress(MapUtil.getObject(params, "address", String.class))
                .setStartTime(MapUtil.getObject(params, "startTime", String.class))
                .setEndTime(MapUtil.getObject(params, "endTime", String.class))
                .build();
    }

    public AccountSearchBuilder bodyToBuilderCreate(Map<String, Object> body) {
        return new AccountSearchBuilder.Builder()
                .setId(MapUtil.getObject(body, "id", Integer.class))
                .setUsername(MapUtil.getObject(body, "username", String.class))
                .setEmail(MapUtil.getObject(body, "email", String.class))
                .setRole(MapUtil.getObject(body, "role", String.class))
                .setPassword(MapUtil.getObject(body, "password", String.class))
                .build();
    }

    public AccountSearchBuilder bodyToBuilderUpdate(Map<String, Object> body) {
        return new AccountSearchBuilder.Builder()
                .setUsername(MapUtil.getObject(body, "username", String.class))
                .setEmail(MapUtil.getObject(body, "email", String.class))
                .setRole(MapUtil.getObject(body, "role", String.class))
                .setFullname(MapUtil.getObject(body, "fullname", String.class))
                .setAddress(MapUtil.getObject(body, "address", String.class))
                .setImage(MapUtil.getObject(body, "image", String.class))
                .build();
    }
}