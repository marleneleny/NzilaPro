import { useState } from 'react';

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="bg-[#5A6363]/20 rounded-lg mb-4 overflow-hidden border border-gray-700">
      <div 
        className="flex justify-between items-center p-6 cursor-pointer hover:bg-[#5A6363]/30 transition-colors duration-300"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <h3 className="text-white font-medium text-lg flex-1 mr-4">
          {question}
        </h3>
        <div 
          className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 ${
            isOpen 
              ? 'bg-red-500 rotate-45' 
              : 'bg-green-500 rotate-0'
          }`}
        >
          +
        </div>
      </div>
      <div 
        className={`overflow-hidden transition-all duration-300 bg-gray-750 ${
          isOpen ? 'max-h-48 p-6' : 'max-h-0 p-0'
        }`}
      >
        <p className="text-gray-300 leading-relaxed text-sm">
          {answer}
        </p>
      </div>
    </div>
  );
};

export default function NzilaFAQ() {
  const [openIndex, setOpenIndex] = useState(1); // Second item open by default

  const faqData = [
    {
      question: "Como funciona a avaliação profissional em vídeo?",
      answer: "A avaliação profissional em vídeo da Nzila permite que você demonstre suas habilidades de forma prática e autêntica. Você receberá perguntas específicas para sua área e poderá responder através de vídeos curtos, mostrando não apenas suas competências técnicas, mas também suas habilidades de comunicação e presença profissional."
    },
    {
      question: "Preciso ter experiência para usar a Nzila?",
      answer: "Não! A Nzila foi pensada justamente para incluir todos os profissionais, desde iniciantes até os mais experientes. Se você está começando no mercado ou não tem experiência no trabalho, pode se beneficiar das nossas mentorias, que ajudam a desenvolver habilidades técnicas, comportamentos profissionais."
    },
    {
      question: "Posso escolher para qual vaga quero me candidatar?",
      answer: "Sim! Na Nzila você tem total controle sobre sua busca por oportunidades. Você pode navegar pelas vagas disponíveis, filtrar por área de interesse, localização e tipo de trabalho, e escolher especificamente para quais posições deseja se candidatar. Nossa plataforma também sugere vagas que combinam com seu perfil."
    },
    {
      question: "O que é a mentoria da Nzila?",
      answer: "A mentoria da Nzila é um programa de desenvolvimento profissional personalizado, onde profissionais experientes te orientam no crescimento da sua carreira. Nossos mentores ajudam você a desenvolver habilidades técnicas, melhorar competências comportamentais, preparar-se para entrevistas e construir um networking sólido na sua área de atuação."
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className=" min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        {faqData.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </div>
  );
}