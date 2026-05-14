import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function Taskbar({ items }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handleClickCategory = (item) => {
    navigate(`/products?category=${encodeURIComponent(item.code)}`);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 w-8/12 max-w-4xl">
      <div className="bg-white/15 backdrop-blur-lg rounded-3xl border border-white/30 px-6 py-5 w-full relative">
        {/* Nút trang trước */}
        {currentPage > 0 && (
          <button
            onClick={goToPrevPage}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
        )}

        {/* Flex container cho một hàng */}
        <div className="flex gap-4 justify-center items-start">
          {currentItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClickCategory(item)}
              className="flex flex-col items-center cursor-pointer group flex-shrink-0"
              style={{ width: "80px" }}
            >
              <div className="relative bg-white/10 p-4 rounded-xl mb-2 transition duration-300 overflow-hidden flex items-center justify-center w-12 h-12 border border-white/20">
                <div className="absolute inset-0 bg-white/30 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-xl"></div>
                <item.icon
                  size={24}
                  className="text-white group-hover:text-white transition relative z-10 duration-300"
                />
              </div>
              <p className="text-xs font-medium text-white/80 text-center group-hover:text-white transition line-clamp-2">
                {item.label}
              </p>
            </button>
          ))}
        </div>

        {/* Nút trang sau */}
        {currentPage < totalPages - 1 && (
          <button
            onClick={goToNextPage}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        )}

        {/* Chấm phân trang */}
        {totalPages > 1 && (
          <div className="hidden flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentPage
                    ? "bg-white w-6"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
