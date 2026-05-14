// Filter Sidebar Component
import { SlidersHorizontal } from "lucide-react";
export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  onResetFilters,
}) {
  const priceRanges = [
    { label: "Dưới 1 triệu", min: 0, max: 1000000 },
    { label: "1 - 5 triệu", min: 1000000, max: 5000000 },
    { label: "5 - 10 triệu", min: 5000000, max: 10000000 },
    { label: "10 - 20 triệu", min: 10000000, max: 20000000 },
    { label: "Trên 20 triệu", min: 20000000, max: Infinity },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <SlidersHorizontal size={18} />
          Bộ lọc
        </h3>
        <button
          onClick={onResetFilters}
          className="text-sm text-blue-200 hover:text-white font-medium transition"
        >
          Xóa
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-semibold text-white/90 mb-3 text-sm">Danh Mục</h4>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange("")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
              selectedCategory === ""
                ? "bg-white/30 text-white font-semibold border border-white/40"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                selectedCategory === cat
                  ? "bg-white/30 text-white font-semibold border border-white/40"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold text-white/90 mb-3 text-sm">Khoảng Giá</h4>
        <div className="space-y-2">
          <button
            onClick={() => onPriceRangeChange({ min: 0, max: Infinity })}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
              priceRange.min === 0 && priceRange.max === Infinity
                ? "bg-white/30 text-white font-semibold border border-white/40"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            Tất cả
          </button>
          {priceRanges.map((range, idx) => (
            <button
              key={idx}
              onClick={() => onPriceRangeChange(range)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                priceRange.min === range.min && priceRange.max === range.max
                  ? "bg-white/30 text-white font-semibold border border-white/40"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
