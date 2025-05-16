
import React from "react";
import logo from "../assets/logo.svg"; // ajuste o caminho se for diferente

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex flex-col items-center">
        <img
          src={logo}
          alt="Carregando"
          className="w-20 h-20 animate-spin-slow"
        />
        <p className="mt-4 text-gray-700">Carregando...</p>
      </div>
    </div>
  );
}
