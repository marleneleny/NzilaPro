import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

export default function PrivateRoute({ children }) {
  const { User, loading, isAuthenticated } = useContext(AuthContext);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060B0D]">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated || !User) {
    return <Navigate to="/login" replace />;
  }

  // Se está autenticado, mostrar o conteúdo protegido
  return children;
}
