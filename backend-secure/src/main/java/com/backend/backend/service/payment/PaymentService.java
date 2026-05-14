package com.backend.backend.service.payment;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public interface PaymentService {

    String createVnpayPaymentUrl(Integer orderId, HttpServletRequest request) throws Exception;

    Map<String, Object> handleReturn(Map<String, String> params);

    String handleIpn(Map<String, String> params);
}
