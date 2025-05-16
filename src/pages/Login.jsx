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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user data from Firestore to get accountType
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const accountType = userData.accountType;
        
        console.log("Login accountType:", accountType);
        
        // Navigate based on accountType
        if (accountType && accountType.trim().toLowerCase() === "empresa") {
          alert("Login feito com sucesso!");
          navigate("/homeEmpresa", { replace: true });
        } else {
          alert("Login feito com sucesso!");
          navigate("/home", { replace: true });
        }
      } else {
        // If user data doesn't exist in Firestore for some reason
        alert("Login feito com sucesso!");
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Erro no login:", error.message);
      setError("Email ou senha incorretos. Verifique seus dados.");
    }
  };


const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
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
        setError("Esta conta do Google ainda não está cadastrada.");
        return;
      }

      // User exists in Firestore, get accountType
      const userData = docSnap.data();
      const accountType = userData.accountType;
      
      console.log("Google login accountType:", accountType);
      
      // Navigate based on accountType
      if (accountType && accountType.trim().toLowerCase() === "empresa") {
        navigate("/homeEmpresa", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  } catch (error) {
    console.error("Erro ao autenticar com Google:", error.message);
    setError("Erro ao entrar com Google. Tente novamente.");
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
              className="absolute mt-[2.8rem] ml-3"
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
              required
            />
          </div>

          <div className="relative mt-6">
            <img
              className="absolute mt-[2.8rem] ml-3"
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
              required
            />
          </div>

          <button className="btn mt-10" type="submit">
            Entrar
          </button>
          {error && (
    <p className="text-red-600 text-center mt-4 font-medium">{error}</p>
  )}
        </form>

        <div className="flex mt-10 ml-4 items-center">
          <hr className="w-[8rem] border-[#AFAFAF]" />
          <span className="mx-2 text-black/60">ou registrar com</span>
          <hr className="w-[8rem] border-[#AFAFAF]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-[27.5rem] mt-8 h-[3.4rem] flex items-center justify-center gap-3 text-[#000] font-semibold border border-[#AFAFAF] rounded-[8px]"
        >
          <img src={google} className="w-6 h-6" alt="Google" />
          Continuar com o Google
        </button>

        <p className="mt-[32px] ml-20">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="text-[#A1CA0A] cursor-pointer">
            Cadastrar
          </Link>
        </p>
      </div>
    </div>
  );
}