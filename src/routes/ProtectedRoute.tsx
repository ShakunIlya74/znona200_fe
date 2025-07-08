import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingDots from "../components/tools/LoadingDots";


const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, redirectPath } = useAuth(location.pathname);

  if (isLoading) {
    return <LoadingDots />;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
