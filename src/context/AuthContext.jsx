import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [User, SetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [disabledItems, setDisabledItems] = useState([]);

const disableItem = (itemId) => {
    setDisabledItems(prev => {
      if (!prev.includes(itemId)) {
        return [...prev, itemId];
      }
      return prev;
    });
  };

  const enableItem = (itemId) => {
    setDisabledItems(prev => prev.filter(id => id !== itemId));
  };

  const isItemDisabled = (itemId) => {
    return disabledItems.includes(itemId);
  };

  const clearAllDisabledItems = () => {
    setDisabledItems([]);
  };
  // Initialize auth state on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Buscar dados do usuário no Firestore
          const userRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // Criar objeto do usuário com estrutura consistente
            const userObject = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.fullName || firebaseUser.displayName,
              avatar: userData.avatar || firebaseUser.photoURL || "",
              type: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
              accountType: userData.accountType || "",
              contact: userData.contact || "",
              area: userData.area || "",
              ...userData // Inclui outros dados do Firestore
            };
            
            SetUser(userObject);
            setIsAuthenticated(true);
            
            // Salvar no sessionStorage para persistência durante a sessão
            sessionStorage.setItem('user', JSON.stringify(userObject));
            
            console.log("Usuário carregado:", userObject);
          } else {
            console.log("Dados do usuário não encontrados no Firestore");
            // Se não há dados no Firestore mas o usuário está autenticado
            const basicUserData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || "",
              avatar: firebaseUser.photoURL || "",
              type: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
              accountType: "",
              contact: "",
              area: ""
            };
            
            SetUser(basicUserData);
            setIsAuthenticated(true);
            sessionStorage.setItem('user', JSON.stringify(basicUserData));
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          SetUser(null);
          setIsAuthenticated(false);
          sessionStorage.removeItem('user');
        }
      } else {
        // Usuário não autenticado
        SetUser(null);
        setIsAuthenticated(false);
        sessionStorage.removeItem('user');
        console.log("Usuário não autenticado");
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (userData) => {
    try {
      setLoading(true);
      
      SetUser(userData);
      setIsAuthenticated(true);
      
      // Save to session storage
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await auth.signOut();
      SetUser(null);
      setIsAuthenticated(false);
      sessionStorage.removeItem('user');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Update user function
  const updateUser = (updatedUserData) => {
    const newUserData = { ...User, ...updatedUserData };
    SetUser(newUserData);
    sessionStorage.setItem('user', JSON.stringify(newUserData));
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return User && User.accountType && User.accountType.toLowerCase() === role.toLowerCase();
  };

  const contextValue = {
    // State
    User,
    SetUser,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    updateUser,
    
    // Utility functions
    hasRole,

    // ADICIONAR ESTAS LINHAS - Novas funções no contextValue
    disabledItems,
    disableItem,
    enableItem,
    isItemDisabled,
    clearAllDisabledItems
  };
  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="min-h-screen flex items-center justify-center bg-[#060B0D]">
          <div className="text-white text-xl">Carregando...</div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
