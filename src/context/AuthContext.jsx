import React, { createContext, useState } from "react";


export const AuthContext = createContext();

// Provider do contexto que fornece dados para os componentes
export function AuthContextProvider({ children }) {
  const [User, SetUser] = useState(null); // Armazena os dados do usuário

  

  return (
    <AuthContext.Provider value={{ User, SetUser }}>
      {children} {/* Envolvendo os filhos com o Provider */}
    </AuthContext.Provider>
  );
}
