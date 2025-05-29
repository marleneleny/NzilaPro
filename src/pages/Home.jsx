import NavBar from "../componentes/Navbar";
import circle from "../assets/circulo.svg";
import mockut from "../assets/mockut.svg";
import mockut2 from "../assets/mockut2.svg";
import decoration from "../assets/decoration.svg";
import miniCircles from "../assets/miniCircles.svg";
import missao from "../assets/missao.svg";
import visao from "../assets/visao.svg";
import valores from "../assets/valores.svg";
import circles from "../assets/circles.svg";
import woman from "../assets/woman.png";
import photoMent from "../assets/photoMent.svg";
import desempenho from "../assets/desempenho.svg";
import ProgressCounter from "../componentes/ProgressCounter";
import NzilaFAQ from "../componentes/NzilaFAQ";
import NzilaFooter from "../componentes/NzilaFooter";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

export default function home() {
  
   useEffect(() => {
      AOS.init({
        duration: 2000, // Duração da animação
        once: true, // A animação ocorre apenas uma vez
      });
    }, []);

  return (
    <div className="min-h-screen w-full bg-[#060B0D] text-white">
      <NavBar />
      <div className="blur bg-[#8A8B87] "></div>
      <img className="pt-20 " src={circle} alt="" />

      <div data-aos="fade-up" className="absolute top-72 left-12">
        <p data-aos="fade-up" className="font-inter text-base">
          Seu Caminho para Grandes Oportunidades.
        </p>
        <h1 data-aos="fade-up" className="font-poppins font-bold text-[45px] leading-[45px]">
          Encontre vagas de <br />{" "}
          <span className="text-[#BFF205]">emprego</span> que combinam <br />{" "}
          com suas habilidades.
        </h1>
      </div>
      <div data-aos="fade-up" className="absolute right-72 top-40 z-10">
        <img className="" src={mockut} alt="" />
        <img className="absolute top-48 left-52" src={mockut2} alt="" />
      </div>
      <p  data-aos="fade-up"className="font-bebas text-[#414141] text-9xl absolute top-80 left-[50rem]">
        Profissionalismo
      </p>

      <hr data-aos="fade-up" className="w-2/3 ml-11 mt-60 border-[#4C4C4C]" />
      <div data-aos="fade-up" className="flex">
        <div className="flex ml-11 mt-7">
          <img
            className="inscritos"
            src="https://unsplash.com/photos/l3IHXOdMyHQ/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NjN8fHBvcnRyYWl0fHB0fDB8fHx8MTc0NzQ5MTIxNHww&force=truehttps://unsplash.com/photos/iFgRcqHznqg/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MjN8fHBvcnRyYWl0fHB0fDB8fHx8MTc0NzQ4MDE3NXww&force=true"
            alt=""
          />
          <img
            className="inscritos"
            src="https://unsplash.com/photos/4Yv84VgQkRM/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NTV8fHBvcnRyYWl0fHB0fDB8fHx8MTc0NzQwODQ4MHww&force=true"
            alt=""
          />
          <img
            className="inscritos"
            src="https://unsplash.com/photos/hAMJpesMeDE/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NjB8fHBvcnRyYWl0fHB0fDB8fHx8MTc0NzQwODQ4MHww&force=true"
            alt=""
          />
          <img
            className="inscritos"
            src="https://unsplash.com/photos/dt60oksDTx8/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NTZ8fHBvcnRyYWl0fHB0fDB8fHx8MTc0NzQwODQ4MHww&force=true"
            alt=""
          />
          <img
            className="inscritos"
            src="https://unsplash.com/photos/pAtA8xe_iVM/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MzF8fHBvcnRyYWl0fHB0fDB8fHx8MTc0NzQ4MDE3NXww&force=true"
            e
          />
        </div>
        <p data-aos="fade-up" className="mt-7 ml-5">
          Mais de <br />
          1k Inscritos{" "}
        </p>
      </div>
      <hr data-aos="fade-up" className="w-3/4 ml-11 mt-7 border-[#4C4C4C]" />
      <div className="blur-[240px] absolute bg-[#add33c] w-[26rem] h-[1.75rem] p-4 top-10"></div>

      <div data-aos="fade-up" className="relative bottom-[13.75rem]">
        <img
          className="absolute top-[10rem] left-2 z-0"
          src={decoration}
          alt=""
        />

        <div data-aos="fade-up" className="relative z-10 mb-20 mt-[40rem] ml-36 flex items-center border border-[#525252] w-[1082px] h-[20.5rem] rounded-xl bg-black">
          <div className="ml-16">
            <img src={miniCircles} alt="" />
            <h2 className="text-[32px] font-semibold mr-14 text-white">
              Conectando Talentos às <br /> Melhores Oportunidades <br />{" "}
              Profissionais.
            </h2>
          </div>
          <p className="w-[32rem] font-inter text-[#D7D7D7]/70">
            A Nzila é uma plataforma que conecta profissionais e empresas em
            Angola, facilitando a alocação de talentos qualificados. Através de
            um processo eficiente, validamos currículos, aplicamos testes de
            habilidades e oferecemos mentorias para impulsionar carreiras,
            garantindo que empresas encontrem os melhores profissionais de forma
            ágil e confiável.
          </p>
        </div>
      </div>

      <h3 data-aos="fade-up" className="text-center font-poppins font-bold text-[42px]">
        Os princípios que moldam <br /> nosso caminho
      </h3>

      <div data-aos="fade-up" className="flex mt-[11.5rem] mb-[19.25rem]">
        <div className="ml-[170px] mr-[68px]">
          <img src={missao} alt="" />
          <p className="TitlePrinc">Missão</p>
          <p className="paragPrinc w-[22em]">
            Conectar profissionais e empresas em Angola de forma eficiente,
            proporcionando processos de seleção rápidos e confiáveis, com foco
            no desenvolvimento de carreiras e na promoção de talentos
            qualificados.
          </p>
        </div>
        <div className="mr-[68px]">
          <img src={visao} alt="" />
          <p className="TitlePrinc">Visão</p>
          <p className="paragPrinc w-[18.5rem]">
            Ser a plataforma líder de recrutamento em Angola, reconhecida pela
            inovação e impacto na empregabilidade, criando um mercado de
            trabalho mais dinâmico e acessível.
          </p>
        </div>
        <div>
          <img src={valores} alt="" />
          <p className="TitlePrinc">valores</p>
          <p className="paragPrinc w-[17.5rem]">
            A Nzila é guiada pela qualidade, transparência, inovação, inclusão e
            compromisso com o desenvolvimento contínuo dos profissionais.
          </p>
        </div>
      </div>
      <img
        className="absolute top-[90rem] left-[75rem] rotate-180 z-0"
        src={decoration}
        alt=""
      />

      <div data-aos="fade-up" className="ml-20 border border-[#525252] w-[1178px] h-[48rem] rounded-xl bg-black">
        <img src={circles} alt="" />

        <div className="flex flex-col lg:flex-row">
          <h4 className="font-poppins font-semibold text-[2rem] ml-11 mt-24">
            É simples encontrar uma vaga de <br />
            <span className="text-[#BFF205]">emprego</span>
          </h4>

          <div className="flex flex-wrap w-full px-10 gap-y-6 relative bottom-[10rem] left-10">
            <div className="w-1/2 p-4 divsEncVagas">
              <div className="">
                <p className="font-bebas text-[#BFF205] text-4xl ">01</p>
                <p className="font-poppins font-bold mt-5 mb-5">
                  Crie uma Conta
                </p>
                <p className="text-[#adadad] text-sm">
                  Cadastre-se na Nzila e tenha acesso a diversas oportunidades
                  de emprego.
                </p>
              </div>
            </div>

            <div className="w-1/2 p-4 divsEncVagas">
              <div className="">
                <p className="font-bebas text-[#BFF205] text-4xl ">02</p>
                <p className="font-poppins font-bold mt-5 mb-5">
                  {" "}
                  Finalize seu perfil
                </p>
                <p className="text-[#adadad] text-sm">
                  Termine de preencher todas as informações existentes no seu
                  perfil para que as empresas acessem tudo que precisam.
                </p>
              </div>
            </div>

            <div className="w-1/2 p-4 divsEncVagas mt-14">
              <div className="">
                <p className="font-bebas text-[#BFF205] text-4xl ">03</p>
                <p className="font-poppins font-bold mt-5 mb-5">
                  Passe pela avaliação em vídeo
                </p>
                <p className="text-[#adadad] text-sm">
                  Demonstre suas competências em uma avaliação em vídeo. Assim,
                  as empresas conhecem melhor seu perfil profissional.
                </p>
              </div>
            </div>

            <div className="w-1/2 p-4 divsEncVagas mt-14">
              <div className="">
                <p className="font-bebas text-[#BFF205] text-4xl ">04</p>
                <p className="font-poppins font-bold mt-5 mb-5">
                  Acompanhe sua Candidatura
                </p>
                <p className="text-[#adadad] text-sm">
                  Empresas preferem candidatos com informações verificadas e bem
                  organizadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div  className="mt-56 ml-[38rem] border border-[#504D4D]  flex items-center w-40 h-12">
        <p  className=" font-inter text-center ml-3">Solução completa</p>
      </div>
      <img className="absolute ml-[75rem] rotate-180" src={circle} alt="" />
      <h5 data-aos="fade-up" className=" mt-14 font-poppins font-bold text-4xl text-center">
        Chega de buscar sem sucesso! Aqui você <br /> encontra as melhores
        oportunidades para <p></p> crescer na sua carreira.
      </h5>

      <div data-aos="fade-up" className="ml-20 mt-80 border border-[#525252] w-[1178px] h-[48rem] rounded-xl bg-black">
        <img className="absolute rotate-12 mt-2" src={decoration} alt="" />
        <h6 className="font-poppins text-3xl text-center mt-24">
          Independente do seu nível a Nzila é para você
        </h6>
        <div className="flex mt-[7.5rem]">
          <div className="ml-16 mr-[20rem]">
            <p className="font-poppins text-lg font-semibold mb-3">
              Profissionais em Início de Carreira
            </p>
            <p className="text-base font-inter leading-[42px] mb-7 w-96">
              A Nzila oferece mentorias e vagas para quem está começando a
              carreira.
            </p>
            <p className="font-poppins text-lg font-semibold mb-3">
              Profissionais Experientes
            </p>
            <p className="text-base font-inter leading-[42px] mb-7 w-96">
              Conectamos você com empresas que buscam talentos qualificados e
              crescimento contínuo.
            </p>
            <p className="font-poppins text-lg font-semibold mb-3">
              Empresas que Buscam Talentos
            </p>
            <p className="text-base font-inter leading-[42px] w-96">
              A Nzila agiliza o recrutamento, conectando empresas a
              profissionais qualificados.
            </p>
          </div>
          <img className="absolute left-[40.80rem]" src={woman} alt="" />
        </div>
      </div>

      <h6 data-aos="fade-up" className="font-inter font-bold text-4xl mt-72 mb-52 text-center">
        Explore mentorias que fazem diferença <br /> em qualquer fase da sua
        carreira.
      </h6>
      <div className="blur top-[360rem] bg-[#5A7302]"></div>
      <div className="blur top-[320rem] left-[70rem] bg-[#5A7302]"></div>

      <div data-aos="fade-up" className=" relative flex flex-wrap z-10">
        <div className="divsMent ml-12">
          <img
            className="imgMent"
            src="https://unsplash.com/photos/JBwcenOuRCg/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTF8fHdvbWFuJTIwYnVzaW5lc3N8cHR8MHx8fHwxNzQ3NzYxODE3fDA&force=true
      "
          />
          <p className="titleMent">Construa uma Carreira de Sucesso</p>
          <p className="contentMent">
            Aprenda a traçar metas profissionais realistas, identificar suas
            principais habilidades e definir estratégias para crescer de forma
            consistente no mercado de trabalho.
          </p>
          <hr className="w-[21.25rem] ml-6 border-[#1C1C1C] mt-4" />
          <div className="flex mt-7">
            <img className="mr-6 ml-6" src={photoMent} alt="" />
            <div>
              <p>José Van-Dúnem</p>
              <p className="text-xs text-[#ffffff]/40"> Profissional de RH</p>
            </div>
          </div>
        </div>
        <div className="divsMent">
          <img
            className="imgMent"
            src="https://unsplash.com/photos/n95VMLxqM2I/download?force=true"
            alt=""
          />
          <p className="titleMent">Construa uma Carreira de Sucesso</p>
          <p className="contentMent">
            Aprenda a traçar metas profissionais realistas, identificar suas
            principais habilidades e definir estratégias para crescer de forma
            consistente no mercado de trabalho.
          </p>
          <hr className="w-[21.25rem] ml-6 border-[#1C1C1C] mt-4" />
          <div className="flex mt-7">
            <img className="mr-6 ml-6" src={photoMent} alt="" />
            <div>
              <p>José Van-Dúnem</p>
              <p className="text-xs text-[#ffffff]/40"> Profissional de RH</p>
            </div>
          </div>
        </div>
        <div className="divsMent">
          <img
            className="imgMent"
            src="https://unsplash.com/photos/MYbhN8KaaEc/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MjZ8fGJ1c2luZXNzfHB0fDB8fHx8MTc0NzY1Mjg2NXww&force=true"
            alt=""
          />
          <p className="titleMent">Construa uma Carreira de Sucesso</p>
          <p className="contentMent">
            Aprenda a traçar metas profissionais realistas, identificar suas
            principais habilidades e definir estratégias para crescer de forma
            consistente no mercado de trabalho.
          </p>
          <hr className="w-[21.25rem] ml-6 border-[#1C1C1C] mt-4" />
          <div className="flex mt-7">
            <img className="mr-6 ml-6" src={photoMent} alt="" />
            <div>
              <p>José Van-Dúnem</p>
              <p className="text-xs text-[#ffffff]/40"> Profissional de RH</p>
            </div>
          </div>
        </div>
        <div className="divsMent ml-12 mt-20">
          <img
            className="imgMent"
            src="https://unsplash.com/photos/IESB4iFVuzA/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTh8fGhhbmRzaGFrZXxwdHwwfHx8fDE3NDc4MzI5NzV8MA&force=true"
            alt=""
          />
          <p className="titleMent">Construa uma Carreira de Sucesso</p>
          <p className="contentMent">
            Aprenda a traçar metas profissionais realistas, identificar suas
            principais habilidades e definir estratégias para crescer de forma
            consistente no mercado de trabalho.
          </p>
          <hr className="w-[21.25rem] ml-6 border-[#1C1C1C] mt-4" />
          <div className="flex mt-7">
            <img className="mr-6 ml-6" src={photoMent} alt="" />
            <div>
              <p>José Van-Dúnem</p>
              <p className="text-xs text-[#ffffff]/40"> Profissional de RH</p>
            </div>
          </div>
        </div>
      </div>

      <div data-aos="fade-up" className="">
        <ProgressCounter />

        <div className="flex mt-72 z-10">
          <img className="ml-24" src={desempenho} alt="" />
          <div className="ml-32">
            <h6 className="font-poppins font-semibold text-3xl mt-12 mb-5">
              Acompanhe Seu Desempenho <br /> e{" "}
              <span className="text-[#A1CA0A] ">Cresça na Carreira</span>
            </h6>
            <p className="w-[31rem]">
              Na Nzila, você não apenas encontra vagas, mas também entende o que
              precisa para conquistar a oportunidade ideal. Nossa plataforma
              analisa seu perfil, mostra seu desempenho e sugere melhorias para
              que você esteja sempre um passo à frente no mercado. Com insights
              personalizados e orientação estratégica, ajudamos você a
              desenvolver as habilidades certas e a se conectar com vagas
              alinhadas ao seu crescimento profissional.
            </p>
            <button className="transition duration-300 ease-in-out text-black mt-7 bg-[#BFF205] w-48 h-11 rounded-lg hover:bg-[#bff205e3]">
              Ver mais
            </button>
          </div>
        </div>
      </div>
      <p data-aos="fade-up" className="text-4xl font-poppins font-semibold text-center mt-96 mb-16">Dúvidas frequentes</p>
      <div data-aos="fade-up"><NzilaFAQ/></div>
      <NzilaFooter/>
      
      
    </div>
  );
}
