import axios from "./Axios_Customize";

export const getProduct = (query) => {
  const url = `/api/product${query}`;
  return axios.get(url);
};

export const createProduct = (data) => {
  const url = `/api/product`;
  return axios.post(url, data);
};

export const updateProduct = (id, data) => {
  const url = `/api/product/${id}`;
  return axios.put(url, data);
};

export const deleteProduct = (id) => {
  const url = `/api/product/${id}`;
  return axios.delete(url);
};

export const createListProducts = (payload) => {
  const url = "/api/product/batch";
  return axios.post(url, payload);
};

export const getTopBuyerProduct = () => {
  const url = "/api/product/top-buyer";
  return axios.get(url);
};

export const getTopRatedProduct = () => {
  const url = "/api/product/top-rated";
  return axios.get(url);
};
