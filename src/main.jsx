import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext"; // Importando o provider do contexto
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

// Configurando as rotas
const router = createBrowserRouter([
  {
    path: "/", // Rota principal
    element: <App />, // Página principal com redirecionamento
    children: [
      {
        path: "cadastro", // Página de cadastro
        element: <Cadastro />,
      },
      {
        path: "home", // Página da geração da historia
        element: <Home />,
      },
      {
        path: "login", // Página da geração da historia
        element: <Login />,
      },
      {
        path: "mentorias", // Página da geração da historia
        element: <Mentorias />,
      },
      {
        path: "sobrenos", // Página da geração da historia
        element: <SobreNos />,
      },
      {
        path: "candidaturas", // Página da geração da historia
        element: <Candidaturas />,
      },
       {
        path: "termosdepolitica", // Página da geração da historia
        element: <Termos />,
      },
       {
        path: "homeEmpresa", // Página da geração da historia
        element: <HomeEmpresa />,
      },
      {
        path: "selectAccountType", // Página da geração da historia
        element: <SelectAccountType />,
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
