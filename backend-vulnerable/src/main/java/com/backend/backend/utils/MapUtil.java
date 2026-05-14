package com.backend.backend.utils;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

public class MapUtil {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static LocalDateTime parseLocalDateTime(Object obj) {
        if (obj instanceof LocalDateTime ldt) {
            return ldt;
        }
        if (obj instanceof Timestamp ts) {
            return ts.toLocalDateTime();
        }
        if (obj instanceof String str && !str.isEmpty()) {
            return LocalDateTime.parse(str, FORMATTER);
        }
        return null;
    }

    public static <T> T getObject(Map<String, Object> params, String key, Class<T> tClass) {
        Object obj = params.getOrDefault(key, null);
        if(obj != null) {
            obj = switch (tClass.getTypeName()) {
                case "java.lang.Long" -> obj != "" ? Long.valueOf(obj.toString()) : null;
                case "java.lang.Integer" -> obj != "" ? Integer.valueOf(obj.toString()) : null;
                case "java.lang.String" -> obj.toString();
                case "java.time.LocalDateTime" -> parseLocalDateTime(obj);
                default -> obj;
            };
            return tClass.cast(obj);
        }
        return null;
    }
}