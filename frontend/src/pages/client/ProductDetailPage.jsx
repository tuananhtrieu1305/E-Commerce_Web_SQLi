import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/home/Header";
import {
  Star,
  ShoppingCart,
  CreditCard,
  Heart,
  Share2,
  Package,
  Truck,
  RotateCcw,
  Shield,
  Plus,
  Minus,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { message } from "antd";
import ProductReviews from "../../components/product/ProductReview";
import { apiAddItem } from "../../services/cartService";
import { BACKEND_URL } from "../../utils/config";
// Mock template cho product (dùng làm default + bổ sung field không có trong BE)
const mockProductTemplate = {
  id: null,
  title: "Tên sản phẩm",
  price: 0,
  originalPrice: 0,
  rating: 4.7,
  reviewCount: 342,
  category: "Danh mục",
  stock: 0,
  sold: 1200,
  description:
    "Mô tả sản phẩm sẽ hiển thị tại đây. Bạn có thể cập nhật từ backend sau.",
  features: [
    "Tính năng nổi bật 1",
    "Tính năng nổi bật 2",
    "Tính năng nổi bật 3",
  ],
  specs: {
    "Thương hiệu": "Đang cập nhật",
    Model: "Đang cập nhật",
    Loại: "Đang cập nhật",
    "Kết nối": "Đang cập nhật",
    Pin: "Đang cập nhật",
    "Trọng lượng": "Đang cập nhật",
  },
  images: ["📦", "🎵", "🔊", "🎶"],
  seller: {
    name: "Cửa hàng chính hãng",
    rating: 4.9,
    responseRate: 98,
  },
};

// Mock đánh giá
const reviews = [
  {
    id: 1,
    userName: "Nguyễn Văn A",
    rating: 5,
    date: "2025-01-15",
    comment:
      "Sản phẩm tuyệt vời! Chống ồn rất tốt, âm thanh chất lượng cao. Đáng đồng tiền bát gạo.",
    helpful: 24,
  },
  {
    id: 2,
    userName: "Trần Thị B",
    rating: 4,
    date: "2025-01-10",
    comment: "Sản phẩm ổn trong tầm giá. Giao hàng nhanh.",
    helpful: 12,
  },
];

export default function ProductDetailPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [product, setProduct] = useState(mockProductTemplate);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();
  // Format giá VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Lấy dữ liệu sản phẩm từ backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // TODO: nếu bạn có proxy / apiFetch thì đổi URL này cho khớp
        const res = await fetch(`${BACKEND_URL}/api/product?id=${id}`);
        const json = await res.json();
        const apiProduct =
          json?.data && json.data.length > 0 ? json.data[0] : null;

        console.log(apiProduct);

        if (apiProduct) {
          // Map ảnh từ imagePaths (nếu có) → mảng URL
          let imagesFromApi = [];
          if (apiProduct.imagePaths && apiProduct.imagePaths.length > 0) {
            imagesFromApi = apiProduct.imagePaths.map(
              (img) =>
                `${BACKEND_URL}${img.image_path}` || ""
            );
          }

          setProduct((prev) => ({
            ...prev,
            id: apiProduct.id,
            title: apiProduct.title,
            price: apiProduct.price,
            // Nếu không có originalPrice: giả sử giá gốc = +15%
            originalPrice: Math.round(apiProduct.price * 1.15),
            category: apiProduct.category?.cate_name || prev.category,
            stock: apiProduct.stock,
            // giữ rating, reviewCount, sold như mock
            // description/features/specs: tạm dùng mock, sau này bạn thêm field vào BE thì map thêm
            seller: {
              ...prev.seller,
              name: apiProduct.seller?.seller_name || prev.seller.name,
            },
            images: imagesFromApi.length > 0 ? imagesFromApi : prev.images,
            description: apiProduct.productInfo,
            features: null,
            specs: null,
          }));
        }
      } catch (error) {
        console.error("Lỗi khi fetch product detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);
  const userId = localStorage.getItem("user_id");
  const handleAddToCart = async () => {
    if (!product?.id) return;
    if (addingToCart) return; // Chặn spam click

    if (!userId) {
      messageApi.open({
        type: "error",
        content: "Bạn cần đăng nhập để thêm vào giỏ hàng.",
      });
      return;
    }

    try {
      setAddingToCart(true);
      setAddedToCart(false);

      await apiAddItem(Number(userId), product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1500);

      messageApi.open({
        type: "success",
        content: "Đã thêm sản phẩm vào giỏ hàng!",
      });
    } catch (err) {
      console.error(err);
      messageApi.open({
        type: "error",
        content: "Lỗi thêm giỏ hàng. Vui lòng thử lại.",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product?.id) return;

    if (!userId) {
      messageApi.open({
        type: "error",
        content: "Bạn cần đăng nhập để mua hàng.",
      });
      return;
    }

    try {
      // Hiện loading nhẹ
      messageApi.open({
        key: "buy_now",
        type: "loading",
        content: "Đang xử lý...",
        duration: 0,
      });

      // 2. Gọi API thêm vào giỏ (Giống hệt logic thêm giỏ hàng)
      await apiAddItem(Number(userId), product.id, quantity);

      // 4. Chuyển hướng sang trang Cart kèm tham số "buy_now"
      messageApi.destroy("buy_now"); // Tắt loading
      navigate(`/cart?buy_now=${product.id}`);
    } catch (err) {
      console.error(err);
      messageApi.destroy("buy_now");
      messageApi.open({
        type: "error",
        content: "Lỗi hệ thống. Vui lòng thử lại.",
      });
    }
  };

  // Chuẩn bị mảng ảnh hiển thị
  const displayImages = product.images || [];
  const currentImage = displayImages[selectedImage] || displayImages[0];

  const renderMainImage = () => {
    if (!currentImage) return "📦";

    // nếu là URL/path ảnh → render <img>, nếu chỉ là emoji → render emoji
    if (
      typeof currentImage === "string" &&
      (currentImage.startsWith("http") || currentImage.startsWith("/"))
    ) {
      return (
        <img
          src={currentImage}
          alt={product.title}
          className="w-full h-full object-cover rounded-xl"
        />
      );
    }
    return currentImage;
  };

  const renderThumbImage = (img) => {
    if (
      typeof img === "string" &&
      (img.startsWith("http") || img.startsWith("/"))
    ) {
      return (
        <img
          src={img}
          alt={product.title}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }
    return img;
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-[#112D60]">
        {/* Header */}
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="max-w-7xl mx-auto px-6 pt-28 pb-10">
          {loading ? (
            <div className="text-center text-white py-20">
              Đang tải thông tin sản phẩm...
            </div>
          ) : !product ? (
            <div className="text-center text-white py-20">
              Không tìm thấy sản phẩm
            </div>
          ) : (
            <>
              {/* Product Section */}
              <div className="grid grid-cols-12 gap-6 mb-6">
                {/* Left: Images */}
                <div className="col-span-12 lg:col-span-5">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                    {/* Main Image */}
                    <div className="bg-gradient-to-br from-purple-300 to-purple-400 rounded-xl h-96 flex items-center justify-center mb-4 text-9xl overflow-hidden">
                      {renderMainImage()}
                    </div>

                    {/* Thumbnail Images */}
                    <div className="grid grid-cols-4 gap-3">
                      {displayImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`bg-gradient-to-br from-purple-300 to-purple-400 rounded-lg h-20 flex items-center justify-center text-4xl transition overflow-hidden ${
                            selectedImage === idx
                              ? "ring-4 ring-white/50 scale-105"
                              : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          {renderThumbImage(img)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Product Info */}
                <div className="col-span-12 lg:col-span-7">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                    {/* Category Badge */}
                    <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                      {product.category}
                    </span>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white mb-3">
                      {product.title}
                    </h1>

                    {/* Rating & Sold */}
                    <div className="flex items-center gap-6 mb-4 pb-4 border-b border-white/20">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star
                            size={20}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          <span className="text-white font-semibold">
                            {product.rating}
                          </span>
                        </div>
                        <span className="text-white/60 text-sm">
                          ({product.reviewCount} đánh giá)
                        </span>
                      </div>
                      <div className="h-4 w-px bg-white/20"></div>
                      <span className="text-white/80 text-sm">
                        Đã bán {product.sold}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="bg-white/10 rounded-xl p-4 mb-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-white">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <>
                            <span className="text-lg line-through text-white/50">
                              {formatPrice(product.originalPrice)}
                            </span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                              -
                              {Math.round(
                                (1 - product.price / product.originalPrice) *
                                  100
                              )}
                              %
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-white font-medium">Số lượng:</span>
                      <div className="flex items-center bg-white/10 rounded-lg border border-white/20">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="p-3 text-white hover:bg-white/10 transition"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="px-6 text-white font-semibold">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity((q) =>
                              Math.min(product.stock || 1, q + 1)
                            )
                          }
                          className="p-3 text-white hover:bg-white/10 transition"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <span className="text-white/60 text-sm">
                        {product.stock} sản phẩm có sẵn
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Nút thêm vào giỏ với hiệu ứng */}
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className={`flex items-center justify-center gap-2 py-4 rounded-xl transition border border-white/30
        ${
          addedToCart
            ? "bg-emerald-500/80 hover:bg-emerald-500 text-white shadow-lg"
            : "bg-white/20 hover:bg-white/30 text-white"
        }
        ${addingToCart ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
      `}
                      >
                        {addingToCart ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Đang thêm...</span>
                          </>
                        ) : addedToCart ? (
                          <>
                            <ShoppingCart className="w-5 h-5 animate-bounce" />
                            <span>Đã thêm vào giỏ</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>Thêm vào giỏ</span>
                          </>
                        )}
                      </button>

                      {/* Nút mua ngay giữ nguyên */}
                      <button
                        onClick={handleBuyNow}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-blue-900 font-semibold py-4 rounded-xl transition shadow-lg"
                      >
                        <CreditCard size={20} />
                        Mua ngay
                      </button>
                    </div>
                  </div>

                  {/* Service Features */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[
                      { icon: Truck, text: "Miễn phí vận chuyển" },
                      { icon: RotateCcw, text: "Đổi trả trong 30 ngày" },
                      { icon: Shield, text: "Bảo hành 12 tháng" },
                      { icon: Package, text: "Chính hãng 100%" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 flex items-center gap-3"
                      >
                        <div className="bg-white/20 p-2 rounded-lg">
                          <item.icon size={20} className="text-white" />
                        </div>
                        <span className="text-white text-sm font-medium">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Details & Reviews */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-white/20">
                  {["description", "reviews"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 px-4 font-semibold transition ${
                        activeTab === tab
                          ? "text-white border-b-2 border-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {tab === "description" && "Mô tả"}
                      {tab === "reviews" && "Đánh giá"}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === "description" && (
                  <div className="text-white space-y-4">
                    <p className="text-white/80 leading-relaxed">
                      {product.description}
                    </p>
                    {product.features && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Tính năng nổi bật:
                        </h3>
                        <ul className="space-y-2">
                          {product.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-white/80"
                            >
                              <span className="text-white">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white/10 rounded-lg p-4 border border-white/20"
                      >
                        <div className="text-white/60 text-sm mb-1">{key}</div>
                        <div className="text-white font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <ProductReviews productId={product.id} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
