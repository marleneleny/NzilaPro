import logo from "../assets/logo.svg";
import circles from "../assets/circles.svg";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

export default function Termos() {
    useEffect(() => {
    AOS.init({
      duration: 2000, // Duração da animação
      once: true, // A animação ocorre apenas uma vez
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#060B0D] text-white">
      <header className="flex justify-between"
          data-aos-delay="100">
        <img className="ml-[4rem] mt-9" src={logo} alt="" />
         <img className="absolute top-[70rem] left-[75rem] -rotate-180" src={circles} alt="" />
        <button className="mr-[5rem] mt-9 w-28 h-10 text-black text-sm rounded-[50px] bg-[#BFF205]">
          Saiba mais
        </button>
      </header>
        <div className="">
      <h1
      data-aos="fade-up"
        className="text-5xl font-black ml-[19rem] mt-32 "
      >
        Politica de privacidade <br /> do Monabele.
      </h1>
      <img className=" absolute top-80" src={circles} alt="" />
      <p className="paragrafo-T mt-12" data-aos="fade-up">
        Use our built-in analytics dashboard to pull valuable insights and
        monitor the value of your Krypto portfolio over time.{" "}
      </p>

      <p className="paragrafo-T" data-aos="fade-up">
        At vero eos et accusamus et iusto odio dignissimos ducimus qui
        blanditiis <span className="text-[#BFF205]">praesentium</span> voluptatum deleniti atque corrupti quos dolores
        et quas molestias excepturi sint occaecati cupiditate non provident,
        similique sunt in culpa qui officia deserunt mollitia animi, i d est
        laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
        distinctio. Nam libero tempore, cum soluta nobis est eligendi optio
        cumque nihil impedit quo minus id quod maxime placeat facere possimus,
        omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem
        quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet
        ut et voluptates repudiandae sin t et <span className="text-[#BFF205]">molestiae</span> non recusandae. Itaque
        earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
        voluptatibus maiores alias conseq uatur aut perfer endis doloribus
        asperiores repellat.
      </p>
     <p className="paragrafo-T" data-aos="fade-up">
        At vero eos et accusamus et iusto odio dignissimos ducimus qui
        blanditiis <span className="text-[#BFF205]">praesentium</span> voluptatum deleniti atque corrupti quos dolores
        et quas molestias excepturi sint occaecati cupiditate non provident,
        similique sunt in culpa qui officia deserunt mollitia animi, i d est
        laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
        distinctio. Nam libero tempore, cum soluta nobis est eligendi optio
        cumque nihil impedit quo minus id quod maxime placeat facere possimus,
        omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem
        quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet
        ut et voluptates repudiandae sin t et <span className="text-[#BFF205]">molestiae</span> non recusandae. Itaque
        earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
        voluptatibus maiores alias conseq uatur aut perfer endis doloribus
        asperiores repellat.
      </p>
      <p className="paragrafo-T" data-aos="fade-up">
        At vero eos et accusamus et iusto odio dignissimos ducimus qui
        blanditiis <span className="text-[#BFF205]">praesentium</span> voluptatum deleniti atque corrupti quos dolores
        et quas molestias excepturi sint occaecati cupiditate non provident,
        similique sunt in culpa qui officia deserunt mollitia animi, i d est
        laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
        distinctio. Nam libero tempore, cum soluta nobis est eligendi optio
        cumque nihil impedit quo minus id quod maxime placeat facere possimus,
        omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem
        quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet
        ut et voluptates repudiandae sin t et <span className="text-[#BFF205]">molestiae</span> non recusandae. Itaque
        earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
        voluptatibus maiores alias conseq uatur aut perfer endis doloribus
        asperiores repellat.
      </p>
      <p className="paragrafo-T" data-aos="fade-up">
        At vero eos et accusamus et iusto odio dignissimos ducimus qui
        blanditiis <span className="text-[#BFF205]">praesentium</span> voluptatum deleniti atque corrupti quos dolores
        et quas molestias excepturi sint occaecati cupiditate non provident,
        similique sunt in culpa qui officia deserunt mollitia animi, i d est
        laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
        distinctio. Nam libero tempore, cum soluta nobis est eligendi optio
        cumque nihil impedit quo minus id quod maxime placeat facere possimus,
        omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem
        quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet
        ut et voluptates repudiandae sin t et <span className="text-[#BFF205]">molestiae</span> non recusandae. Itaque
        earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
        voluptatibus maiores alias conseq uatur aut perfer endis doloribus
        asperiores repellat.
      </p>
     

      </div>
      
      <div className="flex ml-[19rem] mt-20 h-40" data-aos="fade-in"
          data-aos-delay="100">
        <hr className="w-1 h-20 bg bg-[#BFF205] rounded-lg" />
        <div className="ml-3">
        <p className="text-[#BFF205]">Seja bem vindo</p>
        <p className="text-2xl font-bebas">NzilaPro</p>
        <p className="text-[#AEABAB] text-xs mt-2 ">Ultima atualização em: 02/05/204</p>
        </div>
      </div>
    </div>
  );
}
