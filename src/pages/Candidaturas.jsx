import React from 'react';
import { Camera, Type, RotateCcw, List, Play, Bell } from 'lucide-react';
import NavBar from "../componentes/Navbar";

export default function Candidaturas() {
  return (
    <div className="bg-[#060B0D]">
      <NavBar/>
      
      <style jsx>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating-icon {
          animation: rotate 10s linear infinite;
        }
      `}</style>

      {/* Floating Icons around H1 */}
      <div className="absolute top-48 left-24 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center rotating-icon">
        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
        </div>
      </div>
      
      <div className="absolute top-80 left-10 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center rotating-icon">
        <div className="w-6 h-6 text-white">📊</div>
      </div>
      
      <div className="absolute top-[28rem] left-24 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center rotating-icon">
        <div className="w-6 h-6 text-white">✉️</div>
      </div>
      
      <div className="absolute top-48 right-28 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center rotating-icon">
        <div className="w-6 h-6 text-white">🚫</div>
      </div>
      
      <div className="absolute top-80 right-10 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center rotating-icon">
        <div className="w-6 h-6 text-white">🚀</div>
      </div>
      
      <div className="absolute top-[28rem] right-28 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center rotating-icon">
        <div className="w-6 h-6 text-white">📷</div>
      </div>



      <div className="container mx-auto px-6 py-8">
        <div className="relative top-[60rem] inset-0 z-0 w-full  m-auto blur-[100px] ml-48">
        <div className="absolute inset-0 m-auto w-screen h-screen min-w-[1000px] overflow-hidden rounded-full bg-white scale-[0.8]">
          <div className="absolute inset-0 m-auto w-screen h-screen animate-spinBlob bg-conic-gradient"></div>
        </div>
      </div>
        {/* Main Content */}
        <div className="text-center mb-16">
          <h1 className="text-5xl text-white md:text-6xl font-poppins font-bold mb-8 mt-60">
            Avaliação Profissional em <span className="text-[#BFF205]">Vídeo:</span> <br /> Uma <span className="text-[#BFF205]">Nova</span> Forma de se Destacar
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-inter mb-64">
            Mostre quem você é de verdade. Responda perguntas da sua área, seja
            avaliado com autenticidade e tenha sua fala transcrita no perfil.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Início Automático da Gravação */}
          <div className="bg-gray-800/50 backdrop-blur border border-lime-400 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300">
            <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Início Automático da Gravação
            </h3>
            <p className="text-gray-300 text-sm">
              Ao clicar em "Começar", sua câmera será ativada e a gravação
              começará automaticamente.
            </p>
          </div>

          {/* Perguntas por Texto */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300">
            <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mb-4">
              <Type className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Perguntas por Texto
            </h3>
            <p className="text-gray-300 text-sm">
              As perguntas aparecerão na tela em formato de texto. Leia com
              atenção e responda falando diretamente para a câmera.
            </p>
          </div>

          {/* Controle de Progresso */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300">
            <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6 text-gray-900" />
            </div>
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
          <div className="bg-gray-800/50 backdrop-blur border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300">
            <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mb-4">
              <List className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Finalização do Teste
            </h3>
            <p className="text-gray-300 text-sm">
              Após a última pergunta, o botão mudará para "Finish". Clique nele
              para encerrar a avaliação.
            </p>
          </div>

          {/* Processamento do Vídeo */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300 md:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-gray-900" />
            </div>
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
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold border border-gray-600 transition-all duration-300 flex items-center mx-auto space-x-3 hover:border-lime-400">
            <span>Começar</span>
            <div className="w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-gray-900 ml-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}