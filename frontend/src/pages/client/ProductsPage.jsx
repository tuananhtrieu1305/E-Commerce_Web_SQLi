import React, { useState, useEffect } from "react";
import { Header } from "../../components/home/Header";
import FilterSidebar from "../../components/product/FilterSidebar";
import SortBar from "../../components/product/SortBar";
import ProductCard from "../../components/home/ProductCard";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getProduct,
  getTopBuyerProduct,
  getTopRatedProduct,
} from "../../services/ProductAPI";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [sortBy, setSortBy] = useState("default"); // sort theo giá
  const [loading, setLoading] = useState(false);

  const [sortMode, setSortMode] = useState("all"); // all | popular | rating

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Fetch sản phẩm mỗi khi URL (category/title/sort) hoặc priceRange đổi
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams(location.search);
        const categoryFromUrl = params.get("category") || "";
        const titleFromUrl = params.get("title") || "";
        const sortFromUrl = params.get("sort") || "all"; // popular | rating | all

        setSelectedCategory(categoryFromUrl);
        setSearchQuery(titleFromUrl);
        setSortMode(sortFromUrl);

        let data = [];

        if (sortFromUrl === "popular") {
          // /api/product/top-buyer
          const res = await getTopBuyerProduct();
          data = res;
        } else if (sortFromUrl === "rating") {
          // /api/product/top-rated
          const res = await getTopRatedProduct();
          data = res;
        } else {
          // Gọi list product bình thường với category + title + price
          const queryParams = {};
          if (categoryFromUrl) queryParams.category_name = categoryFromUrl;
          if (titleFromUrl) queryParams.title = titleFromUrl;
          if (priceRange.min > 0) queryParams.minPrice = priceRange.min;
          if (priceRange.max !== Infinity)
            queryParams.maxPrice = priceRange.max;

          const queryString = new URLSearchParams(queryParams).toString();
          const query = queryString ? `?${queryString}` : "";

          const res = await getProduct(query);
          data = res.data?.data || res.data || [];
        }

        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search, priceRange]); // phụ thuộc URL + priceRange

  // ✅ Filter + sort FE
  useEffect(() => {
    let result = [...products];

    // filter theo category
    if (selectedCategory) {
      result = result.filter((p) => p.category?.cate_name === selectedCategory);
    }

    // filter theo search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.productInfo?.toLowerCase().includes(q)
      );
    }

    // filter theo priceRange
    result = result.filter((p) => {
      const price = p.price || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // sort theo giá
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

  const categories = [...new Set(products.map((p) => p.category?.cate_name))];

  // ✅ đổi category -> update URL để effect fetch chạy theo URL
  const handleCategoryChange = (cate) => {
    setSelectedCategory(cate);

    const params = new URLSearchParams(location.search);
    if (cate) params.set("category", cate);
    else params.delete("category");

    const queryString = params.toString();
    navigate(queryString ? `/products?${queryString}` : "/products");
  };

  // ✅ đổi sortMode (Phổ biến / Đánh giá / Tất cả) -> update URL
  const handleSortModeChange = (mode) => {
    const params = new URLSearchParams(location.search);

    if (mode === "all") {
      params.delete("sort");
    } else {
      params.set("sort", mode); // popular | rating
    }

    const queryString = params.toString();
    navigate(queryString ? `/products?${queryString}` : "/products");
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange({ min: 0, max: Infinity });
    setSortBy("default");
    setSortMode("all");
    navigate("/products"); // xoá hết query
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#112D60] via-[#2F446A] to-[#B6C0C5]">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-10">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <FilterSidebar
              categories={categories.filter(Boolean)}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Products */}
          <div className="col-span-12 lg:col-span-9">
            {/* SortBar theo giá */}
            <div className="mb-5">
              <SortBar
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultCount={filteredProducts.length}
                sortMode={sortMode} // 👈 thêm
                onSortModeChange={handleSortModeChange}
              />
            </div>

            {loading ? (
              <div className="text-center py-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-white">Đang tải sản phẩm...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center bg-white/10 backdrop-blur-md p-10 rounded-xl border border-white/20">
                <p className="text-white mb-4">Không có sản phẩm nào</p>
                <button
                  onClick={handleResetFilters}
                  className="text-white bg.white/20 px-6 py-2 rounded-md"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    productInfo={product.productInfo}
                    price={product.price}
                    stock={product.stock}
                    categoryName={product.category?.cate_name}
                    sellerName={product.seller?.seller_name}
                    imageUrl={product.imagePaths[0].image_path}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
