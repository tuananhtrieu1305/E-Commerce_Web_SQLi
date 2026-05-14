import { Outlet } from "react-router-dom";
import ChatbotFloat from "./components/chatbot/ChatbotFloat";
import Home from "./pages/client/HomePage";

const App = () => {
  return (
    <>
      <Outlet />
      <ChatbotFloat />
    </>
  );
};

export default App;
