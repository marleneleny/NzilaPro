import logo from "../assets/logo.svg";
import arrow from "../assets/arrow.svg";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase"; 
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

export default function SelectAccountType() {
  const [step, setStep] = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,  // Changed to true so animations only happen once
      mirror: false
    });
  }, []);

  // Refresh AOS only when step changes
  useEffect(() => {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }, [step]);

  const cards = [
    {
      type: "Profissional",
      title: "Sou um Profissional",
      description: "Desejo prestar serviços como indivíduo.",
    },
    {
      type: "Empresa",
      title: "Sou uma Empresa",
      description: "Desejo cadastrar minha empresa para contratar ou anunciar serviços.",
    },
  ];

  const areas = [
    { type: "Tecnologia" },
    { type: "Educação" },
    { type: "Contabilidade" },
  ];

  const handleCardClick = (index) => {
    setSelectedCard(index);
    setError("");
  };

  const handleAreaClick = (index) => {
    setSelectedArea(index);
    setError("");
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (selectedCard === null) {
        setError("Por favor, selecione um tipo de conta.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedArea === null) {
        setError("Por favor, selecione uma área de atuação.");
        return;
      }

      const selectedAccountType = cards[selectedCard].type;
      const selectedAreaType = areas[selectedArea].type;

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            accountType: selectedAccountType,
            area: selectedAreaType,
          });

          if (selectedAccountType === "Profissional") {
            navigate("/home");
          } else {
            navigate("/homeEmpresa");
          }
        } else {
          setError("Usuário não autenticado.");
        }
      } catch (err) {
        console.error("Erro ao salvar os dados:", err);
        setError("Erro ao salvar. Tente novamente.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060B0D] text-white relative">
      {/* Fundo animado */}
      <div className="fixed inset-0 z-0 w-full h-full m-auto blur-[100px] ml-48">
        <div className="absolute inset-0 m-auto w-screen h-screen min-w-[1000px] overflow-hidden rounded-full bg-white scale-[0.8]">
          <div className="absolute inset-0 m-auto w-screen h-screen animate-spinBlob bg-conic-gradient"></div>
        </div>
      </div>

      {/* Logo */}
      <img className="absolute ml-[4rem] mt-9" src={logo} alt="Logo" />

      {/* Título e descrição */}
      <h1 
        className="absolute text-4xl font-black left-32 mt-48"
        data-aos="fade-right"
        data-aos-duration="1000"
      >
        {step === 1 ? (
          <>
            Escolha como deseja <br /> se cadastrar.
          </>
        ) : (
          <>
            Qual é a sua área <br /> de atuação?
          </>
        )}
      </h1>

      <p 
        className={`absolute font-inter font-thin w-[30rem] leading-7 left-32 mt-80 text-[#d1d0d0]`}
        data-aos="fade-right"
        data-aos-delay="200"
        data-aos-duration="1000"
      >
        {step === 1
          ? "Selecione o tipo de conta que melhor representa você ou sua empresa e informe em qual área atua. Essas informações ajudam a personalizar sua experiência na plataforma."
          : "Escolha a área que melhor representa sua atuação profissional. Isso ajudará a conectar você com oportunidades relevantes."}
      </p>

      {/* Botão continuar */}
      <button
        onClick={handleContinue}
        className={`absolute ${step === 1 ? 'top-[28rem]' : 'top-[26rem]'} left-32 w-40 h-10 bg-white text-black font-poppins font-semibold relative`}
        data-aos="fade-right"
        data-aos-delay="400"
        data-aos-duration="1000"
      >
      
        {step === 1 ? "Continuar" : "Finalizar"}
        <div className="absolute flex justify-center items-center w-8 h-8 bottom-7 left-36 bg-black/80 rounded">
          <img className="w-6 h-6" src={arrow} alt="" />
        </div>
      </button>

      {/* Cards de Step 1 (tipo de conta) */}
      {step === 1 && (
        <div 
          className="absolute font-inter top-[16rem] left-[46rem] flex gap-8"
          data-aos="fade-left"
          data-aos-duration="1000"
        >
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              className={`w-64 p-6 rounded-xl text-left transition-all duration-300 ${
                selectedCard === index
                  ? "bg-[#BFF205]/10 text-white border border-[#bff205ad]"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <h2 className="font-bold text-xl mb-2">{card.title}</h2>
              <p className="text-sm">{card.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Cards de Step 2 (área de atuação) */}
      {step === 2 && (
        <div 
          className="absolute font-inter top-[15rem] left-[46rem]"
          data-aos="fade-left"
          data-aos-duration="1000"
        >
          {areas.map((area, index) => (
            <button
              key={index}
              onClick={() => handleAreaClick(index)}
              className={`w-60 p-4 m-3 rounded-xl text-center transition-all duration-300 ${
                selectedArea === index
                  ? "bg-[#BFF205]/10 text-white border border-[#bff205ad]"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <h2 className="text-xl">{area.type}</h2>
            </button>
          ))}
        </div>
      )}

      {/* Erro */}
      {error && (
        <p 
          className={`absolute ${step === 1 ? 'top-[32rem]' : 'top-[30rem]'} left-32 text-red-400 font-medium`}
          data-aos="fade-up"
          data-aos-duration="600"
        >
          {error}
        </p>
      )}
    </div>
  );
}