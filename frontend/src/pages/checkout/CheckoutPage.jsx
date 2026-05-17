import React, { useState, useMemo } from "react";
import { useCheckout } from "../../context/CheckoutContext.jsx";
import { Input, Button, Spin, Empty, message, Radio } from "antd";
import { Link, useLocation } from "react-router-dom";
import { createVnpayPayment } from "../../services/OrderAPI.js";
import {
  MapPin,
  Phone,
  FileText,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Package,
  Gift,
} from "lucide-react";
import { STATIC_URL } from "../../utils/config";

export default function CheckoutPage() {
  const {
    items,
    loading,
    phone,
    setPhone,
    address,
    setAddress,
    note,
    setNote,
    paymentMethod,
    setPaymentMethod,
    handleSubmitOrder,
  } = useCheckout();

  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const selectedIds = query.get("selected")
    ? query
        .get("selected")
        .split(",")
        .map((id) => Number(id))
    : [];

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.includes(item.productId));
  }, [items, selectedIds]);

  const totalCost = selectedItems.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!address || !phone) {
      message.error("Vui lòng nhập đầy đủ địa chỉ và số điện thoại!");
      return;
    }

    setIsProcessing(true);
    try {
      const savedOrder = await handleSubmitOrder(
        selectedItems,
        totalCost,
        paymentMethod
      );

      if (!savedOrder || savedOrder.status >= 400 || !savedOrder.id) {
        throw new Error(
          savedOrder?.message || "Đặt hàng thất bại. Vui lòng thử lại."
        );
      }

      if (paymentMethod === "COD") {
        message.success("Đặt hàng thành công!");
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === "BANK") {
        const response = await createVnpayPayment(savedOrder.id);
        if (response?.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          throw new Error("Không thể lấy URL thanh toán VNPay.");
        }
      }
    } catch (err) {
      console.error("ERR:", err);
      message.error(err.message || "Có lỗi xảy ra khi đặt hàng");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
            <Package className="w-12 h-12 text-blue-600" />
          </div>
          <Empty
            description="Không có sản phẩm nào để thanh toán"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to="/cart">
              <Button
                type="primary"
                size="large"
                className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 mt-4"
              >
                Quay lại giỏ hàng
              </Button>
            </Link>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Thanh toán
                </h1>
                <p className="text-sm text-gray-500">
                  {selectedItems.length} sản phẩm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
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
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Giao hàng</p>
                <p className="text-sm font-semibold text-gray-800">
                  Nhanh chóng
                </p>
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
        <div className="lg:flex lg:gap-8">
          {/* Left Side - Forms */}
          <div className="lg:w-2/3 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Thông tin giao hàng</h2>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="large"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại liên hệ"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ nhận hàng <span className="text-red-500">*</span>
                  </label>
                  <Input.TextArea
                    size="large"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Ghi chú đơn hàng
                  </label>
                  <Input.TextArea
                    size="large"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
                    rows={2}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center gap-2 text-white">
                  <CreditCard className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Phương thức thanh toán</h2>
                </div>
              </div>

              <div className="p-6">
                <Radio.Group
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  value={paymentMethod}
                  className="w-full"
                >
                  <div className="space-y-4">
                    <Radio value="COD" className="w-full">
                      <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-all">
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <div className="font-semibold text-gray-800">
                              Thanh toán khi nhận hàng (COD)
                            </div>
                            <div className="text-gray-500 text-sm mt-1">
                              Thanh toán tiền mặt khi shipper giao hàng đến.
                            </div>
                          </div>
                        </div>
                      </div>
                    </Radio>

                    <Radio value="BANK" className="w-full">
                      <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-all">
                        <div className="flex items-start gap-3">
                          <CreditCard className="w-5 h-5 text-purple-600 mt-1" />
                          <div>
                            <div className="font-semibold text-gray-800">
                              Thanh toán qua VNPAY
                            </div>
                            <div className="text-gray-500 text-sm mt-1">
                              Quét mã QR, thẻ ATM hoặc tài khoản ngân hàng.
                            </div>
                          </div>
                        </div>
                      </div>
                    </Radio>
                  </div>
                </Radio.Group>
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-32">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-xl font-bold text-white">
                  Đơn hàng của bạn
                </h2>
              </div>

              <div className="p-6">
                {/* Product List */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {selectedItems.map((item, index) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                        <img
                          src={`${STATIC_URL}${
                            item.image
                          }`}
                          alt={item.productTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                          {item.productTitle}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">
                          {new Intl.NumberFormat("vi-VN").format(
                            item.unitPrice
                          )}
                          ₫ × {item.quantity}
                        </p>
                        <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(totalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600 font-semibold">
                      Miễn phí
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 mb-6">
                  <span className="text-lg font-bold text-gray-800">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalCost)}
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleCheckout}
                  loading={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 h-12 text-lg font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl"
                >
                  {paymentMethod === "BANK" ? "Thanh toán ngay" : "Đặt hàng"}
                </Button>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-gray-100 space-y-3 mt-6">
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

      <style>{`
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
