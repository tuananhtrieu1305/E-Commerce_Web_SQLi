import { Navigate, Outlet } from "react-router-dom";
import NotAuthorized403 from "./PageResult/NotAuthorized403";

const ProtectedRoute = () => {
  const role = localStorage.getItem("user_role");

  if (role !== "ADMIN") {
    return <NotAuthorized403 />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
