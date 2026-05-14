package com.backend.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

@Configuration
public class RequestLoggingFilterConfig {

    @Bean
    public CommonsRequestLoggingFilter logFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
        filter.setIncludeQueryString(true);         // log query param
        filter.setIncludePayload(false);            // không log body để tránh spam
        filter.setIncludeHeaders(false);            // không log headers
        filter.setMaxPayloadLength(10000);
        filter.setAfterMessagePrefix("👉 REQUEST: ");
        return filter;
    }
}
