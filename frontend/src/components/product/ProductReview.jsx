import React, { useEffect, useState, useMemo } from "react";
import { Star, Loader2, MessageSquare, Trash2, Edit3 } from "lucide-react";
import { message } from "antd";
import axios from "../../services/Axios_Customize";
export default function ProductReviews({ productId }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [star, setStar] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const userId = localStorage.getItem("user_id");

  // ---- Tính rating trung bình ----
  const { avgRating, reviewCount } = useMemo(() => {
    if (!comments.length) return { avgRating: 0, reviewCount: 0 };
    const sum = comments.reduce((acc, c) => acc + c.star, 0);
    return {
      avgRating: (sum / comments.length).toFixed(1),
      reviewCount: comments.length,
    };
  }, [comments]);

  // ---- Kiểm tra user hiện tại đã comment chưa ----
  const myComment = comments.find((c) => c.userId === userId) || null;

  useEffect(() => {
    if (!productId) return;

    const fetchComments = async () => {
      setLoading(true);
      try {
        // interceptor đã trả về response.data
        const res = await axios.get(`/api/comments/product/${productId}`);
        console.log(res);
        setComments(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [productId]);

  // ---- SUBMIT COMMENT ----
  const handleSubmit = async () => {
    if (!localStorage.getItem("access_token")) {
      messageApi.open({
        type: "error",
        content: "Bạn cần đăng nhập để đánh giá.",
      });
      return;
    }

    if (!content.trim()) {
      messageApi.open({
        type: "error",
        content: "Vui lòng nhập nội dung.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const isEdit = !!myComment;

      const url = isEdit ? `/api/comments/${myComment.id}` : `/api/comments`;

      const payload = { content, star, userId, productId };

      const res = isEdit
        ? await axios.put(url, payload)
        : await axios.post(url, payload);

      // Nếu backend trả { data: comment }:
      console.log(res);
      const newComment = res.data ?? res;
      console.log(newComment);
      if (!newComment) {
        console.error("API không trả ra comment hợp lệ:", res);
        return;
      }

      if (isEdit) {
        setComments((prev) =>
          prev.map((c) => (c.id === newComment.id ? newComment : c))
        );
      } else {
        setComments((prev) => [newComment, ...prev]);
      }

      messageApi.open({
        type: "error",
        content: isEdit ? "Đã cập nhật đánh giá" : "Đã gửi đánh giá!",
      });
    } catch (err) {
      console.error(err);
      messageApi.open({
        type: "error",
        content: "Lỗi gửi đánh giá",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myComment) return;
    if (!confirm("Xóa đánh giá của bạn?")) return;

    try {
      await axios.delete(`/api/comments/${myComment.id}`);
      setComments((prev) => prev.filter((c) => c.id !== myComment.id));
      messageApi.open({
        type: "success",
        content: "Đã xóa!",
      });
    } catch (err) {
      console.error(err);
      messageApi.open({
        type: "error",
        content: "Không thể xóa",
      });
    }
  };

  const renderStar = (value) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={18}
        className={
          i < value ? "fill-yellow-400 text-yellow-400" : "text-white/30"
        }
      />
    ));

  return (
    <>
      {contextHolder}
      <div className="space-y-6">
        {/* SUMMARY */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-white">{avgRating}</div>
              <div className="flex justify-center gap-1 mt-2">
                {renderStar(Math.round(avgRating))}
              </div>
              <div className="text-white/60 text-sm mt-1">
                {reviewCount} đánh giá
              </div>
            </div>

            {/* FORM */}
            <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="text-white font-semibold mb-2 flex items-center gap-2">
                <MessageSquare size={18} />{" "}
                {myComment ? "Cập nhật đánh giá" : "Viết đánh giá"}
              </div>

              {/* chọn sao */}
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setStar(i + 1)}>
                    <Star
                      size={22}
                      className={
                        i < star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-white/30"
                      }
                    />
                  </button>
                ))}
              </div>

              <textarea
                className="w-full bg-white/10 text-white text-sm p-2 rounded-lg border border-white/20"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Chia sẻ cảm nhận..."
              />

              <div className="flex justify-between mt-3">
                {myComment && (
                  <button
                    className="flex items-center gap-1 text-red-300 hover:text-red-400 text-sm"
                    onClick={handleDelete}
                  >
                    <Trash2 size={14} /> Xóa
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-white text-blue-900 font-semibold rounded-lg flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                    </>
                  ) : myComment ? (
                    <>
                      <Edit3 size={14} /> Cập nhật
                    </>
                  ) : (
                    <>
                      <MessageSquare size={14} /> Gửi đánh giá
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="text-white/70 text-center py-6">
            <Loader2 className="w-5 h-5 animate-spin inline" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-white/60 text-center py-6">
            Chưa có đánh giá nào.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-white/10 p-4 rounded-xl border border-white/20"
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="font-semibold text-white">{c.username}</div>
                    <div className="flex gap-2 items-center text-sm mt-1">
                      {renderStar(c.star)}
                      <span className="text-white/40">{c.date || ""}</span>
                    </div>
                  </div>

                  {c.userId === userId && (
                    <span className="text-xs px-2 py-1 border border-emerald-300/70 text-emerald-300 rounded-full">
                      Đánh giá của bạn
                    </span>
                  )}
                </div>

                <p className="text-white/80 text-sm">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
