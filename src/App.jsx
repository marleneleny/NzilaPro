import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { useNavigate, Outlet } from "react-router-dom";

export default function App() {
  const { User } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!User) {
      navigate("/cadastro", { replace: true });
    } 
      
    }, [User, navigate]);

  return (
    <div>
      <Outlet />
    </div>
  );
}
