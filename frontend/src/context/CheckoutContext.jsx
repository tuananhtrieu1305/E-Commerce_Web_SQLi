import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart } from "../services/cartService";
import { createOrder } from "../services/OrderAPI";

const CheckoutContext = createContext(null);

export const CheckoutProvider = ({ children }) => {
  const accountId = localStorage.getItem("account_id")
  const userId = localStorage.getItem("user_id")


  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cartItems = await getCart(userId);
      setItems(cartItems || []);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const totalCost = items.reduce(
    (sum, item) => sum + parseFloat(item.lineTotal || 0),
    0
  );

  const handleSubmitOrder = async (itemsToOrder, finalTotalCost) => {
    // 1. Chuẩn bị dữ liệu gửi đi (Payload)
    const payload = {
      customer_id: userId, // Lấy từ auth hoặc state
      phone: phone,        // Lấy từ state của Context
      address: address,    // Lấy từ state của Context
      note: note,          // Lấy từ state của Context
      total_cost: finalTotalCost,
      payment_method: paymentMethod, // Lấy từ state của Context
      
      // Map sản phẩm sang định dạng Backend yêu cầu
      order_items: itemsToOrder.map((item) => ({
        prod_id: item.productId, // Backend dùng prod_id
        quantity: item.quantity,
      })),
    };
    console.log(payload)

    try {
      // 2. Gọi API từ orderAPI.js
      const res = await createOrder(payload);

      // 3. XỬ LÝ KẾT QUẢ (Quan trọng)
      // Axios trả về object { data: ..., status: ... }
      // Ta cần lấy phần data thực sự để trả về (chứa id đơn hàng)
      const savedOrder = res.data || res;

      return savedOrder; 

    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error);
      // Trả về object báo lỗi để UI hiển thị
      return { status: 400, message: "Không thể tạo đơn hàng" };
    }
  };

  const value = {
    items,
    loading,
    error,
    phone,
    setPhone,
    address,
    setAddress,
    note,
    setNote,
    paymentMethod,
    setPaymentMethod,
    totalCost,
    fetchCart,
    handleSubmitOrder,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error("useCheckout must be used within CheckoutProvider");
  return context;
};
