import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import useAuth from "../hooks/useAuth";
import logo from "../assets/logo.svg";
import google from "../assets/google.svg";
import user from "../assets/user.svg";
import man from "../assets/man.png";
import email from "../assets/email-2.svg";
import docum from "../assets/doc.svg";
import cadeado from "../assets/cadeado.svg";
import phone from "../assets/phone.svg";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";

function Formulario() {
  const { SetUser, User, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    accountType: "",
    contact: "",
    fullName: "",
    area: "",
    agreeTerms: false,
    avatar: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState({ message: "", color: "", className: "" });

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!loading && isAuthenticated && User) {
      const accountType = User.accountType?.trim().toLowerCase();
      
      if (accountType === "empresa") {
        navigate("/homeEmpresa", { replace: true });
      } else if (accountType === "profissional") {
        navigate("/home", { replace: true });
      } else {
        navigate("/selectAccountType", { replace: true });
      }
    }
  }, [isAuthenticated, User, loading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const angolanPhoneRegex = /^(\+244)?9\d{8}$/;

  const handleNext = () => {
    const requiredFields = ["accountType", "contact", "fullName", "area"];
    const missing = requiredFields.some((field) => !formData[field]);

    if (missing) {
      setError({
        message: "Por favor, preencha todos os campos.",
        color: "text-red-500",
        className: "relative",
      });
      return;
    }

    if (!angolanPhoneRegex.test(formData.contact)) {
      setError({
        message: "Número de telefone inválido. Ex: +2449******** ou 9********",
        color: "text-red-500",
        className: "relative",
      });
      return;
    }

    if (!formData.agreeTerms) {
      setError({
        message: "Você deve aceitar os termos para continuar.",
        color: "text-red-500",
        className: "relative",
      });
      return;
    }

    setError({ message: "", color: "", className: "" });
    setStep(2);
  };

  // Função para verificar se email já existe no Firebase Auth
  const checkEmailExists = async (email) => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return signInMethods.length > 0; // Se retornar array com métodos, email já existe
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      return false; // Em caso de erro, permitir continuar
    }
  };

