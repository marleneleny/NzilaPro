import NavBar from "../componentes/Navbar";
import imgVagas from "../assets/img-vaga.png";
import vd from "../assets/vd.png";
import persons from "../assets/persons.png";
import seta3d from "../assets/seta-3d.svg";
import seta3dBlue from "../assets/seta-3d-blue.svg";
import user from "../assets/user.svg";
import doc from "../assets/doc.svg";
import questoes from "../assets/questoes.svg";
import tarefas from "../assets/tarefas.svg";
import curvas from "../assets/curvas.png";
import { useEffect } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
export default function Home() {
  useEffect(() => {
    Aos.init({ duration: 1200 });
  }, []);
  return (
    <>
      <NavBar />
      <div className="text-center mt-[7rem] " data-aos="fade-up">
        <p>Seu Caminho para Grandes Oportunidades.</p>
        <h1 className="font-semibold text-[2.625rem] mt-[1rem] mb-[1rem]">
          Encontre <span className="text-[#0500B6]">vagas de emprego</span>
          <br /> que combinam com suas <br /> habilidades.
        </h1>
        <p>
          Nzila conecta profissionais a grandes oportunidades de forma simples e
          rápida
        </p>
      </div>

      <div className="absolute top-[24rem] right-[43px]  w-[472px] h-[472px] bg-[#5E63BF]/70 blur-[250px]"></div>

      <div className="flex" data-aos="fade-up">
        <div className="ml-[4rem] ">
          <div className="info w-[11rem]">Quem somos nós?</div>
          <h2 className="mt-8 s-title">
            Conectando Talentos às <br /> Melhores Oportunidades <br />{" "}
            Profissionais.
          </h2>
          <p className="mt-5 w-[34rem]  text-black/70">
            A Nzila é uma plataforma que conecta profissionais e empresas em
            Angola, facilitando a alocação de talentos qualificados. Através de
            um processo eficiente, validamos currículos, aplicamos testes de
            habilidades e oferecemos mentorias para impulsionar carreiras,
            garantindo que empresas encontrem os melhores profissionais de forma
            ágil e confiável.
          </p>
          <button className="botoes w-[12.5rem]">Explorar vagas</button>
        </div>
        <img
          className="w-[37rem] h-[37rem] mt-[10rem] ml-[6rem]"
          src={imgVagas}
          alt=""
        />
        <img
          className="absolute rotate-[30deg] w-[6.25rem] h-[6.25rem] top-[60rem] left-[20rem]"
          src={seta3d}
          alt=""
        />
      </div>

      <img
        className="absolute left-[-11rem] top-[86rem] z-[-1]"
        src={curvas}
        alt=""
      />
      <div className="info w-[15rem] mx-auto">O quê proporcionamos?</div>

      <div
        className="bg-[#D9D5F2]/60 mt-[4rem] flex h-[14.5rem]"
        data-aos="fade-up"
      >
        <div className="ml-12">
          <p className="mt-[4rem] mb-[1rem] text-[14px] text-[#000000]/70">
            junte-se e conecte-se hoje
          </p>
          <h2 className="font-semibold text-[1.75rem]">
            Nível de Eficiência <br /> da NzilaPro
          </h2>
        </div>
        <div className="ml-16 w-64 mt-[4rem] ">
          <p className="mb-[8px]">
            <span className="span">92%</span> de confiança
          </p>
          <p>
            Perfis analisados e verificados para garantir credibilidade e
            segurança.
          </p>
        </div>
        <hr className="w-[100px] border-black/20 rotate-90 mt-[7rem]" />

        <div className="w-[17rem] mt-[4rem]">
          <p className="mb-[8px]">
            <span className="span">87%</span> de precisão{" "}
          </p>
          <p>
            Correspondência inteligente entre candidatos e vagas <br /> ideais.
          </p>
        </div>
        <hr className="w-[100px] border-black/20 rotate-90 mt-[7rem]" />

        <div className="w-[15rem] mt-[4rem]">
          <p className="mb-[8px]">
            <span className="span">78%</span> de crescimento
          </p>
          <p>
            Profissionais encontram oportunidades que aceleram suas carreiras.
          </p>
        </div>
      </div>

      <div className="info w-[10rem] mx-auto">Como funciona??</div>
      <div data-aos="fade-up">
        <h2 className="text-[2rem] text-center mt-11">
          É simples encontrar um vaga <br />
          de emprego
        </h2>
        <img
          className="absolute rotate-[20deg] w-[6.25rem] h-[6.25rem] top-[120rem] left-[15rem]"
          src={seta3d}
          alt=""
        />
        <img
          className="absolute right-[-10rem] top-[-10rem] z-[-1]"
          src={curvas}
          alt=""
        />

        <div className="flex justify-center mt-32" data-aos="fade-up">
          <div className="card">
            <img className="icon left-[9rem] top-[-1rem] " src={user} alt="" />
            <p className="title-card  ">Crie uma Conta</p>
            <p className="paragraph w-[18rem] ml-[1.2rem]">
              Cadastre-se na Nzila e tenha acesso a diversas oportunidades de
              emprego.
            </p>
          </div>

          <div className="card">
            <img className="icon left-[30rem] top-[-1rem] " src={doc} alt="" />
            <p className="title-card"> Valide o seu Currículo</p>
            <p className="paragraph w-64 ml-[1.2rem]">
              Empresas preferem candidatos com informações verificadas e bem
              organizadas.
            </p>
          </div>

          <div className="card">
            <img
              className="icon left-[51rem] top-[-1rem] "
              src={questoes}
              alt=""
            />
            <p className="title-card">
              Resolva o Quiz de <br /> Habilidades
            </p>
            <p className="paragraph w-[17rem] ml-[1.2rem]">
              Demonstre suas competências respondendo um quiz. Isso ajuda as
              empresas a entenderem seu perfil.
            </p>
          </div>

          <div className="card">
            <img
              className="icon left-[72.5rem] top-[-1rem] "
              src={tarefas}
              alt=""
            />
            <p className="title-card">
              Acompanhe sua <br /> Candidatura
            </p>
            <p className="paragraph w-[17rem] ml-[1.2rem]">
              Acompanhe suas candidaturas e fique por dentro de cada etapa do
              processo seletivo.
            </p>
          </div>
        </div>
      </div>

      <div className="info w-[10rem] mx-auto">Vagas abertas</div>
      <div data-aos="fade-up">
        <h2 className="text-[2rem] text-center mt-11">
          Explore e encontre vagas de <br />
          Trabalho aqui
        </h2>
        <img
          className="absolute rotate-[18deg] w-[6.25rem] h-[6.25rem] top-[14rem] left-[14rem]"
          src={seta3dBlue}
          alt=""
        />
        <input
          className="w-[35rem] border-b  border-b-[#000000]/40 placeholder:text-[#000000]/70 pb-2 ml-[25rem] mt-14 focus:outline-none focus:ring-0 focus:border-b-[#000]"
          placeholder="Encontrar vagas"
          type="search"
          name=""
          id=""
        />
      </div>
      <div className="ml-[24rem] mt-[4rem]">
        <button className="botoes w-[15rem]">Companhis populares</button>
        <button className="hover:underline ml-8">Vagas Recomendadas</button>
        <button className="hover:underline ml-8">Novas vagas</button>
      </div>
      <img
        className="absolute left-[-11rem] top-[172rem] z-[-1]"
        src={curvas}
        alt=""
      />

      <JobList />
      <img
        className="absolute right-[-10rem] top-[275rem] z-[-1]"
        src={curvas}
        alt=""
      />
      <div className="flex mt-11" data-aos="fade-up">
        <div className="ml-[4rem] ">
          <div className="info w-[11rem]">Mentorias</div>
          <h2 className="mt-8 s-title">
            Acelere sua Carreira com <br /> Mentorias Exclusivas
          </h2>
          <p className="mt-5 w-[34rem]  text-black/70">
            Obtenha orientação especializada de profissionais experientes para
            aprimorar suas habilidades e se destacar no mercado. Nossas
            mentorias oferecem insights valiosos, dicas práticas e suporte
            personalizado para ajudá-lo a conquistar a vaga dos seus sonhos.
          </p>
          <button className="botoes w-[12.5rem]">Explorar vagas</button>
        </div>
        <img
          className="absolute rotate-[18deg] w-[6.25rem] h-[6.25rem] top-[6rem] left-[36rem]"
          src={seta3dBlue}
          alt=""
        />
        <img
          className="w-[28rem] h-[28rem] mt-[10rem] ml-[10rem]"
          src={vd}
          alt=""
        />
      </div>

      <div className="mt-[11rem] text-center" data-aos="fade-up">
        <h2 className="s-title">Oportunidades ao Seu Alcance</h2>
        <p
          className="leading-[42px] mt-[22px] mb-10
"
        >
          A NzilaPro é a ponte entre talentos e empresas, facilitando o acesso a
          vagas de emprego <br /> que realmente fazem a diferença. Nossa
          plataforma oferece ferramentas inovadoras <br /> para aprimorar seu
          perfil profissional, validar suas habilidades e aumentar suas chances{" "}
          <br /> de contratação.
        </p>
        <img className="mx-auto"src={persons} alt="" />
      </div>
      

    </>
  );
}
