// src/components/home/SpecialOfferSection.jsx
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

export function ProductSection({
  title = "Special offers",
  apiUrl, // URL API để fetch product
  viewAllHref, // optional: nếu truyền thì ưu tiên navigate tới đây
  limit,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let data = [];

        if (apiUrl) {
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
          const json = await res.json();

          if (Array.isArray(json)) {
            data = json;
          } else if (Array.isArray(json.data)) {
            data = json.data;
          } else if (Array.isArray(json.content)) {
            data = json.content;
          } else {
            console.warn("Không tìm thấy mảng product trong response", json);
            data = [];
          }
        }

        if (limit && limit > 0) {
          data = data.slice(0, limit);
        }

        setProducts(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiUrl, limit]);

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  // 👉 View all: điều hướng sang ProductsPage với sort tương ứng
  const handleViewAll = () => {
    if (viewAllHref) {
      // nếu bạn muốn truyền custom link từ ngoài
      navigate(viewAllHref);
      return;
    }

    if (apiUrl?.includes("top-buyer")) {
      navigate("/products?sort=popular");
    } else if (apiUrl?.includes("top-rated")) {
      navigate("/products?sort=rating");
    } else {
      navigate("/products");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-slate-500">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-red-600">Lỗi: {error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        <p className="text-sm text-slate-500">Chưa có sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <button
          type="button"
          onClick={handleViewAll}
          className="text-blue-600 font-medium hover:underline flex items-center gap-1"
        >
          View all <ChevronRight size={18} />
        </button>
      </div>

      {/* Slider */}
      <div className="relative">
        <button
          type="button"
          onClick={scrollLeft}
          className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 hover:bg-slate-50 z-10"
        >
          <ChevronLeft size={18} />
        </button>

        <div ref={scrollRef} className="overflow-x-auto no-scrollbar">
          <div className="flex gap-4 min-w-max">
            {products.map((product) => (
              <div key={product.id} className="flex-none w-64">
                <ProductCard
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  originalPrice={
                    product.originalPrice || product.price * 1.1 || 0
                  }
                  rating={product.rating || 0}
                  reviewCount={product.reviewCount || 0}
                  categoryName={product.category?.cate_name || "Khác"}
                  productInfo={product.productInfo}
                  imageUrl={product.imagePaths[0].image_path}
                  sellerName={product.seller.seller_name}
                  stock={product.stock}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={scrollRight}
          className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 hover:bg-slate-50 z-10"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