const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    if (result.user) {
      const { uid, displayName, photoURL, email } = result.user;
      if (!displayName || !photoURL)
        throw new Error("O usuário não tem foto ou nome.");

      // Verificar se o usuário já existe no Firestore usando o UID
      const userRef = doc(db, "users", uid); // ✅ Usar UID em vez de formData.email
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        // Usuário já existe - fazer login
        const userData = docSnap.data();
        
        // Verificar se precisa completar o cadastro
        if (!userData.accountType || !userData.area) {
          setError({
            message: "Complete seu cadastro selecionando o tipo de conta e área.",
            color: "text-yellow-500",
            className: "mb-0",
          });
          // O usuário será redirecionado para SelectAccountType pelo useEffect
          return;
        }
        
        setError({
          message: "Bem-vindo de volta! Login realizado com sucesso.",
          color: "text-green-500",
          className: "mb-0",
        });
      } else {
        // Novo usuário - criar registro no Firestore SEM accountType e area
        // para que seja redirecionado para SelectAccountType
        await setDoc(userRef, {
          fullName: displayName,
          avatar: photoURL,
          email,
          contact: "", // Será preenchido posteriormente se necessário
          area: "", // Será preenchido no SelectAccountType
          accountType: "", // Será preenchido no SelectAccountType
          id: uid
        });
        
        setError({
          message: "Conta criada! Complete seu cadastro.",
          color: "text-green-500",
          className: "mb-0",
        });
      }

      // O AuthContext automaticamente detectará a mudança e redirecionará
    }
  } catch (error) {
    console.error("Erro ao autenticar com Google:", error);
    setError({
      message: "Erro ao fazer login com Google. Tente novamente.",
      color: "text-red-500",
      className: "mb-0",
    });
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError({ 
        message: "Preencha todos os campos.", 
        color: "text-red-500",
        className: "mb-0"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError({ 
        message: "Email inválido.", 
        color: "text-red-500",
        className: "mb-0"
      });
      return;
    }

    if (formData.password.length < 6) {
      setError({
        message: "A senha deve ter pelo menos 6 caracteres.",
        color: "text-red-500",
        className: "mb-0",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError({ 
        message: "As senhas não coincidem.", 
        color: "text-red-500",
        className: "mb-0"
      });
      return;
    }

    try {
      // Verificar se o email já existe no sistema
      const emailExists = await checkEmailExists(formData.email);
      
      if (emailExists) {
        setError({ 
          message: "Este email já está cadastrado no nosso sistema. Faça login ou use outro email.", 
          color: "text-red-500",
          className: "mb-0"
        });
        return;
      }

      // Se o email não existe, criar a conta
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Salvar dados no Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: formData.email,
        contact: formData.contact,
        fullName: formData.fullName,
        area: formData.area,
        accountType: formData.accountType,
        avatar: "",
        id: user.uid
      });
      
      // O AuthContext automaticamente detectará o usuário logado e redirecionará
      
    } catch (err) {
      console.error("Erro ao cadastrar:", err.message);
      
      // Verificar se é erro de email já existente (dupla proteção)
      if (err.code === 'auth/email-already-in-use') {
        setError({ 
          message: "Este email já está cadastrado. Faça login ou use outro email.", 
          color: "text-red-500",
          className: "mb-0"
        });
      } else if (err.code === 'auth/weak-password') {
        setError({ 
          message: "A senha é muito fraca. Use pelo menos 6 caracteres.", 
          color: "text-red-500",
          className: "relative"
        });
      } else if (err.code === 'auth/invalid-email') {
        setError({ 
          message: "Email inválido.", 
          color: "text-red-500",
          className: "mb-0"
        });
      } else {
        setError({ 
          message: "Erro ao criar conta. Tente novamente.", 
          color: "text-red-500",
          className: "mb-0"
        });
      }
    }
  };

  // Se ainda estiver carregando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060B0D]">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <img src={man} alt="" />
      <img className="absolute mt-8 ml-8" src={logo} alt="" />
      <p className="mt-[41rem] ml-[3.75rem] absolute text-[32px] font-extrabold text-[#ffffff]">
        CONECTAMOS TALENTOS E <br />
        <span className="text-[#A1CA0A]">
          OPORTUNIDADES DE <br /> CARREIRA
        </span>
      </p>

      <div className="ml-[9rem]">
        <h1 className="text-3xl font-semibold mt-[4rem] ml-24 mb-8">
          Crie uma conta
        </h1>

        {step === 1 && (
          <div>
            <img className="absolute top-44 pl-4" src={user} alt="" />
            <select
              className={`input ${
                formData.accountType === "" ? "text-black/60" : "text-black"
              }`}
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                Tipo de conta
              </option>
              <option value="Empresa">Empresa</option>
              <option value="Profissional">Profissional</option>
            </select>

            <img className="absolute top-[16.3rem] ml-3" src={docum} alt="" />
            <input
              className="input"
              type="text"
              name="fullName"
              placeholder={
                formData.accountType === "Empresa"
                  ? "Nome da Empresa"
                  : "Nome Completo"
              }
              value={formData.fullName}
              onChange={handleChange}
            />

            <img className="absolute top-[21.5rem] ml-3" src={phone} alt="" />
            <input
              className="input"
              type="text"
              name="contact"
              placeholder="Número de tel."
              value={formData.contact}
              onChange={handleChange}
            />

            <img className="absolute mt-[2.8rem] ml-3" src={user} alt="" />
            <select
              className={`input ${
                formData.area === "" ? "text-black/60" : "text-black"
              }`}
              name="area"
              value={formData.area}
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                Área de Atuação
              </option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Educação">Educação</option>
              <option value="Contabilidade">Contabilidade</option>
            </select>

            {error.message && (
              <p className={`${error.color} text-sm mt-2`}>{error.message}</p>
            )}

            <div className="flex items-center mt-9 mb-8">
              <input
                type="checkbox"
                className="w-[1.2rem] h-[1.2rem] mr-[8px] border-[#AFAFAF] rounded-[6px]"
                checked={formData.agreeTerms}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    agreeTerms: e.target.checked,
                  }))
                }
              />
              <p>
                Aceito os{" "}
                <Link to="/termosdepolitica" className="text-blue-600 underline">
                  termos de privacidade
                </Link>{" "}
                e{" "}
                <Link to="/termosdepolitica" className="text-blue-600 underline">
                  política
                </Link>
              </p>
            </div>

            <button className="btn" onClick={handleNext}>
              Continuar
            </button>

            <div className="flex mt-10 ml-4">
              <hr className="w-[8rem] border-[#AFAFAF]" />
              <span className="mt-[-0.8rem] ml-[0.4rem] text-black/60">
                ou registrar com{" "}
              </span>
              <hr className="w-[9rem] ml-[0.3rem] border-[#AFAFAF]" />
            </div>

            <img
              className="absolute w-8 h-8 top-[44.6rem] left-[53rem]"
              src={google}
              alt=""
            />
            <button
              className="w-[27.5rem] mt-8 h-[3.4rem] text-[#00000] font-semibold border border-[#AFAFAF] rounded-[8px]"
              onClick={handleGoogleLogin}
            >
              Continuar com o Google
            </button>

            <p className="mt-[32px] ml-32">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-[#A1CA0A] cursor-pointer">
                Entrar
              </Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <form className="flex flex-col mt-10" onSubmit={handleSubmit}>
            <img className="absolute mt-[2.9rem] ml-3" src={email} alt="" />
            <input
              className="input"
              type="email"
              name="email"
              placeholder={
                formData.accountType === "Empresa"
                  ? "Email Corporativo"
                  : "Email"
              }
              value={formData.email}
              onChange={handleChange}
            />
            <img className="absolute mt-[7.9rem] ml-3" src={cadeado} alt="" />
            <input
              className="input"
              type="password"
              name="password"
              placeholder="Criar Senha"
              value={formData.password}
              onChange={handleChange}
            />
            <img className="absolute mt-[13.4rem] ml-3" src={cadeado} alt="" />
            <input
              className="input"
              type="password"
              name="confirmPassword"
              placeholder="Confirmar Senha"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {error.message && (
              <p className={`${error.color} text-sm mt-2`}>{error.message}</p>
            )}

            <button className="btn mt-10" type="submit">
              Cadastrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Formulario;  
