import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext"; // Importando o provider do contexto
import App from "./App";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import "./index.css";

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
