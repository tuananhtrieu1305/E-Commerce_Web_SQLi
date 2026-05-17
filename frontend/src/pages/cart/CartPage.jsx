import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext.jsx";
import { Empty, Button, Spin, message } from "antd"; // Nhớ import message từ antd
import { Link, useSearchParams, useNavigate } from "react-router-dom"; // Thêm useNavigate
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  Shield,
  TrendingUp,
  Gift,
  ArrowLeft,
} from "lucide-react"; // Thêm ArrowLeft
import { STATIC_URL } from "../../utils/config";

export default function CartPage() {
  const {
    items,
    loading,
    fetchCart,
    error,
    setItemQuantity,
    removeItem,
    formatCurrency,
    cartCount,
    subtotal,
  } = useCart();

  const navigate = useNavigate(); // Hook chuyển trang
  const [selectedItems, setSelectedItems] = useState(items.map((i) => i.id));
  const isSelected = (id) => selectedItems.includes(id);
  const [searchParams] = useSearchParams();

  // Load lại dữ liệu mỗi khi vào trang
  useEffect(() => {
    fetchCart();
  }, []);

  // Logic chọn sản phẩm từ URL (Mua ngay)
  useEffect(() => {
    const buyNowId = searchParams.get("buy_now");
    if (buyNowId && items.length > 0) {
      const targetItem = items.find(
        (item) => item.productId === Number(buyNowId)
      );
      if (targetItem) {
        setSelectedItems([targetItem.id]);
      }
    }
  }, [searchParams, items]);

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((i) => i.id));
    }
  };

  const handleQuantityChange = (item, newQty) => {
    let quantity = parseInt(newQty, 10);
    if (isNaN(quantity)) quantity = 1;
    if (quantity < 1) quantity = 1;
    if (quantity > 99) {
      quantity = 99;
      message.warning("Số lượng tối đa là 99");
    }
    // Check tồn kho (nếu item có trường stock)
    if (item.stock && quantity > item.stock) {
      message.warning(`Kho chỉ còn ${item.stock} sản phẩm!`);
      quantity = item.stock;
    }
    if (quantity !== item.quantity) {
      setItemQuantity(item.productId, quantity);
    }
  };

  // Trang giỏ hàng rỗng
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
            <ShoppingCart className="w-12 h-12 text-blue-600" />
          </div>
          <Empty description="Giỏ hàng của bạn đang rỗng" />
          <Link to="/">
            <Button type="primary" className="mt-4 bg-blue-600">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                title="Trở về trang chủ"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
              </button>

              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg hidden sm:block">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Giỏ hàng của bạn
                </h1>
                <p className="text-sm text-gray-500">{items.length} sản phẩm</p>
              </div>
            </div>

            {/* Nút Tiếp tục mua sắm (phụ) bên phải cho tiện */}
            <Link
              to="/"
              className="hidden sm:block text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>

      {/* Features Bar (Giữ nguyên) */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Miễn phí vận chuyển</p>
                <p className="text-sm font-semibold text-gray-800">
                  Đơn từ 500k
                </p>
              </div>
            </div>
            {/* ... các feature khác giữ nguyên ... */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Thanh toán</p>
                <p className="text-sm font-semibold text-gray-800">
                  100% an toàn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Hỗ trợ</p>
                <p className="text-sm font-semibold text-gray-800">24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Gift className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ưu đãi</p>
                <p className="text-sm font-semibold text-gray-800">Đặc biệt</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Select All */}
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedItems.length === items.length}
              onChange={toggleAll}
              className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer"
            />
            <span className="ml-3 text-gray-700 font-medium group-hover:text-blue-600 transition-colors">
              Chọn tất cả ({selectedItems.length}/{items.length} sản phẩm)
            </span>
          </label>

          {/* Nút xóa đã chọn */}
          {selectedItems.length > 0 && (
            <Button
              type="link"
              danger
              onClick={() => {
                // Logic xóa nhiều (nếu có API)
                // selectedItems.forEach(id => removeItem(items.find(i => i.id === id).productId));
              }}
            >
              Xóa đã chọn ({selectedItems.length})
            </Button>
          )}
        </div>

        <div className="lg:flex lg:gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group"
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer"
                      />
                    </div>

                    {/* Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={`${STATIC_URL}${
                            item.image
                          }`}
                          alt={`Ảnh sản phẩm ${item.productId}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.productTitle}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        Mã sản phẩm: #{item.productId}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Đơn giá:{" "}
                          <span className="font-semibold text-gray-800">
                            {formatCurrency(item.unitPrice)}
                          </span>
                        </span>
                        <Button
                          type="link"
                          danger
                          size="small"
                          onClick={() => removeItem(item.productId)}
                          className="p-0 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg"
                          icon={<Trash2 className="w-4 h-4" />}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border border-gray-200">
                        <button
                          onClick={() =>
                            handleQuantityChange(item, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || loading}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          max="99"
                          onChange={(e) =>
                            handleQuantityChange(item, e.target.value)
                          }
                          disabled={loading}
                          className="w-12 text-center font-semibold text-gray-800 bg-transparent focus:outline-none border-0"
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(item, item.quantity + 1)
                          }
                          disabled={item.quantity >= 99 || loading}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="text-right mt-2">
                        <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatCurrency(item.lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-32">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-xl font-bold text-white">Tổng đơn hàng</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">
                    Tổng ({selectedItems.length} sản phẩm)
                  </span>
                  <span className="text-lg font-semibold text-gray-800">
                    {formatCurrency(
                      items
                        .filter((i) => isSelected(i.id))
                        .reduce((acc, i) => acc + i.lineTotal, 0)
                    )}
                  </span>
                </div>

                <Link
                  to={`/checkout?selected=${items
                    .filter((i) => selectedItems.includes(i.id))
                    .map((i) => i.productId)
                    .join(",")}`}
                >
                  <Button
                    type="primary"
                    size="large"
                    block
                    disabled={selectedItems.length === 0 || loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 h-12 text-lg font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  >
                    Tiến hành Thanh toán
                  </Button>
                </Link>

                {loading && (
                  <div className="text-center mt-4 text-gray-500">
                    <Spin size="small" /> Đang cập nhật...
                  </div>
                )}

                {/* Trust Badges */}
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>Thanh toán được bảo mật 100%</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Package className="w-5 h-5 text-blue-500" />
                    <span>Miễn phí đổi trả trong 30 ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
