import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../../store/auth.js";
import { Loader } from "lucide-react";

const PrivateRoute = () => {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
