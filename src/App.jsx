import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { useNavigate, Outlet } from "react-router-dom";

export default function App() {
  const { User } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (User) {
      console.log("Usuário autenticado, redirecionando para ...");
      navigate("/home", { replace: true });
    } else {
      console.log(
        "Nenhum usuário autenticado, redirecionando para cadastro..."
      );
      navigate("/cadastro", { replace: true });
    }
  }, [User, navigate]);

  return (
    <div>
      <Outlet />
    </div>
  );
}
