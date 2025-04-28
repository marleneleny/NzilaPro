import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import useAuth from "../hooks/useAuth";
import logo from "../assets/logo.svg"
import google from "../assets/google.svg"
import user from "../assets/user.svg"
import email from "../assets/email-2.svg"
import docum from "../assets/doc.svg"
import cadeado from "../assets/cadeado.svg"
import phone from "../assets/phone.svg"
import dashboard from "../assets/dashboard.jpeg"
import mCard from "../assets/5k+.jpeg"
import curvas from "../assets/curvas.png"

function Formulario() {
  const { SetUser, User } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    accountType: "",
    contact: "",
    fullName: "",
    area: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState({ message: "", color: "" });

  useEffect(() => {
    if (User) {
      navigate("/apresentacao");
    }
  }, [User, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        const { uid, displayName, photoURL, email } = result.user;

        if (!displayName || !photoURL) {
          throw new Error("O usuário não tem foto ou nome.");
        }

        SetUser({
          id: uid,
          avatar: photoURL,
          name: displayName,
          email,
          type: "google",
        });
      }
    } catch (error) {
      console.error("Erro ao autenticar com Google:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (!formData.accountType || !formData.contact || !formData.fullName) {
      setError({ message: "Por favor, preencha todos os campos.", color: "text-red-500" });
      return;
    }
    setError({ message: "", color: "" }); // Reset do erro
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError({ message: "As senhas não coincidem.", color: "text-red-500" });
      return;
    }

    try {
      const ref = doc(firestore, "users", formData.email);
      await setDoc(ref, formData);

      SetUser({ email: formData.email, ...formData });
      navigate("/apresentacao");
    } catch (err) {
      console.error("Erro ao salvar os dados:", err);
    }
  };

  return (
    
    <div>
      <img className="mt-8 ml-8" src={logo} alt="" />
      <div className="ml-[4.5rem]">
        <h1 className="text-3xl font-semibold mt-[4rem] ml-20">Crie uma conta</h1>
        {step === 1 && (
          <div>
            <img className="absolute w-8 h-8 top-[14.6rem] left-36" src={google} alt="" />
            <button className="w-[27.5rem] mt-14 h-[3.4rem] text-[#00000]  border border-[#AFAFAF] rounded-[8px]" onClick={handleGoogleLogin}>Continuar com o Google</button>
            <div className="flex mt-12 ml-4">
              <hr className="w-[8rem] border-[#AFAFAF]"/>
              <span className="mt-[-0.8rem] ml-[0.4rem] text-[#151515]">ou registrar com </span>
              <hr className="w-[9rem] ml-[0.3rem] border-[#AFAFAF]"/>
            </div>
            <div   className="flex mt-[2.5rem]">
            <img className="absolute " src={user} alt="" />
            <select className="pl-11 appearance-none flex w-[12.5rem] pb-[8px] border-b border-[#AFAFAF] outline-none focus:border-[#117D77]" name="accountType" value={formData.accountType} onChange={handleChange}>
              <option value="">Tipo de Conta</option>
              <option value="Empresa">Empresa</option>
              <option value="Profissional">Profissional</option>
            </select>
           
            <img className="absolute ml-[14.25rem]" src={phone} alt="" />
            <input  className="pl-11 placeholder:text-black pb-[8px] ml-[1.8rem] w-[12.5rem] border-b border-[#AFAFAF] outline-none focus:border-[#117D77]" type="text" name="contact" placeholder="Contato" value={formData.contact} onChange={handleChange} />
            </div>
            <img className="absolute mt-[3rem]" src={docum} alt="" />
            <input  className=" input" type="text" name="fullName" placeholder="Nome Completo" value={formData.fullName} onChange={handleChange} />
            {error.message && <p className={`${error.color} text-sm mt-2`}>{error.message}</p>}

            <p className=" mt-[32px] mb-[32px]">Já tem uma conta?<a className="text-[#6361C3]">Entrar</a></p>  
            <button className="btn" onClick={handleNext}>Continuar</button>      
             
             </div>
        )}

        {step === 2 && (
          <form className="flex flex-col mt-10" onSubmit={handleSubmit}>
             <img className="absolute mt-[3rem]" src={user} alt="" />
            <input className="input" type="text" name="area" placeholder="Área de Atuação" value={formData.area} onChange={handleChange} />
            <img className="absolute mt-[8rem]" src={email} alt="" />
            <input className="input" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <img className="absolute mt-[12.8rem]" src={cadeado} alt="" />
            <input className="input" type="password" name="password" placeholder="Criar Senha" value={formData.password} onChange={handleChange} />
            <img className="absolute mt-[17.7rem]" src={cadeado} alt="" />
            <input className="input"type="password" name="confirmPassword" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={handleChange} />
            {error.message && <p className={`${error.color} text-sm mt-2`}>{error.message}</p>}

            <div className="flex items-center mt-9 mb-8">
              <input className="w-[1.2rem] h-[1.2rem] mr-[8px] mt- border-[#AFAFAF] rounded-[6px]" type="checkbox" name="" id="" />
              <p>Aceito os termos de privacidade e política</p>
            </div>
            <button className="btn" type="submit">Cadastrar</button>
          </form>
        )}
      </div>
      <img className="absolute left-[25rem] top-[-12rem] w-[100rem] h-[64rem]" src={curvas} alt="" />
      <img className="absolute left-[52rem] top-[6rem] w-[35rem] h-[35rem]" src={dashboard} alt="" />
      <img className="absolute left-[46rem] rounded-3xl top-[4rem] w-[12rem] h-[8rem]" src={mCard} alt="" />
     
    </div>
   
  );
}

export default Formulario;

