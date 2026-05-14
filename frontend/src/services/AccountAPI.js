import axios from "./Axios_Customize";

export const getAccount = (query) => {
  const url = `/api/account${query}`;
  return axios.get(url);
};

export const updateAccount = (id, payload) => {
  const url = `/api/account/${id}`;
  return axios.put(url, payload);
};

export const deleteAccount = (id) => {
  const url = `/api/account/${id}`;
  return axios.delete(url);
};

export const createAccount = (payload) => {
  const url = "/api/account";
  return axios.post(url, payload);
};

export const createListAccounts = (payload) => {
  const url = "/api/account/batch";
  return axios.post(url, payload);
};

export const getUserList = () => {
  const url = "/api/account/user_list";
  return axios.get(url);
};
