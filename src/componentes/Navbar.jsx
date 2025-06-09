import React, { useEffect, useState, useRef } from "react";
import { Upload, FileText, X, Check, AlertCircle } from "lucide-react";
import logo from "../assets/logo.svg";
import notificacao from "../assets/notificacao.svg";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Modal de Upload de CV Melhorado
const CVUploadModal = ({ isOpen, onClose, onSave }) => {
  const [file, setFile] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  // Função melhorada para validar se é um CV válido
  const validateCV = async (file) => {
    setIsValidating(true);
    setValidationResult(null);

    // Simular processo de validação
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verificações básicas de formato e tamanho
    const isValidType =
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

    if (!isValidType) {
      setValidationResult({
        isValid: false,
        message: "Formato de arquivo não suportado. Use PDF, DOC ou DOCX.",
      });
      setIsValidating(false);
      return;
    }

    if (!isValidSize) {
      setValidationResult({
        isValid: false,
        message: "Arquivo muito grande. Tamanho máximo: 5MB.",
      });
      setIsValidating(false);
      return;
    }

    const fileName = file.name.toLowerCase();
    const fileSize = file.size;

    // Sistema de validação melhorado
    let cvScore = 0;
    let rejectionReasons = [];
    let hasPositiveIndicator = false;

    // 1. PRIMEIRA VERIFICAÇÃO: Indicadores NEGATIVOS CRÍTICOS (rejeição automática)
    const criticalNegativeIndicators = [
      // Livros e literatura
      "livro",
      "book",
      "ebook",
      "romance",
      "historia",
      "história",
      "contos",
      "conto",
      "sonhos",
      "disciplina",
      "desenvolvimento pessoal",
      "autoajuda",
      "auto-ajuda",
      "motivação",
      "motivacao",
      "inspiração",
      "inspiracao",
      "reflexões",
      "reflexoes",
      "pensamentos",
      "filosofia",
      "espiritualidade",

      // Documentos acadêmicos/técnicos (exceto tese/dissertação que podem ser parte do CV)
      "manual",
      "tutorial",
      "artigo",
      "article",
      "paper",
      "monografia",
      "pesquisa",
      "estudo",

      // Documentos comerciais
      "relatório",
      "relatorio",
      "report",
      "apresentação",
      "apresentacao",
      "slides",
      "powerpoint",
      "ppt",
      "planilha",
      "excel",
      "contrato",
      "contract",
      "invoice",
      "fatura",
      "receipt",
      "comprovante",
      "catalogo",
      "catálogo",

      // Mídia e entretenimento
      "revista",
      "magazine",
      "brochure",
      "folheto",
      "panfleto",
      "guia",
      "receitas",
      "cookbook",
      "cardápio",
      "cardapio",
    ];

    const hasCriticalNegative = criticalNegativeIndicators.some((indicator) =>
      fileName.includes(indicator.toLowerCase())
    );

    if (hasCriticalNegative) {
      const matchedIndicator = criticalNegativeIndicators.find((indicator) =>
        fileName.includes(indicator.toLowerCase())
      );
      setValidationResult({
        isValid: false,
        message: `Este arquivo parece ser um "${matchedIndicator}" e não um currículo profissional. Por favor, envie seu CV pessoal.`,
      });
      setIsValidating(false);
      return;
    }

    // 2. INDICADORES POSITIVOS FORTES (alta confiança de ser CV)
    const strongCVIndicators = [
      "cv",
      "curriculo",
      "currículo",
      "resume",
      "curriculum",
    ];

    // 3. INDICADORES POSITIVOS MODERADOS (profissionais e técnicos)
    const moderateCVIndicators = [
      "profissional",
      "professional",
      "experiencia",
      "experiência",
      "experience",
      "qualificacao",
      "qualificação",
      "qualification",
      "habilidades",
      "skills",
      "competencias",
      "competências",
      "carreira",
      "career",

      // Áreas técnicas e profissionais
      "frontend",
      "backend",
      "fullstack",
      "developer",
      "programador",
      "analista",
      "engenheiro",
      "designer",
      "marketing",
      "vendas",
      "gestao",
      "gestão",
      "administrador",
      "coordenador",
      "gerente",
      "supervisor",
      "diretor",

      // Áreas específicas
      "ti",
      "rh",
      "financeiro",
      "comercial",
      "administrativo",
      "juridico",
      "jurídico",
      "contabil",
      "contábil",
      "educacao",
      "educação",
      "saude",
      "saúde",

      // Formação acadêmica comum em CVs
      "formacao",
      "formação",
      "educacao",
      "educação",
      "diploma",
      "certificado",
      "tese",
      "thesis",
      "dissertação",
      "dissertacao",
      "mestrado",
      "doutorado",
    ];

    // Verificar indicadores fortes de CV
    const hasStrongCV = strongCVIndicators.some((indicator) =>
      fileName.includes(indicator)
    );
    if (hasStrongCV) {
      cvScore += 60; // Aumentado de 50 para 60
      hasPositiveIndicator = true;
    }

    // Verificar indicadores moderados
    const hasModerateCV = moderateCVIndicators.some((indicator) =>
      fileName.includes(indicator)
    );
    if (hasModerateCV) {
      cvScore += 30; // Aumentado de 25 para 30
      hasPositiveIndicator = true;
    }

    // 4. Padrões de nome que sugerem dados pessoais (nomes próprios)
    const namePattern =
      /\b[a-z]{2,}\s+[a-z]{2,}|[a-z]+_[a-z]+(?:_cv|_curriculo|_resume)?|(?:cv|curriculo|resume)_[a-z]+/i;
    if (namePattern.test(fileName)) {
      cvScore += 25; // Aumentado de 20 para 25
      hasPositiveIndicator = true;
    }

    // 5. Verificar se tem pelo menos um indicador positivo
    if (!hasPositiveIndicator) {
      // Verificação mais flexível - se o arquivo parece ter formato de nome pessoal
      const possiblePersonalName =
        /^[a-z]+(?:[-_\s][a-z]+)*\.(?:pdf|docx?|doc)$/i.test(fileName);
      if (possiblePersonalName && Math.random() > 0.5) {
        // 50% de chance
        cvScore += 15;
        hasPositiveIndicator = true;
      } else {
        setValidationResult({
          isValid: false,
          message:
            "Nome do arquivo não indica ser um currículo. Use nomes como 'MeuCV.pdf', 'Curriculo_NomeSobrenome.pdf' ou similar.",
        });
        setIsValidating(false);
        return;
      }
    }

    // 6. Nomes muito genéricos são suspeitos (penalização reduzida)
    const genericNames = [
      "documento",
      "document",
      "arquivo",
      "file",
      "texto",
      "text",
      "untitled",
      "sem titulo",
      "novo",
      "new",
      "temp",
      "temporario",
      "download",
      "anexo",
      "attachment",
    ];
    const hasGenericName = genericNames.some((generic) =>
      fileName.includes(generic)
    );
    if (hasGenericName) {
      cvScore -= 20; // Reduzido de 30 para 20
      rejectionReasons.push("Nome muito genérico para um CV");
    }

    // 7. Análise de tamanho mais flexível
    if (fileSize < 20 * 1024) {
      // Reduzido de 30KB para 20KB
      cvScore -= 30; // Reduzido de 40 para 30
      rejectionReasons.push("Arquivo muito pequeno para um CV (menos de 20KB)");
    } else if (fileSize >= 20 * 1024 && fileSize <= 3 * 1024 * 1024) {
      // Aumentado limite para 3MB
      cvScore += 20; // Aumentado de 15 para 20
    } else if (fileSize > 3 * 1024 * 1024) {
      cvScore -= 15; // Reduzido de 25 para 15
      rejectionReasons.push(
        "Arquivo muito grande para um CV típico (mais de 3MB)"
      );
    }

    // 8. Extensões inadequadas (penalização reduzida)
    if (fileName.endsWith(".txt")) {
      cvScore -= 30; // Reduzido de 40 para 30
      rejectionReasons.push("Formato .txt é inadequado para CV profissional");
    }

    // DECISÃO FINAL com critérios mais flexíveis
    let isLikelyCV = false;
    let validationMessage = "";

    console.log(`Score do arquivo "${fileName}": ${cvScore}`);

    if (cvScore >= 35) {
      // Reduzido de 40 para 35
      isLikelyCV = true;
      validationMessage =
        "Currículo válido! Documento identificado como CV profissional.";
    } else if (cvScore >= 15 && hasPositiveIndicator) {
      // Reduzido de 20 para 15
      // Zona de incerteza - mais permissiva
      if (Math.random() > 0.3) {
        // 70% chance de aceitar (era 40%)
        isLikelyCV = true;
        validationMessage =
          "Documento aceito como currículo. Verifique se contém todas suas informações profissionais.";
      } else {
        isLikelyCV = false;
        validationMessage =
          "Este arquivo pode não ser um currículo completo. Certifique-se de que contém experiência, formação e dados de contato.";
      }
    } else {
      // Rejeição
      isLikelyCV = false;
      const reasons =
        rejectionReasons.length > 0
          ? rejectionReasons.join(". ")
          : "Arquivo não identificado como currículo profissional";
      validationMessage = `${reasons}. Por favor, envie um arquivo com nome indicativo de CV (ex: MeuCV.pdf, Curriculo_Nome.pdf).`;
    }

    setValidationResult({
      isValid: isLikelyCV,
      message: validationMessage,
    });

    setIsValidating(false);
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setValidationResult(null);
    setUploadProgress(0);

    // Simular upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          validateCV(selectedFile);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSave = async () => {
    if (validationResult?.isValid && file) {
      setIsSaving(true);
      try {
        await onSave(file);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const resetModal = () => {
    setFile(null);
    setValidationResult(null);
    setUploadProgress(0);
    setIsValidating(false);
    setIsSaving(false); // Adicione esta linha
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Upload do Currículo
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          Para acessar as candidaturas, primeiro você precisa enviar seu
          currículo.
        </p>

        {/* Área de Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-4 cursor-pointer ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) =>
              e.target.files[0] && handleFileSelect(e.target.files[0])
            }
            className="hidden"
          />

          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 mb-2">
            Clique para carregar o seu Currículo na plataforma
          </p>
          <p className="text-xs text-gray-500">
            Formatos aceitos: PDF, DOC, DOCX (até 5MB)
          </p>
        </div>

        {/* Arquivo selecionado */}
        {file && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="text-blue-600" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Barra de progresso */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {isValidating && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
              <span className="text-sm text-yellow-800">
                Validando currículo...
              </span>
            </div>
          </div>
        )}

        {validationResult && (
          <div
            className={`mb-4 p-3 rounded-lg border ${
              validationResult.isValid
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start space-x-2">
              {validationResult.isValid ? (
                <Check className="text-green-600 mt-0.5" size={16} />
              ) : (
                <AlertCircle className="text-red-600 mt-0.5" size={16} />
              )}
              <span
                className={`text-sm ${
                  validationResult.isValid ? "text-green-800" : "text-red-800"
                }`}
              >
                {validationResult.message}
              </span>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!validationResult?.isValid || isSaving}
            className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
              validationResult?.isValid && !isSaving
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function NavBar() {
  const { User } = useAuth();
  const [userAvatar, setUserAvatar] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userCV, setUserCV] = useState(null);
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

  useEffect(() => {
    const savedCV = localStorage.getItem("userCV");
    if (savedCV) {
      setUserCV(JSON.parse(savedCV));
    }
  }, []);

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

  const handleCandidaturasClick = (e) => {
    e.preventDefault(); // Impede navegação automática

    if (!userCV) {
      setShowUploadModal(true);
    } else {
      navigate("/candidaturas");
    }
  };

  const handleCVSave = (file) => {
    console.log("CV salvo:", file);

    // Criar dados do CV para salvar
    const cvData = {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      // Aqui você pode adicionar mais campos conforme necessário
    };

    // Atualizar estado e localStorage
    setUserCV(cvData);
    localStorage.setItem("userCV", JSON.stringify(cvData));

    // Fechar modal
    setShowUploadModal(false);

    // Navegar diretamente para candidaturas
    navigate("/candidaturas");

    // Aqui você pode implementar a lógica para enviar o arquivo para o servidor
    // Por exemplo: uploadCVToServer(file, cvData)
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
                <Link to="/home" className="nav-link">
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="/candidaturas"
                  className="nav-link"
                  onClick={handleCandidaturasClick}
                >
                  Candidaturas
                  {!userCV && (
                    <span className="ml-1 text-xs bg-red-500 text-white px-1 rounded">
                      CV
                    </span>
                  )}
                </a>
              </li>
              <li>
                <Link to="/mentorias" className="nav-link">
                  Mentorias
                </Link>
              </li>
              <li>
                <Link to="/sobrenos" className="nav-link">
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

          <Link to="/profile">
            <div className="w-10 h-10 mr-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              <img
                className="w-full h-full object-cover"
                src={userAvatar || defaultAvatar}
                alt={isAuthenticated() ? "User Avatar" : "Default Avatar"}
                onError={handleImageError}
                onLoad={handleImageLoad}
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Modal de Upload CV */}
      <CVUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={handleCVSave}
      />
    </>
  );
}
