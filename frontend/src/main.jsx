import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/client/HomePage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import AdminPage from "./pages/admin/AdminPage.jsx";
import Dashboard from "./pages/admin/dashboard/Dashboard.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import ManageAdmins from "./pages/admin/ManageAdmins.jsx";
import ManageOrders from "./pages/admin/ManageOrders.jsx";
import ManageProducts from "./pages/admin/ManageProducts.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CartPage from "./pages/cart/CartPage.jsx";
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import { CartProvider } from "./context/CartContext.jsx";
import { CheckoutProvider } from "./context/CheckoutContext.jsx";
import CheckoutPage from "./pages/checkout/CheckoutPage.jsx";
import PaymentReturnPage from "./pages/checkout/PaymentReturnPage.jsx";
import OrderHistoryPage from "./pages/client/OrderHistoryPage.jsx";
import OrderDetailPage from "./pages/client/OrderDetailPage.jsx";
import "@ant-design/v5-patch-for-react-19";
import ProductsPage from "./pages/client/ProductsPage.jsx";
import ProductDetailPage from "./pages/client/ProductDetailPage.jsx";
import ProfileUpdate from "./pages/client/ProfileUpdatePage.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/payment-result",
        element: <PaymentReturnPage />,
      },

      {
        path: "/profile/orders",
        element: <OrderHistoryPage />,
      },
      {
        path: "/order-detail/:id",
        element: <OrderDetailPage />,
      },

      {
        path: "/checkout",
        element: (
          <CheckoutProvider>
            <CheckoutPage />
          </CheckoutProvider>
        ),
      },
      { path: "/products", element: <ProductsPage /> },
      {
        path: "/products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "/update-user",
        element: <ProfileUpdate />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminPage />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "/admin/users",
            element: <ManageUsers />,
          },
          {
            path: "/admin/admins",
            element: <ManageAdmins />,
          },
          {
            path: "/admin/orders",
            element: <ManageOrders />,
          },
          {
            path: "/admin/products",
            element: <ManageProducts />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider locale={enUS}>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </ConfigProvider>
  </StrictMode>
);
