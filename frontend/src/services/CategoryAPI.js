import axios from "./Axios_Customize";

export const getCategoryWithProduct = () => {
  const url = "/api/category";
  return axios.get(url);
};

export const getCategoryOnly = () => {
  const url = "/api/category/only";
  return axios.get(url);
};
