import NavBar from "../componentes/Navbar";
import NzilaFooter from "../componentes/NzilaFooter"; // Assuming NzilaFooter is a common component
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";


import aboutUsHero from "../assets/unsplash_office_hero.jpg";
import office1 from "../assets/unsplash_office1.jpg";
import office2 from "../assets/unsplash_office2.jpg";
import team1 from "../assets/unsplash_team1.jpg";
import team2 from "../assets/unsplash_team2.jpg";
import team3 from "../assets/unsplash_team3.jpg";
import team4 from "../assets/unsplash_team4.jpg";

import useAuth from "../hooks/useAuth";

export default function SobreNos() {
  useEffect(() => {
    AOS.init({
      duration: 2000,
      once: true,
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#060B0D] text-white font-poppins"> {/* Adjusted background, text color, and main font to Poppins */}
      <NavBar />

      {/* Hero Section */}
      <div className="pt-64 pb-16 bg-[#060B0D] text-center"> {/* Adjusted background */}
        <h1 data-aos="fade-down" className="font-bold text-[70px] md:text-[90px] leading-[1.1] tracking-tight text-white"> {/* Adjusted text color */}
          SOBRE NÓS.
        </h1>
      </div>

      {/* Company Description */}
      <div data-aos="fade-up" className="container mx-auto px-4 md:px-0 py-12 max-w-4xl text-lg text-[#D7D7D7]/70"> {/* Adjusted text color */}
        <p className="mb-6">
          A Nzila nasceu da paixão por conectar talentos e empresas em Angola. Fundada em 2025, nossa jornada começou com a visão de simplificar e otimizar o processo de recrutamento, tornando-o mais eficiente e justo para todos.
        </p>
        <p className="mb-6">
          Ao longo dos anos, construímos uma plataforma robusta e confiável, impulsionada pela nossa dedicação à inovação e ao profundo conhecimento do mercado de trabalho angolano. Nossa missão é clara: conectar profissionais qualificados às melhores oportunidades de carreira, enquanto ajudamos as empresas a encontrar os talentos que precisam para crescer.
        </p>
        <p>
          Acreditamos no poder das conexões significativas e no impacto que um bom talento pode ter em uma organização. É por isso que investimos continuamente em tecnologia e em nosso time, para oferecer a melhor experiência possível para candidatos e recrutadores.
        </p>
      </div>

      {/* Image Grid */}
      <div className="container mx-auto px-4 md:px-0 py-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <img data-aos="zoom-in" src={office1} alt="Escritório da Nzila" className="rounded-lg shadow-md" />
        <img data-aos="zoom-in" src={office2} alt="Equipe trabalhando" className="rounded-lg shadow-md" />
      </div>

      {/* Quote Section */}
      <div data-aos="fade-up" className="container mx-auto px-4 md:px-0 py-24 bg-black rounded-xl shadow-md border border-[#525252]"> {/* Adjusted background, added border, and rounded-xl */}
        <blockquote className="relative text-2xl md:text-4xl font-serif italic text-center text-white leading-relaxed max-w-3xl mx-auto py-10"> {/* Adjusted text color */}
          <svg className="absolute top-0 left-0 mt-2 ml-2 text-[#BFF205] h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.172 13.172a4 4 0 005.656 5.656 4 4 0 10-5.656-5.656zM5.172 9.172a4 4 0 005.656 5.656 4 4 0 10-5.656-5.656z" clipRule="evenodd" /></svg>
          Nosso trabalho só faz sentido se for um testemunho fiel do seu tempo.
          <svg className="absolute bottom-0 right-0 mb-2 mr-2 text-[#BFF205] h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.828 6.828a4 4 0 00-5.656-5.656 4 4 0 105.656 5.656zM14.828 10.828a4 4 0 00-5.656-5.656 4 4 0 105.656 5.656z" clipRule="evenodd" /></svg>
        </blockquote>
        <p className="text-md text-gray-400 text-center">- Gilvanny Ferrão, Gestor de projectos</p> {/* Adjusted text color */}
      </div>

      {/* The Team Section */}
      <div className="container mx-auto px-4 md:px-0 py-24 text-center">
        <h2 data-aos="fade-up" className="font-bold text-[50px] tracking-tight text-white mb-8"> {/* Adjusted text color */}
          A EQUIPE.
        </h2>
        <p data-aos="fade-up" className="text-lg text-[#D7D7D7]/70 max-w-2xl mx-auto mb-12"> {/* Adjusted text color */}
          Somos uma equipe apaixonada e diversificada, unida pelo objetivo de transformar o cenário de recrutamento em Angola. Acreditamos na colaboração, na inovação e no poder de criar soluções que realmente fazem a diferença na vida das pessoas e no sucesso das empresas.
        </p>

        {/* Team Member Photos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
          <div data-aos="fade-in" data-aos-delay="100" className="rounded-lg overflow-hidden shadow-md">
            <img src={team1} alt="Membro da equipe 1" className="w-full h-48 object-cover" />
            {/* <p className="text-center py-2 font-semibold">Nome 1</p> */}
          </div>
          <div data-aos="fade-in" data-aos-delay="200" className="rounded-lg overflow-hidden shadow-md">
            <img src={team2} alt="Membro da equipe 2" className="w-full h-48 object-cover" />
            {/* <p className="text-center py-2 font-semibold">Nome 2</p> */}
          </div>
          <div data-aos="fade-in" data-aos-delay="300" className="rounded-lg overflow-hidden shadow-md">
            <img src={team3} alt="Membro da equipe 3" className="w-full h-48 object-cover" />
            {/* <p className="text-center py-2 font-semibold">Nome 3</p> */}
          </div>
          <div data-aos="fade-in" data-aos-delay="400" className="rounded-lg overflow-hidden shadow-md">
            <img src={team4} alt="Membro da equipe 4" className="w-full h-48 object-cover" />
            {/* <p className="text-center py-2 font-semibold">Nome 4</p> */}
          </div>
          {/* Add more team members as needed */}
        </div>
      </div>

      {/* Statistics Section */}
      <div data-aos="fade-up" className="container mx-auto px-4 md:px-0 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <span className="font-bold text-4xl md:text-5xl text-[#BFF205]">600+</span>
          <p className="text-sm md:text-base text-gray-400 mt-2">Vagas de Emprego Publicadas</p> {/* Adjusted text color */}
        </div>
        <div>
          <span className="font-bold text-4xl md:text-5xl text-[#BFF205]">700+</span>
          <p className="text-sm md:text-base text-gray-400 mt-2">Candidatos Ativos</p> {/* Adjusted text color */}
        </div>
        <div>
          <span className="font-bold text-4xl md:text-5xl text-[#BFF205]">1.2k+</span>
          <p className="text-sm md:text-base text-gray-400 mt-2">Conexões Realizadas</p> {/* Adjusted text color */}
        </div>
        <div>
          <span className="font-bold text-4xl md:text-5xl text-[#BFF205]">110+</span>
          <p className="text-sm md:text-base text-gray-400 mt-2">Empresas Parceiras</p> {/* Adjusted text color */}
        </div>
      </div>

      <NzilaFooter />
    </div>
  );
}