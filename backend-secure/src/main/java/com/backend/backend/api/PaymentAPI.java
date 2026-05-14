package com.backend.backend.api;

import com.backend.backend.service.payment.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentAPI {

    @Autowired
    private PaymentService paymentService;

    @PostMapping(value = "/create-vnpay", produces = "application/json")
    public Map<String, String> createVnpay(@RequestBody Map<String, Object> body, HttpServletRequest request) throws Exception {
        Integer orderId = (Integer) body.get("orderId");
        String url = paymentService.createVnpayPaymentUrl(orderId, request);
        return Map.of("paymentUrl", url);
    }


    @GetMapping("/vnpay-return")
    public void vnpayReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {

        Map<String, Object> result = paymentService.handleReturn(params);

        String status = (String) result.get("status");
        String orderId = String.valueOf(result.get("orderId"));


        String frontendUrl = "http://localhost:3000/payment-result";

        if ("success".equals(status)) {
            response.sendRedirect(frontendUrl + "?status=success&orderId=" + orderId);
        } else {
            response.sendRedirect(frontendUrl + "?status=failed&orderId=" + orderId);
        }
    }


    @GetMapping("/vnpay-ipn")
    public String vnpayIpn(@RequestParam Map<String, String> params) {
        return paymentService.handleIpn(params);
    }
}
