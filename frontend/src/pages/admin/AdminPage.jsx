import {
  AppstoreOutlined,
  ExceptionOutlined,
  TeamOutlined,
  UserOutlined,
  DollarCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Dropdown, Avatar, message } from "antd";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect, memo } from "react";
import Logo from "../../components/Logo";
import Logo_Icon from "../../assets/logoPage/Logo_Icon.png";

const { Content, Sider, Header: AntHeader } = Layout;

const MemoizedHeader = memo(({ collapsed, onToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    message.success("Logged out successfully.");
    navigate("/login");
  };
  const dropdownItems = [
    {
      label: <Link to="/">Homepage</Link>,
      key: "home",
      icon: <HomeOutlined />,
    },
    { type: "divider" },
    {
      label: "Log out",
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className="!p-0 flex items-center justify-between shadow-sm sticky top-0 z-10 ">
      <div className="flex items-center">
        {React.createElement(
          collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
          {
            className:
              "trigger text-lg px-6 cursor-pointer h-full flex items-center !text-white",
            onClick: onToggle,
          }
        )}
      </div>
      <div className="pr-6 cursor-pointer">
        <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
          <Avatar icon={<UserOutlined />} className="text-white !bg-[#888]" />
        </Dropdown>
      </div>
    </AntHeader>
  );
});

MemoizedHeader.displayName = "MemoizedHeader";

const MemoizedContent = memo(() => {
  return (
    <Content className="m-4 p-6 bg-white rounded-lg shadow-inner">
      <Outlet />
    </Content>
  );
});
MemoizedContent.displayName = "MemoizedContent";

const AdminPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [activeMenuKey, setActiveMenuKey] = useState("dashboard");

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const keyMap = {
      admin: "dashboard",
      users: "user",
      admins: "admin",
      products: "products",
      orders: "orders",
    };
    setActiveMenuKey(keyMap[path] || "dashboard");
  }, [location]);

  const menuItems = [
    {
      label: <Link to="/admin">Dashboard</Link>,
      key: "dashboard",
      icon: <AppstoreOutlined />,
    },
    {
      label: <span>Account Management</span>,
      key: "account",
      icon: <UserOutlined />,
      children: [
        {
          label: <Link to="/admin/users">User Accounts</Link>,
          key: "user",
          icon: <TeamOutlined />,
        },
        {
          label: <Link to="/admin/admins">Admin Accounts</Link>,
          key: "admin",
          icon: <TeamOutlined />,
        },
      ],
    },
    {
      label: <Link to="/admin/products">Product Management</Link>,
      key: "products",
      icon: <ExceptionOutlined />,
    },
    {
      label: <Link to="/admin/orders">Order Management</Link>,
      key: "orders",
      icon: <DollarCircleOutlined />,
    },
  ];

  const handleToggle = () => setCollapsed(!collapsed);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={230}
        trigger={null}
        collapsedWidth={80}
        collapsed={collapsed}
        theme="dark"
        className="shadow-sm transition-all duration-300 ease-in-out transform-gpu will-change-transform"
      >
        <div className="flex items-center justify-center h-16">
          {collapsed ? (
            <img src={Logo_Icon} alt="Icon" className="h-8" />
          ) : (
            <div className="text-2xl font-bold text-white whitespace-nowrap cursor-pointer">
              NEXTPICK
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[activeMenuKey]}
          mode="inline"
          items={menuItems}
          onClick={(e) => setActiveMenuKey(e.key)}
        />
      </Sider>

      <Layout className="!bg-gray-200 transition-all duration-300 ease-in-out">
        <MemoizedHeader collapsed={collapsed} onToggle={handleToggle} />
        <MemoizedContent />
      </Layout>
    </Layout>
  );
};

export default AdminPage;
