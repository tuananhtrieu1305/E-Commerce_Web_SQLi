package com.backend.backend.converter.auth;

import com.backend.backend.builder.auth.LoginBuilder;
import com.backend.backend.utils.MapUtil;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class LoginBuilderConverter {
    public LoginBuilder toBuilder(Map<String, Object> body) {
        return new LoginBuilder.Builder()
                .setUsername(MapUtil.getObject(body, "username", String.class))
                .setPassword(MapUtil.getObject(body, "password", String.class))
                .build();
    }
}