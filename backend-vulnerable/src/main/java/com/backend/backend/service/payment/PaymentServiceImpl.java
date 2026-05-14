package com.backend.backend.service.payment;

import com.backend.backend.repository.order.OrderRepository;
import com.backend.backend.repository.order.entity.OrderEntity;
import com.backend.backend.repository.payment.PaymentRepository;
import com.backend.backend.repository.payment.entity.PaymentEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;


    private final String vnp_TmnCode = "PXFB0ZOD";
    private final String vnp_HashSecret = "OZFKZOZJP9QN3UZOK12DDKG5ONKDCCCI";
    private final String vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    private final String returnUrl = "http://localhost:8081/api/payment/vnpay-return";

    @Override
    public String createVnpayPaymentUrl(Integer orderId, HttpServletRequest request) throws Exception {

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        long amount = order.getTotal_cost() * 100L;
        String ip = request.getRemoteAddr();


        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnp_TmnCode);
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", orderId + "_" + System.currentTimeMillis());
        params.put("vnp_OrderInfo", "Thanh toan don hang #" + orderId);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", ip);

        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        params.put("vnp_CreateDate", formatter.format(new Date()));

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String name : fieldNames) {
            String value = params.get(name);
            if (value != null && value.length() > 0) {
                hashData.append(name).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                hashData.append('&');

                query.append(URLEncoder.encode(name, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                query.append('&');
            }
        }


        if (hashData.length() > 0) hashData.setLength(hashData.length() - 1);
        if (query.length() > 0) query.setLength(query.length() - 1);

        String secureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
        System.out.println("VNPAY URL: " + vnp_Url + "?" + query + "&vnp_SecureHash=" + secureHash);
        return vnp_Url + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    @Override
    @Transactional
    public Map<String, Object> handleReturn(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            if (params.containsKey("vnp_SecureHash")) params.remove("vnp_SecureHash");
            if (params.containsKey("vnp_SecureHashType")) params.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            for (String name : fieldNames) {
                String value = params.get(name);
                if (value != null && value.length() > 0) {
                    hashData.append(name).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                    hashData.append('&');
                }
            }
            if (hashData.length() > 0) hashData.setLength(hashData.length() - 1);
            String signValue = hmacSHA512(vnp_HashSecret, hashData.toString());
            System.out.println("INPUT DATA: " + hashData.toString());
            System.out.println("MY SIGNATURE: " + signValue);
            System.out.println("VNPAY SIGNATURE: " + vnp_SecureHash);
            if (!signValue.equals(vnp_SecureHash)) {
                return Map.of("status", "error", "message", "Chữ ký không hợp lệ");
            }

            String responseCode = params.get("vnp_ResponseCode");
            String txnRef = params.get("vnp_TxnRef");
            String transactionId = params.get("vnp_TransactionNo");

            String[] parts = txnRef.split("_");
            Integer orderId = Integer.parseInt(parts[0]);

            PaymentEntity payment = paymentRepository.findByOrder_Id(orderId);
            if (payment == null) return Map.of("status", "error", "message", "Không tìm thấy Payment");

            Map<String, Object> result = new HashMap<>();
            result.put("orderId", orderId);

            if ("00".equals(responseCode)) {
                payment.setStatus("PAID");
                payment.setTransaction_id(transactionId);
                payment.setPaid_at(LocalDateTime.now());
                paymentRepository.save(payment);

                result.put("status", "success");
                result.put("message", "Thanh toán thành công");
            } else {
                payment.setStatus("FAILED");
                payment.setPaid_at(null);
                paymentRepository.save(payment);

                result.put("status", "failed");
                result.put("message", "Thanh toán thất bại");
            }
            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", "Lỗi Server: " + e.getMessage());
        }
    }


    @Override
    public String handleIpn(Map<String, String> params) {
        try {
            String responseCode = params.get("vnp_ResponseCode");
            String txnRef = params.get("vnp_TxnRef");

            String[] parts = txnRef.split("_");
            Integer orderId = Integer.parseInt(parts[0]);
            OrderEntity order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            PaymentEntity payment = order.getPayment();

            if ("00".equals(responseCode)) {
                payment.setStatus("PAID");
                payment.setPaid_at(LocalDateTime.now());
            } else {
                payment.setStatus("FAILED");
            }

            paymentRepository.save(payment);

            return "OK";
        } catch (Exception e) {
            return "ERROR";
        }
    }


    private String hmacSHA512(String key, String data) {
        try {
            Mac sha512Hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512Hmac.init(secretKeySpec);
            byte[] bytes = sha512Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }
}

