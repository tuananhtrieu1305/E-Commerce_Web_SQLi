import axios from "./Axios_Customize"; 


export const getCart = (userId) => {
  const url = `/api/cart/?userId=${userId}`;
  return axios.get(url);
};

export const apiAddItem = (userId, productId, qty) => {
  const url = "/api/cart/items/";
  const payload = { userId, productId, qty };
  return axios.post(url, payload);
};
export const apiSetQty = (userId, productId, qty) => {
  return axios.put(
    `/api/cart/items/${productId}/qty`,
    { qty: Number(qty) },
    { params: { userId } }
  ).then(r => r.data);
};

export const apiRemoveItem = (userId, itemId) =>
  axios.delete(`/api/cart/items/${itemId}`, { params: { userId } });
