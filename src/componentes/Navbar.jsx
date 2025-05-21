import logo from "../assets/logo.svg";
import notificacao from "../assets/notificacao.svg";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <div className=" fixed flex justify-center w-[76rem] z-50 ml-20">
      <div className="header">
        <img className="w-[7rem] h-7 ml-14" src={logo} alt="Logo" />
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
        <img className="w-6 h-6 absolute left-[68rem]" src={notificacao} alt="" />
        <div className="bg-gray-200 w-10 h-10 mr-28 border rounded-full"></div>
      </div>
     
      
      
     
    </div>
  );
}
