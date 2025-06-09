
import NzilaFAQ from "../componentes/NzilaFAQ";
import NzilaFooter from "../componentes/NzilaFooter";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import NavBarEmpresa from "../componentes/NavBarEmpresa";

export default function HomeEmpresa() {
  
   useEffect(() => {
      AOS.init({
        duration: 2000,
        once: true,
      });
    }, []);

  return (
    <div className="min-h-screen w-full bg-[#060B0D] text-white">
      <NavBarEmpresa />
      
      {/* Hero Section com Layout Diferente */}
      <section className="relative min-h-screen flex items-center justify-between px-20 pt-20">
        <div className="blur bg-[#4A5D23] w-[20rem] h-[20rem] absolute top-10 left-10"></div>
        
        <div data-aos="fade-right" className="flex-1 z-10">
         
          <h1 className="font-poppins font-bold text-[52px] leading-[55px] mb-6">
            Encontre <span className="text-[#BFF205]">talentos</span> <br />
            excepcionais em <br />
            tempo recorde
          </h1>
          <p className="font-inter text-lg text-[#CCCCCC] mb-8 w-[500px]">
            Conecte-se aos melhores profissionais de Angola através da nossa 
            plataforma inteligente de recrutamento. Processos mais rápidos, 
            candidatos pré-qualificados.
          </p>
          <div className="flex gap-4">
            <button className="bg-[#BFF205] text-black px-8 py-4 rounded-lg font-semibold hover:bg-[#A1CA0A] transition">
              Começar Agora
            </button>
            <button className="border border-[#BFF205] text-[#BFF205] px-8 py-4 rounded-lg font-semibold hover:bg-[#BFF205] hover:text-black transition">
              Ver Demo
            </button>
          </div>
        </div>

        <div data-aos="fade-left" className="flex-1 relative">
          <div className="grid grid-cols-2 gap-6 mt-20">
            <div className="bg-[#111111] p-6 rounded-xl border border-[#333]">
              <div className="text-[#BFF205] text-2xl font-bold">2.5x</div>
              <p className="text-sm text-[#999]">Mais rápido que métodos tradicionais</p>
            </div>
            <div className="bg-[#111111] p-6 rounded-xl border border-[#333]">
              <div className="text-[#BFF205] text-2xl font-bold">95%</div>
              <p className="text-sm text-[#999]">Taxa de aprovação dos candidatos</p>
            </div>
            <div className="bg-[#111111] p-6 rounded-xl border border-[#333]">
              <div className="text-[#BFF205] text-2xl font-bold">500+</div>
              <p className="text-sm text-[#999]">Empresas confiam na Nzila</p>
            </div>
            <div className="bg-[#111111] p-6 rounded-xl border border-[#333]">
              <div className="text-[#BFF205] text-2xl font-bold">24h</div>
              <p className="text-sm text-[#999]">Tempo médio para primeiros candidatos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Empresas Parceiras */}
      <section data-aos="fade-up" className="py-20 px-20">
        <p className="text-center text-[#666] mb-12">Empresas que confiam na Nzila</p>
        <div className="flex justify-center items-center gap-16 opacity-60">
          <div className="w-32 h-16 bg-[#222] rounded flex items-center justify-center">
            <span className="text-[#999] font-bold">EMPRESA A</span>
          </div>
          <div className="w-32 h-16 bg-[#222] rounded flex items-center justify-center">
            <span className="text-[#999] font-bold">EMPRESA B</span>
          </div>
          <div className="w-32 h-16 bg-[#222] rounded flex items-center justify-center">
            <span className="text-[#999] font-bold">EMPRESA C</span>
          </div>
          <div className="w-32 h-16 bg-[#222] rounded flex items-center justify-center">
            <span className="text-[#999] font-bold">EMPRESA D</span>
          </div>
        </div>
      </section>

      {/* Como Funciona - Layout Horizontal */}
      <section className="py-32 px-20">
        <div data-aos="fade-up" className="text-center mb-16">
          <h2 className="font-poppins font-bold text-[42px] mb-6">
            Como funciona para sua empresa
          </h2>
          <p className="text-[#CCCCCC] text-lg max-w-2xl mx-auto">
            Um processo simples e eficiente para encontrar os melhores talentos
          </p>
        </div>

        <div data-aos="fade-up" className="relative">
         
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center relative">
              <div className="w-16 h-16 bg-[#BFF205] rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-6 relative z-10">
                1
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-4">Publique sua Vaga</h3>
              <p className="text-[#CCCCCC] text-sm">
                Descreva a posição ideal e deixe nossa IA fazer a pré-seleção automática
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="w-16 h-16 bg-[#BFF205] rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-6 relative z-10">
                2
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-4">Receba Candidatos</h3>
              <p className="text-[#CCCCCC] text-sm">
                Acesse perfis qualificados com avaliações técnicas já realizadas
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="w-16 h-16 bg-[#BFF205] rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-6 relative z-10">
                3
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-4"> Analise Perfis</h3>
              <p className="text-[#CCCCCC] text-sm">
                Veja vídeos com respostas técnicas, transcrições e resultados de testes práticos em tempo real.
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="w-16 h-16 bg-[#BFF205] rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-6 relative z-10">
                4
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-4">Contrate com Segurança</h3>
              <p className="text-[#CCCCCC] text-sm">
                Todos os candidatos são verificados e validados pela nossa equipe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Principais - Layout em Cards */}
      <section className="py-32 px-20 bg-[#0A0A0A]">
        <div data-aos="fade-up" className="text-center mb-16">
          <h2 className="font-poppins font-bold text-[42px] mb-6">
            Recursos que fazem a diferença
          </h2>
        </div>

        <div data-aos="fade-up" className="grid grid-cols-3 gap-8">
          <div className="bg-[#111111] p-8 rounded-2xl border border-[#333] hover:border-[#BFF205] transition group">
            <div className="w-12 h-12 bg-[#BFF205] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <span className="text-black font-bold text-xl">⚡</span>
            </div>
            <h3 className="font-poppins font-semibold text-xl mb-4">IA de Pré-seleção</h3>
            <p className="text-[#CCCCCC]">
              Nossa inteligência artificial analisa currículos e identifica os 
              candidatos mais adequados automaticamente.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-2xl border border-[#333] hover:border-[#BFF205] transition group">
            <div className="w-12 h-12 bg-[#BFF205] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <span className="text-black font-bold text-xl">🎯</span>
            </div>
            <h3 className="font-poppins font-semibold text-xl mb-4">Avaliações Técnicas</h3>
            <p className="text-[#CCCCCC]">
              Testes personalizados para cada área, garantindo que os candidatos 
              tenham as competências necessárias.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-2xl border border-[#333] hover:border-[#BFF205] transition group">
            <div className="w-12 h-12 bg-[#BFF205] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <span className="text-black font-bold text-xl">📊</span>
            </div>
            <h3 className="font-poppins font-semibold text-xl mb-4">Dashboard Completo</h3>
            <p className="text-[#CCCCCC]">
              Acompanhe métricas, progresso das vagas e performance do 
              recrutamento em tempo real.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-2xl border border-[#333] hover:border-[#BFF205] transition group">
            <div className="w-12 h-12 bg-[#BFF205] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <span className="text-black font-bold text-xl">🔒</span>
            </div>
            <h3 className="font-poppins font-semibold text-xl mb-4">Verificação Completa</h3>
            <p className="text-[#CCCCCC]">
              Todos os profissionais passam por verificação de antecedentes 
              e validação de competências.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-2xl border border-[#333] hover:border-[#BFF205] transition group">
            <div className="w-12 h-12 bg-[#BFF205] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <span className="text-black font-bold text-xl">🎥</span>
            </div>
            <h3 className="font-poppins font-semibold text-xl mb-4">Entrevistas Online</h3>
            <p className="text-[#CCCCCC]">
              Plataforma integrada para conduzir entrevistas online com 
              gravação e análise automática.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-2xl border border-[#333] hover:border-[#BFF205] transition group">
            <div className="w-12 h-12 bg-[#BFF205] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <span className="text-black font-bold text-xl">📈</span>
            </div>
            <h3 className="font-poppins font-semibold text-xl mb-4">Analytics Avançado</h3>
            <p className="text-[#CCCCCC]">
              Insights sobre mercado salarial, tendências de contratação 
              e benchmarks do setor.
            </p>
          </div>  
        </div>
      </section>

      {/* Planos - Seção Nova */}
      <section className="py-32 px-20">
        <div data-aos="fade-up" className="text-center mb-16">
          <h2 className="font-poppins font-bold text-[42px] mb-6">
            Planos para todo tipo de empresa
          </h2>
          <p className="text-[#CCCCCC] text-lg">
            Escolha o plano ideal para suas necessidades de recrutamento
          </p>
        </div>

        <div data-aos="fade-up" className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plano Starter */}
          <div className="bg-[#111111] p-8 rounded-2xl border border-[#333] text-center">
            <h3 className="font-poppins font-semibold text-2xl mb-4">Starter</h3>
            <div className="text-[#BFF205] text-4xl font-bold mb-2">Grátis</div>
            <p className="text-[#999] mb-8">Para empresas iniciantes</p>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>Até 2 vagas ativas</li>
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>Acesso ao banco de talentos</li>
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>Suporte por email</li>
            </ul>
            <button className="w-full border border-[#BFF205] text-[#BFF205] py-3 rounded-lg hover:bg-[#BFF205] hover:text-black transition">
              Começar Grátis
            </button>
          </div>

          {/* Plano Professional */}
          <div className="bg-[#111111] p-8 rounded-2xl border-2 border-[#BFF205] text-center relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#BFF205] text-black px-4 py-1 rounded-full text-sm font-semibold">
              Mais Popular
            </div>
            <h3 className="font-poppins font-semibold text-2xl mb-4">Professional</h3>
            <div className="text-[#BFF205] text-4xl font-bold mb-2">$299</div>
            <p className="text-[#999] mb-8">por mês</p>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>Vagas ilimitadas</li>
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>IA de pré-seleção</li>
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>Avaliações técnicas</li>
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>Dashboard avançado</li>
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>Suporte prioritário</li>
            </ul>
            <button className="w-full bg-[#BFF205] text-black py-3 rounded-lg hover:bg-[#A1CA0A] transition">
              Assinar Agora
            </button>
          </div>

          {/* Plano Enterprise */}
          <div className="bg-[#111111] p-8 rounded-2xl border border-[#333] text-center">
            <h3 className="font-poppins font-semibold text-2xl mb-4">Enterprise</h3>
            <div className="text-[#BFF205] text-4xl font-bold mb-2">Custom</div>
            <p className="text-[#999] mb-8">Soluções personalizadas</p>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>Tudo do Professional</li>
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>API personalizada</li>
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>Integração com HRIS</li>
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>Account Manager dedicado</li>
              <li className="flex items-center"><span className="text-[#BFF205] mr-2">✓</span>SLA garantido</li>
            </ul>
            <button className="w-full border border-[#BFF205] text-[#BFF205] py-3 rounded-lg hover:bg-[#BFF205] hover:text-black transition">
              Falar com Vendas
            </button>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-20  text-white">
        <div data-aos="fade-up" className="text-center max-w-4xl mx-auto">
          <h2 className="font-poppins font-bold text-[48px] mb-6">
            Pronto para revolucionar seu recrutamento?
          </h2>
          <p className="text-xl mb-8 opacity-80">
            Junte-se a mais de 500 empresas que já transformaram seus processos de contratação com a Nzila.
          </p>
          <div className="flex gap-6 justify-center">
            <button className="bg-white text-black px-12 py-4 rounded-lg font-semibold text-lg hover:bg-white/80 transition">
              Começar Teste Grátis
            </button>
            <button className="border-2 border-white text-white px-12 py-4 rounded-lg font-semibold text-lg  hover:border-white/50 transition">
              Agendar Demo
            </button>
          </div>
        </div>
      </section>

      <NzilaFAQ/>
      <NzilaFooter/>
    </div>
  );
}