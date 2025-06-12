import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Clock, Users, BarChart3, Star, CheckCircle, Lock, User, Calendar, Award } from 'lucide-react';
import NavBar from "../componentes/Navbar"; // Assuming NavBar is a common component
import NzilaFooter from "../componentes/NzilaFooter"; // Assuming NzilaFooter is a common component
import AOS from "aos";
import "aos/dist/aos.css";

export default function NzilaMentoriaSystem() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedMentoria, setSelectedMentoria] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 2000,
      once: true,
    });
    window.scrollTo(0, 0);
  }, [currentView]);

  const mentorias = [
    {
      id: 1,
      title: "Construa uma Carreira de Sucesso",
      description: "Aprenda a traçar metas profissionais realistas, identificar suas principais habilidades e definir estratégias para crescer de forma consistente no mercado de trabalho.",
      mentor: "José Van-Dúnem",
      mentorRole: "Profissional de RH",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop",
      duration: "3h 45min",
      students: 1250,
      level: "Iniciante",
      modules: 4,
      price: "Kz 8.500",
      rating: 4.8,
      isNew: true
    },
    {
      id: 2,
      title: "Networking Estratégico para Profissionais",
      description: "Desenvolva habilidades de networking eficazes, construa relacionamentos profissionais sólidos e amplie suas oportunidades de carreira através de conexões estratégicas.",
      mentor: "Maria Santos",
      mentorRole: "Consultora de Carreira",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop",
      duration: "4h 20min",
      students: 890,
      level: "Intermediário",
      modules: 5,
      price: "Kz 12.000",
      rating: 4.9,
      isNew: false
    },
    {
      id: 3,
      title: "Liderança e Gestão de Equipes",
      description: "Aprenda técnicas de liderança moderna, gestão de conflitos, motivação de equipes e como se tornar um líder influente em sua área de atuação.",
      mentor: "Carlos Mendes",
      mentorRole: "Diretor de RH",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop",
      duration: "5h 15min",
      students: 2100,
      level: "Avançado",
      modules: 6,
      price: "Kz 15.500",
      rating: 4.7,
      isNew: false
    }
  ];

  const mentoriaDetalhes = {
    1: {
      modules: [
        {
          id: 1,
          title: "Fundamentos da Carreira Profissional",
          description: "Entenda os pilares de uma carreira sólida e como definir seus objetivos profissionais de forma clara e alcançável.",
          lessons: 8,
          duration: "1h 15min",
          isNew: true
        },
        {
          id: 2,
          title: "Autoconhecimento e Habilidades",
          description: "Identifique suas competências técnicas e comportamentais, pontos fortes e áreas de desenvolvimento.",
          lessons: 6,
          duration: "55min",
          isNew: false
        },
        {
          id: 3,
          title: "Estratégias de Crescimento",
          description: "Aprenda técnicas para acelerar seu crescimento profissional e se destacar no mercado de trabalho.",
          lessons: 7,
          duration: "1h 10min",
          isNew: false
        },
        {
          id: 4,
          title: "Planejamento de Carreira a Longo Prazo",
          description: "Desenvolva um plano estratégico para sua carreira com metas de curto, médio e longo prazo.",
          lessons: 5,
          duration: "45min",
          isNew: false
        }
      ],
      prerequisites: "Recomendado para profissionais em início de carreira ou em transição profissional",
      skills: ["Planejamento estratégico", "Autoconhecimento", "Definição de metas", "Desenvolvimento profissional"]
    }
  };

  const MentoriaCard = ({ mentoria }) => (
    <div
      data-aos="fade-up" // Adicionado AOS para o card
      className="bg-black border border-[#525252] rounded-xl p-6 hover:border-[#BFF205] transition-all duration-300 cursor-pointer" // Ajustado bg e border
      onClick={() => {
        setSelectedMentoria(mentoria);
        setCurrentView('detalhes');
      }}
    >
      <div className="relative mb-4">
        <img
          src={mentoria.image}
          alt={mentoria.title}
          className="w-full h-48 object-cover rounded-lg"
        />
        {mentoria.isNew && (
          <span className="absolute top-3 right-3 bg-[#BFF205] text-black px-2 py-1 rounded-md text-xs font-semibold">
            NOVO
          </span>
        )}
      </div>

      <h3 className="text-xl font-poppins font-semibold mb-3 text-white">{mentoria.title}</h3> {/* Font Poppins */}
      <p className="text-[#D7D7D7]/70 text-sm mb-4 leading-relaxed font-inter">{mentoria.description}</p> {/* Font Inter */}

      <div className="border-t border-[#525252] pt-4 mb-4"> {/* Ajustado border-t */}
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-[#BFF205] rounded-full flex items-center justify-center mr-3">
            <User className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-white font-medium font-poppins">{mentoria.mentor}</p> {/* Font Poppins */}
            <p className="text-[#D7D7D7]/70 text-xs font-inter">{mentoria.mentorRole}</p> {/* Font Inter */}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-[#D7D7D7]/70 font-inter"> {/* Font Inter */}
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{mentoria.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{mentoria.students}</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-400" />
            <span>{mentoria.rating}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[#BFF205] font-bold text-lg font-poppins">{mentoria.price}</span> {/* Font Poppins */}
        <span className="bg-[#1C1C1C] px-3 py-1 rounded-full text-xs text-gray-300 font-inter"> {/* Ajustado bg e font Inter */}
          {mentoria.level}
        </span>
      </div>
    </div>
  );

  const MentoriaDetalhes = ({ mentoria }) => {
    const detalhes = mentoriaDetalhes[mentoria.id];

    return (
      <div className="min-h-screen bg-[#060B0D] text-white font-poppins"> {/* Main font Poppins */}
        <NavBar /> {/* Adicionado NavBar */}
        {/* Header */}
        <div className="border-b border-[#1C1C1C] px-6 py-40"> {/* Ajustado border-b */}
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center text-[#D7D7D7]/70 hover:text-white mb-4 transition-colors font-inter" // Font Inter
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-4xl font-bold mb-2 font-poppins">{mentoria.title}</h1> {/* Font Poppins */}
                <p className="text-[#D7D7D7]/70 max-w-2xl font-inter">{mentoria.description}</p> {/* Font Inter */}

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="bg-[#BFF205] text-black px-3 py-1 rounded-full text-sm font-semibold font-poppins"> {/* Font Poppins */}
                    MENTORIA
                  </span>
                  <span className="bg-[#1C1C1C] px-3 py-1 rounded-full text-sm font-inter"> {/* Ajustado bg e font Inter */}
                    {mentoria.level}
                  </span>
                  <span className="bg-[#1C1C1C] px-3 py-1 rounded-full text-sm font-inter"> {/* Ajustado bg e font Inter */}
                    {mentoria.modules} MÓDULOS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-w-7xl mx-auto py-12"> {/* Centralizado e padding ajustado */}
          {/* Content */}
          <div className="flex-1 px-6">
            <div className="max-w-4xl">
              {/* Mentor Info */}
              <div data-aos="fade-up" className="bg-black border border-[#525252] rounded-xl p-6 mb-8"> {/* Adjusted bg and border */}
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-[#BFF205] rounded-full flex items-center justify-center mr-4">
                    <User className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-poppins">{mentoria.mentor}</h3> {/* Font Poppins */}
                    <p className="text-[#D7D7D7]/70 font-inter">{mentoria.mentorRole}</p> {/* Font Inter */}
                  </div>
                </div>

                <p className="text-[#D7D7D7]/70 leading-relaxed font-inter"> {/* Font Inter */}
                  Profissional experiente com mais de 10 anos de atuação em Recursos Humanos,
                  especializado em desenvolvimento de carreira e gestão de talentos. Já orientou
                  centenas de profissionais em suas jornadas de crescimento profissional.
                </p>
              </div>

              {/* Course Overview */}
              <div data-aos="fade-up" className="mb-8">
                <h2 className="text-2xl font-bold mb-4 font-poppins">Sobre a mentoria</h2> {/* Font Poppins */}
                <p className="text-[#D7D7D7]/70 leading-relaxed mb-6 font-inter"> {/* Font Inter */}
                  Esta mentoria foi desenvolvida para profissionais que desejam acelerar seu
                  crescimento de carreira de forma estratégica. Você aprenderá metodologias
                  práticas para autoconhecimento, definição de objetivos profissionais e
                  construção de um plano de carreira sólido e realista.
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-black border border-[#525252] rounded-lg p-4 text-center"> {/* Adjusted bg and border */}
                    <Clock className="w-6 h-6 text-[#BFF205] mx-auto mb-2" />
                    <div className="text-sm text-[#D7D7D7]/70 font-inter">Duração</div> {/* Font Inter */}
                    <div className="font-semibold font-poppins">{mentoria.duration}</div> {/* Font Poppins */}
                  </div>
                  <div className="bg-black border border-[#525252] rounded-lg p-4 text-center"> {/* Adjusted bg and border */}
                    <Users className="w-6 h-6 text-[#BFF205] mx-auto mb-2" />
                    <div className="text-sm text-[#D7D7D7]/70 font-inter">Alunos</div> {/* Font Inter */}
                    <div className="font-semibold font-poppins">{mentoria.students}</div> {/* Font Poppins */}
                  </div>
                  <div className="bg-black border border-[#525252] rounded-lg p-4 text-center"> {/* Adjusted bg and border */}
                    <BarChart3 className="w-6 h-6 text-[#BFF205] mx-auto mb-2" />
                    <div className="text-sm text-[#D7D7D7]/70 font-inter">Nível</div> {/* Font Inter */}
                    <div className="font-semibold font-poppins">{mentoria.level}</div> {/* Font Poppins */}
                  </div>
                  <div className="bg-black border border-[#525252] rounded-lg p-4 text-center"> {/* Adjusted bg and border */}
                    <Award className="w-6 h-6 text-[#BFF205] mx-auto mb-2" />
                    <div className="text-sm text-[#D7D7D7]/70 font-inter">Certificado</div> {/* Font Inter */}
                    <div className="font-semibold font-poppins">Incluído</div> {/* Font Poppins */}
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              {detalhes && (
                <div data-aos="fade-up" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 font-poppins">Pré-requisitos</h3> {/* Font Poppins */}
                  <div className="bg-black border border-[#525252] rounded-lg p-4"> {/* Adjusted bg and border */}
                    <p className="text-[#D7D7D7]/70 font-inter">{detalhes.prerequisites}</p> {/* Font Inter */}
                  </div>
                </div>
              )}

              {/* Modules */}
              {detalhes && (
                <div data-aos="fade-up" className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold font-poppins">Conteúdos</h3> {/* Font Poppins */}
                    <button className="text-[#BFF205] hover:text-[#bff205e3] text-sm font-medium font-poppins transition-colors"> {/* Font Poppins */}
                      Ver tudo →
                    </button>
                  </div>

                  <div className="space-y-4">
                    {detalhes.modules.map((module, index) => (
                      <div key={module.id} className="bg-black border border-[#525252] rounded-lg"> {/* Adjusted bg and border */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="bg-[#BFF205] text-black px-2 py-1 rounded text-xs font-semibold mr-3 font-poppins"> {/* Font Poppins */}
                                MÓDULO {module.id} {/* Changed NÍVEL to MÓDULO for clarity */}
                              </span>
                              {module.isNew && (
                                <span className="bg-purple-600 px-2 py-1 rounded text-xs font-semibold font-poppins"> {/* Font Poppins */}
                                  NOVO
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[#D7D7D7]/70 font-inter"> {/* Font Inter */}
                              {module.lessons} AULAS • {module.duration}
                            </div>
                          </div>

                          <h4 className="font-semibold text-lg mb-2 font-poppins">{module.title}</h4> {/* Font Poppins */}
                          <p className="text-[#D7D7D7]/70 text-sm font-inter">{module.description}</p> {/* Font Inter */}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 p-6 border-l border-[#1C1C1C]"> {/* Ajustado border-l */}
            <div className="sticky top-6">
              <div data-aos="fade-up" data-aos-delay="200" className="bg-black border border-[#525252] rounded-xl p-6 mb-6"> {/* Adjusted bg and border */}
                <h3 className="font-semibold mb-4 font-poppins">Progresso detalhado</h3> {/* Font Poppins */}

                <div className="mb-6">
                  <div className="text-sm text-[#D7D7D7]/70 mb-1 font-inter">OBRIGATÓRIO</div> {/* Font Inter */}
                  <div className="flex items-center justify-between mb-2 font-inter"> {/* Font Inter */}
                    <span>Aulas</span>
                    <span className="text-[#D7D7D7]/70">0/{detalhes?.modules.reduce((acc, mod) => acc + mod.lessons, 0) || 26}</span>
                  </div>
                  <div className="w-full bg-[#1C1C1C] rounded-full h-2 mb-4"> {/* Adjusted bg */}
                    <div className="bg-[#BFF205] h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-2xl font-bold font-poppins">0%</span> {/* Font Poppins */}
                </div>

                <button className="w-full bg-[#BFF205] text-black font-semibold py-3 px-4 rounded-lg hover:bg-[#bff205e3] transition-colors font-poppins"> {/* Font Poppins */}
                  Iniciar →
                </button>

                <div className="text-center mt-4"> {/* Added margin-top */}
                  <div className="text-2xl font-bold text-[#BFF205] mb-1 font-poppins">{mentoria.price}</div> {/* Font Poppins */}
                  <div className="text-sm text-[#D7D7D7]/70 font-inter">ou 12x de Kz 708 sem juros</div> {/* Font Inter */}
                </div>
              </div>

              <div data-aos="fade-up" data-aos-delay="300" className="space-y-4 pt-4 border-t border-[#1C1C1C]"> {/* Added padding-top and border-top */}
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#BFF205] mr-3" />
                  <span className="text-sm font-inter">Materiais de Apoio</span> {/* Font Inter and clearer text */}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#BFF205] mr-3" />
                  <span className="text-sm font-inter">Fórum de Dúvidas</span> {/* Font Inter and clearer text */}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#BFF205] mr-3" />
                  <span className="text-sm font-inter">Certificado de Conclusão</span> {/* Font Inter and clearer text */}
                </div>
                <div className="flex items-center">
                  <Lock className="w-5 h-5 text-[#BFF205] mr-3" />
                  <span className="text-sm font-inter">Acesso Vitalício</span> {/* Font Inter and clearer text */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <NzilaFooter /> {/* Adicionado NzilaFooter */}
      </div>
    );
  };

  const MentoriaHome = () => (
    <div className="min-h-screen bg-[#060B0D] text-white font-poppins"> {/* Main font Poppins */}
      <NavBar /> {/* Adicionado NavBar */}
      {/* Header */}
      <div className="border-b border-[#1C1C1C] px-6 py-8"> {/* Ajustado border-b */}
        <div className="max-w-7xl ">
          <div data-aos="fade-down" className="mb-6 mt-40">
            <span className="bg-[#BFF205]  text-black mt-96 px-3 py-1 rounded-full text-sm font-semibold font-poppins"> {/* Font Poppins */}
              MENTORIAS NZILA
            </span>
          </div>
          <h1 data-aos="fade-down" data-aos-delay="100" className="text-4xl lg:text-5xl font-bold mb-4 font-poppins"> {/* Font Poppins */}
            Acelere sua Carreira com
            <span className="text-[#BFF205]"> Mentoria Especializada</span>
          </h1>
          <p data-aos="fade-down" data-aos-delay="200" className="text-xl text-[#D7D7D7]/70 max-w-3xl font-inter"> {/* Font Inter */}
            Desenvolva habilidades estratégicas com profissionais experientes do mercado
            angolano e construa uma carreira sólida e bem-sucedida.
          </p>
        </div>
      </div>

      {/* Featured Section */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div data-aos="fade-right">
              <h2 className="text-3xl font-bold mb-6 font-poppins"> {/* Font Poppins */}
                Conheça nossas mentorias especializadas
              </h2>
              <p className="text-[#D7D7D7]/70 leading-relaxed mb-6 font-inter"> {/* Font Inter */}
                Nossas mentorias são desenvolvidas por profissionais experientes do mercado
                angolano, com foco prático e estratégico para acelerar seu crescimento
                profissional. Cada mentoria inclui exercícios práticos, materiais de apoio
                e certificado de conclusão.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center bg-black border border-[#525252] rounded-lg p-4"> {/* Adjusted bg and border */}
                  <div className="text-3xl font-bold text-[#BFF205] mb-2 font-poppins">3.500+</div> {/* Font Poppins */}
                  <div className="text-sm text-[#D7D7D7]/70 font-inter">Profissionais Capacitados</div> {/* Font Inter */}
                </div>
                <div className="text-center bg-black border border-[#525252] rounded-lg p-4"> {/* Adjusted bg and border */}
                  <div className="text-3xl font-bold text-[#BFF205] mb-2 font-poppins">15+</div> {/* Font Poppins */}
                  <div className="text-sm text-[#D7D7D7]/70 font-inter">Mentores Especialistas</div> {/* Font Inter */}
                </div>
              </div>
            </div>

            <div data-aos="fade-left" className="relative">
              <div className="bg-gradient-to-br from-[#BFF205] to-[#8fac04] rounded-2xl p-8 text-black">
                <div className="mb-4">
                  <Star className="w-8 h-8 mb-2" />
                  <h3 className="text-xl font-bold font-poppins">Mentoria Premium</h3> {/* Font Poppins */}
                </div>
                <p className="mb-6 font-inter"> {/* Font Inter */}
                  Acesso completo a todas as mentorias, sessões ao vivo e networking exclusivo
                  com mentores e outros profissionais.
                </p>
                <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors font-poppins"> {/* Font Poppins */}
                  Saiba Mais
                </button>
              </div>
            </div>
          </div>

          {/* Mentorias Grid */}
          <div className="mb-40 mt-40">
            <h2 data-aos="fade-up" className="text-2xl font-bold mb-8 font-poppins">Mentorias Disponíveis</h2> {/* Font Poppins */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mentorias.map(mentoria => (
                <MentoriaCard key={mentoria.id} mentoria={mentoria} />
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div data-aos="fade-up" className="bg-black border border-[#525252] rounded-2xl p-8 text-center"> {/* Adjusted bg and border */}
            <h3 className="text-2xl font-bold mb-4 font-poppins"> {/* Font Poppins */}
              Pronto para acelerar sua carreira?
            </h3>
            <p className="text-[#D7D7D7]/70 mb-6 max-w-2xl mx-auto font-inter"> {/* Font Inter */}
              Junte-se a milhares de profissionais que já transformaram suas carreiras
              com nossas mentorias especializadas.
            </p>
            <button className="bg-[#BFF205] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#bff205e3] transition-colors font-poppins"> {/* Font Poppins */}
              Ver Todas as Mentorias
            </button>
          </div>
        </div>
      </div>
      <NzilaFooter /> {/* Adicionado NzilaFooter */}
    </div>
  );

  if (currentView === 'detalhes' && selectedMentoria) {
    return <MentoriaDetalhes mentoria={selectedMentoria} />;
  }

  return <MentoriaHome />;
}

