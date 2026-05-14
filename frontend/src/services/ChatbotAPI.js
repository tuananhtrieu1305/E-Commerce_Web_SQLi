import axios from "./Axios_Customize";

export const queryChatbot = (query) => {
  const url = `/api/chatbot/query`;
  return axios.post(url, { query: query });
};
