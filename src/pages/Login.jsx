import ImgLogin from "../assets/ImgLogin.png";
import emailIcon from "../assets/email-2.svg";
import cadeado from "../assets/cadeado.svg";
import logo from "../assets/logo.svg";
import google from "../assets/google.svg";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { db } from "../services/firebase"; 
import { deleteUser } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função para mapear códigos de erro do Firebase para mensagens em português
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado. Verifique seu email ou cadastre-se.';
      case 'auth/wrong-password':
        return 'Senha incorreta. Tente novamente.';
      case 'auth/invalid-email':
        return 'Email inválido. Verifique o formato do email.';
      case 'auth/user-disabled':
        return 'Esta conta foi desabilitada. Entre em contato com o suporte.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas de login. Tente novamente mais tarde.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      case 'auth/invalid-credential':
        return 'Credenciais inválidas. Verifique seu email e senha.';
      case 'auth/account-exists-with-different-credential':
        return 'Já existe uma conta com este email usando outro método de login.';
      case 'auth/popup-closed-by-user':
        return 'Login cancelado. Tente novamente.';
      case 'auth/popup-blocked':
        return 'Pop-up bloqueado pelo navegador. Permita pop-ups e tente novamente.';
      default:
        return 'Erro inesperado. Tente novamente mais tarde.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validações básicas do lado cliente
    if (!email.trim()) {
      setError("Por favor, digite seu email.");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Por favor, digite sua senha.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verificar se o email foi verificado (opcional)
      if (!user.emailVerified) {
        console.warn("Email não verificado, mas permitindo login");
        // Descomente a linha abaixo se quiser forçar verificação de email
        // throw new Error("Por favor, verifique seu email antes de fazer login.");
      }
      
      // Fetch user data from Firestore to get accountType
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const accountType = userData.accountType;
        
        console.log("Login accountType:", accountType);
        
        // Navigate based on accountType
        if (accountType && accountType.trim().toLowerCase() === "empresa") {
          alert("Login realizado com sucesso! Bem-vindo(a)!");
          navigate("/homeEmpresa", { replace: true });
        } else {
          alert("Login realizado com sucesso! Bem-vindo(a)!");
          navigate("/home", { replace: true });
        }
      } else {
        // Se os dados do usuário não existem no Firestore
        setError("Dados do usuário não encontrados. Entre em contato com o suporte.");
        await signOut(auth); // Deslogar o usuário
      }
    } catch (error) {
      console.error("Erro no login:", error);
      
      if (error.message === "Por favor, verifique seu email antes de fazer login.") {
        setError(error.message);
      } else {
        const errorMessage = getErrorMessage(error.code);
        setError(errorMessage);
        console.log("Erro exibido:", errorMessage); // Debug
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account' // Força o usuário a selecionar uma conta
      });
      
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        const user = result.user;
        const { uid } = user;
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          try {
            // First, delete the Auth account that was just created
            await deleteUser(user);
          } catch (deleteError) {
            console.error("Erro ao deletar usuário:", deleteError.message);
            // If we can't delete, at least sign them out
            await signOut(auth);
          } 
          setError("Esta conta do Google não está cadastrada. Por favor, cadastre-se primeiro.");
          setLoading(false);
          return;
        }

        // User exists in Firestore, get accountType
        const userData = docSnap.data();
        const accountType = userData.accountType;
        
        console.log("Google login accountType:", accountType);
        
        // Navigate based on accountType
        if (accountType && accountType.trim().toLowerCase() === "empresa") {
          alert("Login com Google realizado com sucesso! Bem-vindo(a)!");
          navigate("/homeEmpresa", { replace: true });
        } else {
          alert("Login com Google realizado com sucesso! Bem-vindo(a)!");
          navigate("/home", { replace: true });
        }
      }
    } catch (error) {
      console.error("Erro ao autenticar com Google:", error);
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      console.log("Erro Google exibido:", errorMessage); // Debug
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <img src={ImgLogin} alt="" />
      <img className="absolute mt-8 ml-8" src={logo} alt="Logo" />

      <p className="mt-[22rem] ml-[5rem] absolute text-[32px] font-extrabold text-[#ffffff]">
        Conectamos profissionais e <br /> empresas para transformar o <br />
        <span className="text-[#A1CA0A]">mercado de trabalho.</span>
      </p>

      <div className="ml-[9rem]">
        <h1 className="text-3xl font-semibold mt-[8rem] ml-40 mb-8">Entrar</h1>

        <form className="flex flex-col mt-10" onSubmit={handleSubmit}>
          <div className="relative">
            <img
              className="absolute mt-[2.8rem] ml-3 z-10"
              src={emailIcon}
              alt="Email"
            />
            <input
              className="input pl-10"
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="relative mt-2">
            <img
              className="absolute mt-[2.8rem] ml-3 z-10"
              src={cadeado}
              alt="Senha"
            />
            <input
              className="input pl-10"
              type="password"
              name="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            className={`btn mt-10 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {error && (
            <div className="mt-4 py-2">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!error && (
            <div className="text-red-600 h-16"></div>
          )}
        </form>

        <div className="flex  ml-4 items-center">
          <hr className="w-[8rem] border-[#AFAFAF]" />
          <span className="mx-2 text-black/60">ou registrar com</span>
          <hr className="w-[8rem] border-[#AFAFAF]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-[27.5rem] mt-8 h-[3.4rem] flex items-center justify-center gap-3 text-[#000] font-semibold border border-[#AFAFAF] rounded-[8px] ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          <img src={google} className="w-6 h-6" alt="Google" />
          {loading ? 'Processando...' : 'Continuar com o Google'}
        </button>

        <p className="mt-[32px] ml-20">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="text-[#A1CA0A] cursor-pointer hover:underline">
            Cadastrar
          </Link>
        </p>
      </div>
    </div>
  );
}