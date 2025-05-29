import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RedirectOnStart() {
  const { User, loading, isAuthenticated } = useContext(AuthContext);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060B0D]">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para cadastro
  if (!isAuthenticated || !User) {
    return <Navigate to="/cadastro" replace />;
  }

  // Se está autenticado, verificar tipo de conta e redirecionar
  const accountType = User.accountType?.trim().toLowerCase();
  
  if (accountType === "empresa") {
    return <Navigate to="/homeEmpresa" replace />;
  } else if (accountType === "profissional") {
    return <Navigate to="/home" replace />;
  } else {
    // Se não tem tipo de conta definido, redirecionar para seleção
    return <Navigate to="/selectAccountType" replace />;
  }
}
