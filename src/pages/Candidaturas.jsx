import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Adicione esta importação
import NavBar from "../componentes/Navbar";
import arrow from "../assets/arrow.svg";
import camera from "../assets/camera.svg";
import texto from "../assets/texto.svg";
import progresso from "../assets/progresso.svg";
import finalizar from "../assets/finalizar.svg";
import processarV from "../assets/processarV.svg";
import start from "../assets/start.svg";

export default function Candidaturas() {
  const [displayedText, setDisplayedText] = useState('');
  const navigate = useNavigate(); // Hook para navegação
  const fullText = "Avaliação Profissional em Vídeo: Uma Nova Forma de se Destacar";
  
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 90); // Velocidade da digitação (80ms por caractere)

    return () => clearInterval(typingInterval);
  }, []);

  // Função para renderizar o texto com as spans coloridas
  const renderTypedText = (text) => {
    return text
      .replace('Vídeo:', '<span class="text-[#BFF205]">Vídeo:</span>')
      .replace('Nova', '<span class="text-[#BFF205]">Nova</span>');
  };

  // Função para iniciar a entrevista
  const handleStartInterview = () => {
    navigate('/avaliação'); // Navega para a tela de entrevista
  };

  return (
    <div className="bg-[#060B0D]">
      <NavBar />

      <img  src={arrow} alt="" />
      <div className="container mx-auto px-6 py-8">
        <div className="relative top-[60rem] inset-0 z-0 w-full  m-auto blur-[100px] ml-48">
          <div className="absolute inset-0 m-auto w-screen h-screen min-w-[1000px] overflow-hidden rounded-full bg-white scale-[0.8]">
            <div className="absolute inset-0 m-auto w-screen h-screen animate-spinBlob bg-conic-gradient"></div>
          </div>
        </div>
        {/* Main Content */}
        <div className="text-center mb-16">
          <h1 className="text-5xl text-white md:text-6xl font-poppins font-bold mb-8 mt-60">
            <span 
              dangerouslySetInnerHTML={{ 
                __html: renderTypedText(displayedText) + 
                (displayedText.length < fullText.length ? '<span class="animate-pulse">|</span>' : '')
              }}
            />
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-inter mb-64">
            Mostre quem você é de verdade. Responda perguntas da sua área, seja
            avaliado com autenticidade e tenha sua fala transcrita no perfil.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Início Automático da Gravação */}
          <div className="bg-gray-800/50 text-center backdrop-blur border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300">
            <img  src={camera} className="imgCards" />
            <h3 className="text-xl font-semibold mb-3 text-white">
              Início Automático da Gravação
            </h3>
            <p className="text-gray-300 text-sm">
              Ao clicar em "Começar", sua câmera será ativada e a gravação
              começará automaticamente.
            </p>
          </div>

          {/* Perguntas por Texto */}
          <div className="bg-gray-800/50 text-center backdrop-blur border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300">
            <img  src={texto} className="imgCards" />
            <h3 className="text-xl font-semibold mb-3 text-white">
              Perguntas por Texto
            </h3>
            <p className="text-gray-300 text-sm">
              As perguntas aparecerão na tela em formato de texto. Leia com
              atenção e responda falando diretamente para a câmera.
            </p>
          </div>

          {/* Controle de Progresso */}
          <div className="bg-gray-800/50 text-center backdrop-blur border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300">
            <img  src={progresso} className="imgCards" />
            <h3 className="text-xl font-semibold mb-3 text-white">
              Controle de Progresso
            </h3>
            <p className="text-gray-300 text-sm">
              Ao finalizar uma resposta, clique em "Next Question" para
              continuar. Um símbolo de "✓" aparecerá confirmando o envio da sua
              resposta.
            </p>
          </div>

          {/* Finalização do Teste */}
          <div className="bg-gray-800/50 text-center backdrop-blur border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300">
            <img  src={finalizar} className="imgCards" />
            <h3 className="text-xl font-semibold mb-3 text-white">
              Finalização do Teste
            </h3>
            <p className="text-gray-300 text-sm">
              Após a última pergunta, o botão mudará para "Finish". Clique nele
              para encerrar a avaliação.
            </p>
          </div>

          {/* Processamento do Vídeo */}
          <div className="bg-gray-800/50 text-center flex-col items-center justify-center backdrop-blur border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300 md:col-span-2 lg:col-span-1">
            <img  src={processarV} className="imgCards" />
            <h3 className="text-xl font-semibold mb-3 text-white">
              Processamento do Vídeo
            </h3>
            <p className="text-gray-300 text-sm">
              Suas respostas serão processadas automaticamente. Tudo o que foi
              dito será transcrito e adicionado ao seu perfil profissional.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button 
            onClick={handleStartInterview}
            className="bg-black hover:bg-black/30 text-white px-8 py-4 my-24 rounded-2xl text-lg font-semibold border border-gray-600 transition-all duration-300 flex items-center mx-auto space-x-3 hover:border-lime-400"
          >
            <span>Começar</span>
            <img src={start} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}