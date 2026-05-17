import React, { useState, useRef, useEffect } from "react";
import {
  FloatButton,
  Card,
  Input,
  List,
  Avatar,
  Spin,
  Typography,
  message,
} from "antd";
import { CommentOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { queryChatbot } from "../../services/ChatbotAPI";
import formatVND from "../../helpers/ConvertMoney";
import ChatBotLogo from "../../assets/chatbot/Logo.png";
import CloseIcon from "../../assets/chatbot/close_icon.svg";
import Anonymous from "../../assets/profilePics/Anonymous.png";
import { useNavigate } from "react-router-dom";
import { STATIC_URL } from "../../utils/config";

const { Text } = Typography;

const ChatbotFloat = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init",
      sender: "bot",
      type: "text",
      content: "Xin chào! Tôi có thể giúp gì cho bạn?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messageListRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (isOpen && messageListRef.current) {
      // Add check for isOpen
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isOpen]); // Depend on isOpen too

  const handleSend = async (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // 1. Thêm tin nhắn của người dùng vào UI
    const userMessage = {
      id: Date.now() + "-user",
      sender: "user",
      type: "text",
      content: trimmedQuery,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInputValue("");

    try {
      const res = await queryChatbot(trimmedQuery); // Use trimmedQuery
      console.log(res);

      // 3. Thêm tin nhắn text của bot
      const botMessage = {
        id: Date.now() + "-bot-text",
        sender: "bot",
        type: "text",
        content: res.message || "Here's what I found:",
      };
      setMessages((prev) => [...prev, botMessage]);

      // 4. Nếu có data sản phẩm, thêm list sản phẩm
      if (res.data && res.data.length > 0) {
        const productMessage = {
          id: Date.now() + "-bot-products",
          sender: "bot",
          type: "products",
          content: res.data || "ko co sanpham nao ", // Mảng các sản phẩm
        };
        setMessages((prev) => [...prev, productMessage]);
      }
    } catch (err) {
      console.error("Chatbot API error:", err);
      message.error(
        "Sorry, I'm having trouble connecting. Please try again later."
      );
      const errorMessage = {
        id: Date.now() + "-bot-error",
        sender: "bot",
        type: "text",
        content: "I couldn't get a response. Please check your connection.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Component render từng loại tin nhắn
  const renderMessage = (msg) => {
    // Tin nhắn của người dùng
    if (msg.sender === "user") {
      return (
        <div
          key={msg.id}
          className="flex justify-end mb-3 items-center gap-1.5"
        >
          <div className="bg-[#DEE2E6] text-black rounded-lg py-2 px-4 max-w-xs">
            {msg.content}
          </div>
        </div>
      );
    }

    // Tin nhắn của Bot
    const botAvatar = (
      <figure className="w-[40px] bg-[#4361EE] rounded-full p-2 shrink-0">
        <img srcSet={`${ChatBotLogo} 2x`} alt="Chatbot Logo" />
      </figure>
    );

    // Tin nhắn text của Bot
    if (msg.type === "text") {
      return (
        <div
          key={msg.id}
          className="flex justify-start mb-3 items-center gap-1.5"
        >
          {botAvatar}
          <div className="bg-[#4361EE] text-white rounded-lg py-2 px-4 max-w-xs">
            {msg.content}
          </div>
        </div>
      );
    }

    // Tin nhắn sản phẩm của Bot
    if (msg.type === "products") {
      return (
        <div
          key={msg.id}
          className="flex justify-start mb-3 w-full items-center gap-1.5"
        >
          {botAvatar}
          <div className="bg-white rounded-lg p-2 max-w-xs w-full shadow-sm border-2">
            <List
              itemLayout="horizontal"
              dataSource={msg.content} // msg.content là mảng [product1, product2]
              renderItem={(product) => (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
                  onClick={() => {
                    navigate(`/products/${product.id}`);
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        shape="square"
                        size={50}
                        src={
                          product.imagePaths !== null &&
                          product.imagePaths.length > 0
                            ? `${STATIC_URL}${
                                product.imagePaths[0].image_path ||
                                product.imagePaths[0]
                              }`
                            : Anonymous
                        }
                      />
                    }
                    title={<Text strong>{product.title}</Text>}
                    description={
                      <span className="text-green-600 font-semibold">
                        {formatVND(product.price)}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div
        className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ease-in-out transform origin-bottom-right
          ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-90 translate-y-10 pointer-events-none"
          }
        `}
      >
        <Card
          title={
            <div className="py-4 flex items-center justify-start gap-3">
              <figure className="w-[40px]">
                <img srcSet={`${ChatBotLogo} 2x`} alt="Chatbot Logo" />
              </figure>
              <div className="flex flex-col">
                <span className="text-[18px]">AI Assistant</span>
                <span className="text-[12px] text-[#43EE7D]">🟢 Online</span>
              </div>
            </div>
          }
          className="w-96 shadow-xl"
          headStyle={{ backgroundColor: "#4361EE", color: "white" }}
          bodyStyle={{
            padding: 0,
            height: "500px",
            display: "flex",
            flexDirection: "column",
          }}
          extra={
            <figure>
              <img
                src={CloseIcon}
                alt="Close"
                className="w-6 h-6 cursor-pointer"
                onClick={() => setIsOpen(false)}
              />
            </figure>
          }
        >
          {/* Lịch sử tin nhắn */}
          <div
            ref={messageListRef}
            className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3"
          >
            {messages.map(renderMessage)}
            {loading && (
              <div className="flex justify-start mb-3 items-center gap-1.5">
                <figure className="w-[40px] bg-[#4361EE] rounded-full p-2">
                  <img srcSet={`${ChatBotLogo} 2x`} alt="Chatbot Logo" />
                </figure>
                <div className="bg-gray-200 rounded-lg flex items-center justify-center py-2 px-4">
                  <Spin size="small" />
                </div>
              </div>
            )}
          </div>

          {/* Khung nhập liệu */}
          <div className="p-4 bg-white border-t">
            <Input.Search
              placeholder="Ask about a product..."
              enterButton={<SendOutlined />}
              size="large"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSearch={handleSend}
              loading={loading}
              disabled={loading}
            />
          </div>
        </Card>
      </div>

      {/* Nút bấm nổi */}
      <FloatButton
        icon={<CommentOutlined />}
        type="primary"
        onClick={() => setIsOpen(!isOpen)}
        tooltip="Chat with AI Assistant"
      />
    </>
  );
};

export default ChatbotFloat;
