import logo from "../assets/logo.svg";
import notificacao from "../assets/notificacao.png";
import curvas from "../assets/curvas.png";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <>
      <div className="flex mt-[28px] ">
        <img className="ml-10" src={logo} alt="Logo" />
        <nav className="navbar">
          <ul className="nav-list">
            <li>
              <Link to="/home" className="nav-link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/sobre" className="nav-link">
                Vagas
              </Link>
            </li>
            <li>
              <Link to="/servicos" className="nav-link">
                Mentorias
              </Link>
            </li>
            <li>
              <Link to="/contato" className="nav-link">
                Candidaturas
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <input
            className="barraPesquisa"
            type="search"
            placeholder="Encontrar vagas"
            name=""
            id=""
          />
          <img
            className="absolute top-[3.2rem] left-[64rem]"
            src={lupa}
            alt=""
          />
        </div>
        <img
          className="w-[1.50rem] h-[1.50rem] ml-[2rem] mt-[1.50rem]"
          src={email}
          alt=""
        />
        <img
          className="w-[1.75rem] h-[1.75rem] mt-[1.50rem] ml-[2rem]"
          src={notificacao}
          alt=""
        />
        <div className="w-10 h-10 bg-gray-500 border rounded-[40px] mt-[1rem] ml-[1.50rem]"></div>
      </div>
      <hr className="w-full border-0 h-[2px] bg-black/15 mt-[1rem]" />
      <img className="absolute left-[-11rem] top-52" src={curvas} alt="" />
      <img
        className="absolute right-[-10rem] top-[38rem] z-[-1]"
        src={curvas}
        alt=""
      />

     
    </>
  );
}
