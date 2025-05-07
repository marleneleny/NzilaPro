import ImgLogin from "../assets/ImgLogin.png";
import email from "../assets/email-2.svg";
import cadeado from "../assets/cadeado.svg";
import logo from "../assets/logo.svg";
import google from "../assets/google.svg";
import { Link } from "react-router-dom";

export default function Login() {
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
  return (
    <div className="flex">
      <img src={ImgLogin} alt="" />
      <img className="absolute mt-8 ml-8" src={logo} alt="" />
      <p className="mt-[22rem] ml-[5rem] absolute text-[32px] font-extrabold text-[#ffffff]">
        Conectamos profissionais e <br /> empresas para transformar o <br />
        <span className="text-[#A1CA0A]">mercado de trabalho.</span>
      </p>
      <div className="ml-[9rem]">
        <h1 className="text-3xl font-semibold mt-[8rem] ml-40 mb-8">Entrar</h1>

        <form className="flex flex-col mt-10">
          <img className="absolute mt-[2.9rem] ml-3" src={email} alt="" />
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
          />
          <img className="absolute mt-[7.9\rem] ml-3" src={cadeado} alt="" />
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Senha"
          />

          <button className="btn mt-10" type="submit">
            Cadastrar
          </button>
        </form>
        <div className="flex mt-10 ml-4">
          <hr className="w-[8rem] border-[#AFAFAF]" />
          <span className="mt-[-0.8rem] ml-[0.4rem] text-black/60">
            ou registrar com{" "}
          </span>
          <hr className="w-[9rem] ml-[0.3rem] border-[#AFAFAF]" />
        </div>
        <img
          className="absolute w-8 h-8 top-[35.2rem] left-[53rem]"
          src={google}
          alt=""
        />
        <button
          className="w-[27.5rem] mt-8 h-[3.4rem] text-[#00000] font-semibold border border-[#AFAFAF] rounded-[8px]"
          onClick={handleGoogleLogin}
        >
          Continuar com o Google
        </button>
        <p className=" mt-[32px] ml-32">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-[#A1CA0A] cursor-pointer">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
