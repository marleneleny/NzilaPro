import React, { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import notificacao from "../assets/notificacao.svg";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function NavBarEmpresa() {
  const { User } = useAuth();
  const [userAvatar, setUserAvatar] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const defaultAvatar =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999999'%3E%3Cpath d='M12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4zm0 9c2.67 0 8 1.34 8 4v1H4v-1c0-2.66 5.33-4 8-4z'/%3E%3C/svg%3E";

  // Effect para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (User) {
      if (User.avatar && User.avatar.trim() !== "") {
        setUserAvatar(User.avatar);
      } else if (User.photoURL && User.photoURL.trim() !== "") {
        setUserAvatar(User.photoURL);
      } else if (User.picture && User.picture.trim() !== "") {
        setUserAvatar(User.picture);
      } else {
        setUserAvatar(defaultAvatar);
      }
    } else {
      setUserAvatar(defaultAvatar);
    }
  }, [User?.avatar, User?.photoURL, User?.picture, User]);

  const isAuthenticated = () => {
    return User && (User.uid || User.id);
  };

  const handleImageError = (e) => {
    console.log("Navbar image failed to load, using default avatar");
    e.target.src = defaultAvatar;
    setUserAvatar(defaultAvatar);
  };

  const handleImageLoad = (e) => {
    console.log("Navbar image loaded successfully:", e.target.src);
  };

  return (
    <>
      <div
        className={`fixed flex justify-center w-[76rem] z-50 ml-9 transition-all duration-300 ${
          isScrolled ? "bg-black/80 backdrop-blur-sm" : "bg-transparent"
        }`}
      >
        <div className="header">
          <img className="w-[7rem] h-7 ml-14" src={logo} alt="Logo" />
          <nav className="navbar">
            <ul className="nav-list">
              <li>
                <Link to="/homeempresa" className="nav-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/publicar-vagas" className="nav-link">
                  Publicar Vagas
                </Link>
              </li>
              <li>
                <Link to="/candidatos" className="nav-link">
                  Ver Candidatos
                </Link>
              </li>
              <li>
                <Link to="/sobrenosempresa" className="nav-link">
                  Sobre nós
                </Link>
              </li>
            </ul>
          </nav>
          <img
            className="w-6 h-6 absolute left-[68rem]"
            src={notificacao}
            alt=""
          />

          <Link to="/profileempresa">
            <div className="w-10 h-10 mr-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              <img
                className="w-full h-full object-cover"
                src={userAvatar || defaultAvatar}
                alt={isAuthenticated() ? "Company Avatar" : "Default Avatar"}
                onError={handleImageError}
                onLoad={handleImageLoad}
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}