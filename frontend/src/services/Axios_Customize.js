import axios from "axios";
import { message } from "antd";
import { BACKEND_URL } from "../utils/config";

const instance = axios.create({
  baseURL: BACKEND_URL,
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = localStorage.getItem("access_token");

    if (token) {
      // Gắn token vào header Authorization
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (response?.data) {
      return response.data;
    }
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error

    const status = error.response?.status;

    if (status === 401) {
      // --- XỬ LÝ TOKEN HẾT HẠN (401 Unauthorized) ---

      // 1. Xóa tất cả thông tin đăng nhập khỏi localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user");
      localStorage.removeItem("user_role");

      // 2. Hiển thị thông báo cho người dùng
      message.error("Your session has expired. Please log in again.");

      // 3. Điều hướng người dùng về trang đăng nhập
      // Chúng ta dùng window.location.href để ép tải lại toàn bộ trang,
      // đảm bảo mọi state cũ của React đều bị xóa sạch.
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500); // Đợi 1.5s để người dùng kịp đọc thông báo

      // Trả về một lỗi đã được xử lý
      return Promise.reject(new Error("Session expired and user logged out."));
    }

    if (error?.response?.data) {
      return error.response.data;
    }
    return Promise.reject(error);
  }
);

export default instance;
