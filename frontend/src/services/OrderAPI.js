import axios from "./Axios_Customize";

export const getOrder = (query) => {
  const url = `/api/order${query}`;
  return axios.get(url);
};

export const updateOrder = (id, payload) => {
  const url = `/api/order/${id}`;
  return axios.put(url, payload);
};

export const deleteOrder = (id) => {
  const url = `/api/order/${id}`;
  return axios.delete(url);
};

export const createOrder = (payload) => {
  const url = "/api/order";
  return axios.post(url, payload);
};

export const getOrderHistory = (userId) => {
  return axios.get(`/api/order/history/${userId}`);
};

export const createVnpayPayment = (orderId) => {
  return axios.post("/api/payment/create-vnpay", { orderId });
};
export const getOrderDetail = (id) => {
  return axios.get(`/api/order?id=${id}`);
};