import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user)
    return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role))
  {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Nemate dozvolu za pristup ovoj stranici.
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;