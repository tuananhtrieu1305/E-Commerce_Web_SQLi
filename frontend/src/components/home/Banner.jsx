import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Banner({
  banner,
  currentIndex,
  totalBanners,
  onPrev,
  onNext,
  onIndicatorClick,
}) {
  const navigate = useNavigate();

  const handleBannerClick = () => {
    if (banner.productId) navigate(`/products/${banner.productId}`);
  };

  return (
    <div
      className="relative w-full h-full z-10 cursor-pointer"
      onClick={handleBannerClick}
    >
      {/* Ảnh Banner full size */}
      <div className="w-full h-full overflow-hidden rounded-2xl">
        <img
          src={
            banner.image
              ? banner.image
              : "https://happyphone.vn/wp-content/uploads/2025/09/iPhone-17-Pro-va-iPhone-17-Pro-Max-chinh-thuc-ra-mat-co-gi-moi.jpg"
          }
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Controls */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur 
        hover:bg-white/30 rounded-full p-3 transition z-20 border border-white/20"
      >
        <ChevronLeft size={28} className="text-white" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur 
        hover:bg-white/30 rounded-full p-3 transition z-20 border border-white/20"
      >
        <ChevronRight size={28} className="text-white" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {Array.from({ length: totalBanners }).map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onIndicatorClick(idx);
            }}
            className={`h-2 rounded-full transition ${
              idx === currentIndex ? "bg-white w-8" : "bg-white/40 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
