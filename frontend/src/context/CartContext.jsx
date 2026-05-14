import React, { createContext, useContext, useState, useEffect, useCallback,useRef } from 'react';
import { getCart, apiRemoveItem,apiAddItem ,apiSetQty} from '../services/cartService';
import { getUserId } from '../utils/auth';
// 1. Tạo Context
const CartContext = createContext(null);

// 2. Tạo Provider Component
export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const debounceTimerRef = useRef(null);


    
    const userId = localStorage.getItem("user_id")

    // Định dạng tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    // Hàm tải giỏ hàng
    const fetchCart = useCallback(async () => {
      if (!userId) return;
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
        if (userId) {
            fetchCart();
        } else {
            setItems([]);
            setLoading(false); 
        }
    }, [userId, fetchCart]);

    const setItemQuantity = useCallback(
    (productId, newQty) => {
      if (!userId) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setLoading(true);

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity: newQty } : item
        )
      );

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const updatedCart = await apiSetQty(
            userId,
            productId,
            newQty
          );
          // 6. Cập nhật state với dữ liệu chuẩn từ server
          if (updatedCart && updatedCart.items) {
            setItems(updatedCart.items);
          } else {
            await fetchCart(); 
          }
        } catch (err) {
          message.error(err.message || "Lỗi cập nhật số lượng");
          await fetchCart();
        } finally {
          setLoading(false);
          debounceTimerRef.current = null;
        }
      }, 750); 
    },
    [userId, fetchCart] 
  );

    // Hàm xóa item
    const removeItem = async (itemId) => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            await apiRemoveItem(userId, itemId);
            await fetchCart();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        items,
        setItems,
        loading,
        error,
        fetchCart,
        setItemQuantity,
        removeItem,
        formatCurrency,
        cartCount: items.reduce((total, item) => total + (item.quantity || 0), 0),
        subtotal: items.reduce((total, item) => total + parseFloat(item.lineTotal || 0), 0),
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === null) {
        throw new Error('useCart phải được dùng bên trong CartProvider');
    }
    return context;
};

