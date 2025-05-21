import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function ProgressCounter() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [progress, setProgress] = useState(0);

  // Ativa o contador quando o componente aparece na tela
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  // Animação de contagem progressiva
  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = 100;
      const duration = 3000; // 3 segundos no total
      const step = duration / end;

      const counter = setInterval(() => {
        start++;
        setProgress(start);
        if (start >= end) clearInterval(counter);
      }, step);
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className="bg-[#EEEBEB] rounded-xl p-6 flex justify-between items-center w-[34rem] shadow-md mt-[38rem] ml-24"
    >
      
      <div>
        <h2 className="text-lg text-black font-poppins mb-4">O Caminho Certo para o <br /> Seu Sucesso</h2>
        <p className="text-sm text-black/70 mb-1">{progress}% completo</p>
        <div className="w-64 h-2 bg-gray-300 rounded-full overflow-hidden">
          <motion.div
            className="h-2 bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Cartão da direita */}
      <div className="bg-gray-200 rounded-lg px-6 py-4 text-center w-32">
        <p className="text-2xl font-bold text-black">{progress}%</p>
        <p className="text-xs text-gray-700">Mentorias abertas</p>
      </div>
    </div>
  );
}
