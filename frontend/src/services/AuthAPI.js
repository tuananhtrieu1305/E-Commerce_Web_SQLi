import axios from "./Axios_Customize";

export const login = (data) => {
  const url = `/api/auth/login`;
  return axios.post(url, data);
};

export const register = (data) => {
  const url = `/api/auth/register`;
  return axios.post(url, data);
};
