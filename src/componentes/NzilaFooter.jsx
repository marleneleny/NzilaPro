import { useNavigate } from "react-router-dom";

function NzilaFooter() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const navigationLinks = [
    { text: "Home", path: "/home" },
    { text: "Vagas", path: "/vagas" },
    { text: "Mentorias", path: "/mentorias" },
    { text: "Candidaturas", path: "/candidaturas" },
  ];

  const centralLinks = [
    { text: "Fale conosco", path: "/contato" },
    { text: "Dúvidas frequentes", path: "/faq" },
    { text: "Central de apoio", path: "/apoio" },
  ];

  const legalLinks = [
    { text: "Política de privacidade", path: "/termosdepolitica" },
    { text: "Termos de uso", path: "/termos" },
    { text: "Política de Cookies", path: "/cookies" },
    { text: "Segurança", path: "/seguranca" },
  ];

  return (
    <footer className="text-white py-12 mt-72">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Copyright and Description */}
          <div className="md:col-span-1">
            <p className="text-gray-400 text-sm leading-relaxed">
              Todo o conteúdo deste site é protegido por direitos autorais e não pode ser usado sem a permissão da Nzila.
            </p>
          </div>

          {/* Navigation Section */}
          <div>
            <h3 className="text-white font-medium mb-4">Navegação</h3>
            <ul className="space-y-3">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm text-left"
                  >
                    {link.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Central Section */}
          <div>
            <h3 className="text-white font-medium mb-4">Central</h3>
            <ul className="space-y-3">
              {centralLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm text-left"
                  >
                    {link.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-white font-medium mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm text-left"
                  >
                    {link.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-6">
          <p className="text-gray-400 text-sm text-center">
            © copyright - todos os direitos reservados para NzilaPro 2025
          </p>
        </div>
      </div>
    </footer>
  );
}

export default NzilaFooter;
