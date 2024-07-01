import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function AdminLayout() {
  const auth = useAuth();

  if (!auth) return null;
  if (!auth.user) return null;
  if (auth.user.email !== "admin@gmail.com") return <Navigate to={"/"} />;

  return <Outlet />;
}

export default AdminLayout;
