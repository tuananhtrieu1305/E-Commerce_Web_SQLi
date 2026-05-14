import axios from "./Axios_Customize";

export const getSeller = () => {
  const url = "/api/seller";
  return axios.get(url);
};
