import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import NavBar from "../componentes/Navbar";
import arrow from "../assets/arrow.svg";
import camera from "../assets/camera.svg";
import texto from "../assets/texto.svg";
import progresso from "../assets/progresso.svg";
import finalizar from "../assets/finalizar.svg";
import processarV from "../assets/processarV.svg";
import atencao from "../assets/atencao.svg";
import start from "../assets/start.svg";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { CandidaturaService } from '../services/CandidaturaService';

export default function Candidaturas() {
  const [displayedText, setDisplayedText] = useState("");
  const navigate = useNavigate();
  const fullText = "Avaliação Profissional em Vídeo: Uma Nova Forma de se Destacar";
  
  const { User } = useAuth();
  const { disableItem, isItemDisabled } = useContext(AuthContext);
  const [avaliacaoFinalizada, setAvaliacaoFinalizada] = useState(false);
  const [isAvaliacaoDisabled, setIsAvaliacaoDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Função para obter o ID do usuário
  const getUserId = () => {
    return User?.uid || auth.currentUser?.uid;
  };

  // Função para verificar se a avaliação está desabilitada para o usuário
  const checkAvaliacaoStatus = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      const status = await avaliacaoService.checkAvaliacaoStatus(userId);
      
      if (status.disabled) {
        setIsAvaliacaoDisabled(true);
        setTimeRemaining(status.timeRemaining);
      } else {
        setIsAvaliacaoDisabled(false);
        setTimeRemaining(null);
      }
    } catch (error) {
      console.error("Erro ao verificar status da avaliação:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para desabilitar a avaliação por 3 meses
const disableAvaliacaoFor3Months = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      console.error("Usuário não autenticado");
      return;
    }

    const result = await avaliacaoService.disableAvaliacaoFor3Months(userId);
    
    setIsAvaliacaoDisabled(true);
    setTimeRemaining(result.disabledUntil - new Date());
    
    console.log(`Avaliação desabilitada até: ${result.disabledUntil.toLocaleDateString()}`);
  } catch (error) {
    console.error("Erro ao desabilitar avaliação:", error);
  }
};

  const fecharAvaliacao = async () => {
    console.log("Finalizando avaliação...");
    setAvaliacaoFinalizada(true);
    
    // Desabilita a avaliação para este usuário por 3 meses
    await disableAvaliacaoFor3Months();
    
    // Desabilita o item no contexto (opcional, para UI imediata)
    disableItem("candidaturas-nav");
  };

  // Função para formatar o tempo restante
  const formatTimeRemaining = (milliseconds) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} dias, ${hours} horas`;
    } else if (hours > 0) {
      return `${hours} horas, ${minutes} minutos`;
    } else {
      return `${minutes} minutos`;
    }
  };

  // Atualizar o tempo restante a cada minuto
  useEffect(() => {
    let interval;
    if (isAvaliacaoDisabled && timeRemaining) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 60000) { // Se restam menos de 1 minuto
            setIsAvaliacaoDisabled(false);
            return null;
          }
          return prev - 60000; // Subtrai 1 minuto
        });
      }, 60000); // Atualiza a cada minuto
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAvaliacaoDisabled, timeRemaining]);

  // Verificar status ao carregar o componente
  useEffect(() => {
    checkAvaliacaoStatus();
  }, [User]);

  // Efeito da digitação
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 90);

    return () => clearInterval(typingInterval);
  }, []);

  // Função para renderizar o texto com as spans coloridas
  const renderTypedText = (text) => {
    return text
      .replace("Vídeo:", '<span class="text-[#BFF205]">Vídeo:</span>')
      .replace("Nova", '<span class="text-[#BFF205]">Nova</span>');
  };

  if (loading) {
    return (
      <div className="bg-[#060B0D] min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#060B0D]">
      <NavBar />

      <img src={arrow} alt="" />
      <div className="container mx-auto px-6 py-8">
        <div className="relative top-[60rem] inset-0 z-0 w-full m-auto blur-[100px] ml-48">
          <div className="absolute inset-0 m-auto w-screen h-screen min-w-[1000px] overflow-hidden rounded-full bg-white scale-[0.8]">
            <div className="absolute inset-0 m-auto w-screen h-screen animate-spinBlob bg-conic-gradient"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-16">
          <h1 className="text-5xl text-white md:text-6xl font-poppins font-bold mb-8 mt-60">
            <span
              dangerouslySetInnerHTML={{
                __html:
                  renderTypedText(displayedText) +
                  (displayedText.length < fullText.length
                    ? '<span class="animate-pulse">|</span>'
                    : ""),
              }}
            />
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-inter mb-64">
            Mostre quem você é de verdade. Responda perguntas da sua área, seja
            avaliado com autenticidade e tenha sua fala transcrita no perfil.
          </p>
        </div>

        {/* Mensagem de avaliação desabilitada */}
        {isAvaliacaoDisabled && (
          <div className="bg-yellow-600/20 border border-yellow-600 rounded-2xl p-6 mb-8 text-center">
            <h3 className="text-yellow-400 text-xl font-semibold mb-2">
              Avaliação Temporariamente Indisponível
            </h3>
            <p className="text-yellow-300">
              Você já realizou a avaliação recentemente. Poderá fazer uma nova avaliação em:
            </p>
            <p className="text-yellow-400 font-bold text-lg mt-2">
              {timeRemaining ? formatTimeRemaining(timeRemaining) : "Carregando..."}
            </p>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Início Automático da Gravação */}
          <div className="bg-gray-800/50 text-center backdrop-blur border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300">
            <img src={camera} className="imgCards" />
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
            <img src={texto} className="imgCards" />
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
            <img src={progresso} className="imgCards" />
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
            <img src={finalizar} className="imgCards" />
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
            <img src={processarV} className="imgCards" />
            <h3 className="text-xl font-semibold mb-3 text-white">
              Processamento do Vídeo
            </h3>
            <p className="text-gray-300 text-sm">
              Suas respostas serão processadas automaticamente. Tudo o que foi
              dito será transcrito e adicionado ao seu perfil profissional.
            </p>
          </div>

          <div className="bg-gray-800/50 text-center flex-col items-center justify-center backdrop-blur border border-red-300 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300 md:col-span-2 lg:col-span-1">
            <img src={atencao} className="imgCards" />
            <h3 className="text-xl font-semibold mb-3 text-white">
              Aviso sobre Repetição do Teste
            </h3>
            <p className="text-gray-300 text-sm">
              Após iniciar o teste, não será possível repeti-lo imediatamente. 
              Cada candidato pode realizar uma nova avaliação a cada 3 meses . 
              Durante esse período, a opção de teste permanecerá desactivada.
            </p>
          </div>
          
        </div>

        {/* Start Button */}
        <div className="text-center">
          {!isAvaliacaoDisabled ? (
            <Link to="/avaliação">
              <button
                onClick={fecharAvaliacao}
                className="bg-black hover:bg-black/30 text-white px-8 py-4 my-24 rounded-2xl text-lg font-semibold border border-gray-600 transition-all duration-300 flex items-center mx-auto space-x-3 hover:border-lime-400"
              >
                <span>Começar</span>
                <img src={start} alt="" />
              </button>
            </Link>
          ) : (
            <button
              disabled
              className="bg-gray-600 text-gray-400 px-8 py-4 my-24 rounded-2xl text-lg font-semibold border border-gray-600 transition-all duration-300 flex items-center mx-auto space-x-3 cursor-not-allowed"
            >
              <span>Indisponível</span>
              <img src={start} alt="" className="opacity-50" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
