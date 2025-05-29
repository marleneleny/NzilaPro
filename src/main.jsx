import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext"; 
import App from "./App";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import Login from "./pages/Login";
import "./index.css";
import Mentorias from "./pages/Mentorias";
import SobreNos from "./pages/SobreNos";
import Candidaturas from "./pages/Candidaturas";
import Termos from "./pages/Termos";
import HomeEmpresa from "./pages/HomeEmpresa";
import SelectAccountType from "./pages/SelectAccountType";
import RedirectOnStart from "./componentes/RedirectOnStart";
import PrivateRoute from "./PrivateRoute";
import Profile from "./pages/profile";

// Configurando as rotas
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <RedirectOnStart />
      },
      {
        path: "cadastro",
        element: <Cadastro />,
      },
      {
        path: "login",
        element: <Login />,
      },

      // PROTEGIDAS
      {
        path: "home",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "mentorias",
        element: (
          <PrivateRoute>
            <Mentorias />
          </PrivateRoute>
        ),
      },
      {
        path: "candidaturas",
        element: (
          <PrivateRoute>
            <Candidaturas />
          </PrivateRoute>
        ),
      },
      {
        path: "homeEmpresa",
        element: (
          <PrivateRoute>
            <HomeEmpresa />
          </PrivateRoute>
        ),
      },
      {
        path: "selectAccountType",
        element: (
          <PrivateRoute>
            <SelectAccountType />
          </PrivateRoute>
        ),
      },

      // NÃO PROTEGIDAS
      {
        path: "sobrenos",
        element: <SobreNos />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "termosdepolitica",
        element: <Termos />,
      },
      
    ],
  },
]);

// Renderizando a aplicação
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthContextProvider>
      {" "}
      {/* Envolvendo a aplicação com o Provider */}
      <RouterProvider router={router} />
    </AuthContextProvider>
  </StrictMode>
);
