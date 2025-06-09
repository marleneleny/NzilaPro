import React, { useState, useRef, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../services/firebase"; // Caminho corrigido
import defaultImage from "../assets/default.svg";
import useAuth from "../hooks/useAuth";
import Navbar from "../componentes/Navbar";
import NzilaFooter from "../componentes/NzilaFooter";
import topoProfile from "../assets/topoProfile.svg";
import {
  FileText,
  Download,
  X,
  Upload,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  uploadDocument,
  uploadImage,
  deleteDocument,
} from "../services/cloudinary"; 
import { useNavigate } from "react-router-dom";

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

// Modal de confirmação para remoção de CV - Adicione este componente no seu Profile.jsx
const CVDeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Ícone de alerta */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">!</span>
            </div>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
          Remover currículo
        </h2>

        {/* Mensagem de confirmação */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Tem certeza que deseja remover este currículo?
          </p>

          {/* Aviso sobre consequências */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left">
            <div className="flex items-start">
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-orange-800 mb-2">Atenção!</h3>
                <p className="text-sm text-orange-700 mb-2">
                  Ao remover seu currículo:
                </p>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Terá que fazer o teste em vídeo novamente</li>
                  <li>• Todas as informações do teste serão apagadas</li>
                  <li>• Suas candidaturas podem ser afetadas</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Profile() {
  const { User, SetUser } = useAuth();
  const [cvUploadLoading, setCvUploadLoading] = useState(false);
  const [cvSaveLoading, setCvSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: User?.name || User?.displayName || "",
    email: User?.email || "",
    area: User?.area || "",
    specialization: User?.specialization || "",
    accountType: User?.accountType || "",
    contact: User?.contact || "",
    about: User?.about || "",
  });
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false); // Loading específico para imagem
  const [previewImage, setPreviewImage] = useState(null); // Para preview da imagem
  const [userCV, setUserCV] = useState(null); // Estado para o CV
  const [showUploadModal, setShowUploadModal] = useState(false); // Modal de upload
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // Modal de confirmação para mudança de CV
  const fileInputRef = useRef(null);
  const navigate = useNavigate();



    const defaultAvatar =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999999'%3E%3Cpath d='M12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4zm0 9c2.67 0 8 1.34 8 4v1H4v-1c0-2.66 5.33-4 8-4z'/%3E%3C/svg%3E";

  // ADICIONE A FUNÇÃO getUserAvatar AQUI
  const getUserAvatar = () => {
    // 1. Se há preview de imagem (durante upload), mostrar preview
    if (previewImage) {
      return previewImage;
    }

    // 2. Se o usuário tem avatar no contexto, usar esse
    if (User?.avatar) {
      return User.avatar;
    }

    // 3. Tentar carregar avatar do localStorage
    const storedAvatar = loadAvatarFromStorage();
    if (storedAvatar) {
      return storedAvatar;
    }

    // 4. Se o usuário tem photoURL (Google/Firebase), usar esse
    if (User?.photoURL) {
      return User.photoURL;
    }

    // 5. Fallback para avatar padrão
    return defaultAvatar;
  };
   

  // Carregar CV do localStorage quando componente monta
  useEffect(() => {
    const savedCV = localStorage.getItem("userCV");
    if (savedCV) {
      const cvData = JSON.parse(savedCV);
      setUserCV(cvData);

      // NOVO: Sincronizar com o contexto do usuário se ainda não estiver lá
      if (User && !User.cvData) {
        SetUser((prev) => ({
          ...prev,
          cvData: cvData,
        }));
      }
    }
  }, [User, SetUser]);

  // Opções de especialização/foco baseadas na área de atuação (SEM ALTERAÇÃO NA LÓGICA DE SELECIONAR)
  const getFocusOptions = () => {
    switch (formData.area) {
      case "Tecnologia":
        return [
          { value: "", label: "Selecione seu foco" },
          { value: "Desenvolvimento Web", label: "Desenvolvimento Web" },
          { value: "Desenvolvimento Mobile", label: "Desenvolvimento Mobile" },
          { value: "Frontend", label: "Frontend" },
          { value: "Backend", label: "Backend" },
          { value: "Fullstack", label: "Fullstack" },
          { value: "Data Science", label: "Data Science" },
          { value: "Cybersecurity", label: "Cybersecurity" },
          { value: "DevOps", label: "DevOps" },
          { value: "UX/UI Design", label: "UX/UI Design" },
          {
            value: "Inteligência Artificial",
            label: "Inteligência Artificial",
          },
          { value: "Cloud Computing", label: "Cloud Computing" },
          { value: "Análise de Sistemas", label: "Análise de Sistemas" },
          { value: "Gestão de TI", label: "Gestão de TI" },
        ];
      case "Educação":
        return [
          { value: "", label: "Selecione seu foco" },
          { value: "Ensino Infantil", label: "Ensino Infantil" },
          { value: "Ensino Fundamental", label: "Ensino Fundamental" },
          { value: "Ensino Médio", label: "Ensino Médio" },
          { value: "Educação à Distância", label: "Educação à Distância" },
          { value: "Coordenação Pedagógica", label: "Coordenação Pedagógica" },
          { value: "Psicopedagogia", label: "Psicopedagogia" },
          { value: "Orientação Educacional", label: "Orientação Educacional" },
          { value: "Educação Especial", label: "Educação Especial" },
          { value: "Matemática", label: "Matemática" },
          { value: "Português", label: "Português" },
          { value: "História", label: "História" },
          { value: "Geografia", label: "Geografia" },
          { value: "Ciências", label: "Ciências" },
          { value: "Inglês", label: "Inglês" },
        ];
      case "Contabilidade":
        return [
          { value: "", label: "Selecione seu foco" },
          { value: "Contabilidade Geral", label: "Contabilidade Geral" },
          { value: "Auditoria", label: "Auditoria" },
          { value: "Contabilidade Fiscal", label: "Contabilidade Fiscal" },
          { value: "Controladoria", label: "Controladoria" },
          { value: "Perícia Contábil", label: "Perícia Contábil" },
          { value: "Consultoria Tributária", label: "Consultoria Tributária" },
          { value: "Contabilidade Pública", label: "Contabilidade Pública" },
          {
            value: "Contabilidade Gerencial",
            label: "Contabilidade Gerencial",
          },
          { value: "Análise Financeira", label: "Análise Financeira" },
          {
            value: "Planejamento Tributário",
            label: "Planejamento Tributário",
          },
        ];
      default:
        return [{ value: "", label: "Selecione primeiro uma área de atuação" }];
    }
  };

  const loadAvatarFromStorage = () => {
  try {
    const userId = User?.id || User?.uid;
    if (userId) {
      const storedAvatar = localStorage.getItem(`userAvatar_${userId}`);
      if (storedAvatar) {
        console.log("Avatar carregado do localStorage:", storedAvatar);
        return storedAvatar;
      }
    }
  } catch (error) {
    console.error("Erro ao carregar avatar do localStorage:", error);
  }
  return null;
};

const saveAvatarToStorage = (avatarUrl) => {
  try {
    const userId = User?.id || User?.uid;
    if (userId && avatarUrl) {
      localStorage.setItem(`userAvatar_${userId}`, avatarUrl);
      console.log("Avatar salvo no localStorage:", avatarUrl);
    }
  } catch (error) {
    console.error("Erro ao salvar avatar no localStorage:", error);
  }
};

useEffect(() => {
  const loadUserData = async () => {
    if (User && (User.id || User.uid)) {
      try {
        const userId = User.id || User.uid;
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // Se há avatar no Firestore, atualizar contexto e localStorage
          if (userData.avatar && userData.avatar !== User.avatar) {
            SetUser(prev => ({
              ...prev,
              avatar: userData.avatar,
            }));
            saveAvatarToStorage(userData.avatar);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    }
  };

  loadUserData();
}, [User?.id, User?.uid]);


  const isAuthenticated = () => {
    return User && User.uid;
  };

  const handleClickImage = () => {
    if (!imageLoading) {
      fileInputRef.current.click();
    }
  };

  // handleInputChange - SEM ALTERAÇÃO DE LÓGICA CONFORME SOLICITADO
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validações...
  if (!User || (!User.id && !User.uid)) {
    alert("Usuário não autenticado. Por favor, faça login para atualizar a foto de perfil.");
    return;
  }

  setImageLoading(true);

  try {
    // Converter para base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target.result;
      
      try {
        const userId = User.id || User.uid;
        
        // Salvar no Firestore
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          avatar: base64Image,
        });

        // Salvar no localStorage
        saveAvatarToStorage(base64Image);

        // Atualizar contexto
        SetUser((prev) => ({
          ...prev,
          avatar: base64Image,
        }));

        alert("Foto de perfil atualizada com sucesso!");

      } catch (error) {
        console.error("Erro ao salvar no Firestore:", error);
        alert("Erro ao salvar foto. Tente novamente.");
      } finally {
        setImageLoading(false);
      }
    };
    
    reader.readAsDataURL(file);

  } catch (error) {
    console.error("Erro ao processar imagem:", error);
    alert("Erro ao processar imagem. Tente novamente.");
    setImageLoading(false);
  } finally {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
};

const handleSave = async () => {
  if (!User || (!User.id && !User.uid)) {
    alert("Usuário não autenticado. Por favor, faça login para salvar as alterações.");
    return;
  }

  setLoading(true);

  try {
    const userId = User.id || User.uid;

    // Preparar dados para atualizar
    const updateData = {
      fullName: formData.fullName,
      email: formData.email,
      area: formData.area,
      specialization: formData.specialization,
      accountType: formData.accountType,
      contact: formData.contact,
      about: formData.about,
    };

    // IMPORTANTE: Incluir avatar atual se existir
    if (User.avatar) {
      updateData.avatar = User.avatar;
    }

    // Se existe CV no estado, incluir nos dados
    if (userCV) {
      updateData.cvData = userCV;
    }

    // Update user document in Firestore
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updateData);

    // Update user context
    SetUser((prev) => ({
      ...prev,
      name: formData.fullName,
      email: formData.email,
      area: formData.area,
      specialization: formData.specialization,
      accountType: formData.accountType,
      contact: formData.contact,
      about: formData.about,
      cvData: userCV,
    }));

    alert("Perfil atualizado com sucesso!");
    // Remover o window.location.reload() para evitar perder o estado
    
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Erro ao atualizar perfil. Tente novamente.");
  } finally {
    setLoading(false);
  }
};

// 6. ADICIONAR função para debug (temporária)
const debugAvatarState = () => {
  console.log("=== DEBUG AVATAR STATE ===");
  console.log("User.avatar:", User?.avatar);
  console.log("User.photoURL:", User?.photoURL);
  console.log("localStorage avatar:", loadAvatarFromStorage());
  console.log("previewImage:", previewImage);
  console.log("Current getUserAvatar():", getUserAvatar());
  console.log("========================");
};

  const handleRemoveCVSimple = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmRemoveCV = async () => {
    setShowDeleteConfirmation(false);
    setCvUploadLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.removeItem("userCV");
      setUserCV(null);

      if (User && (User.id || User.uid)) {
        const userId = User.id || User.uid;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          cvData: null,
          testData: null,
          testCompleted: false,
          videoTestCompleted: false,
        });

        SetUser((prev) => ({
          ...prev,
          cvData: null,
          testData: null,
          testCompleted: false,
          videoTestCompleted: false,
        }));
      }

      alert(
        "Currículo removido com sucesso! Você precisará refazer o teste em vídeo."
      );
    } catch (error) {
      console.error("Erro ao remover currículo:", error);
      alert("Erro ao remover currículo. Tente novamente.");
    } finally {
      setCvUploadLoading(false);
    }
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleCVSave = async (file) => {
    // ADICIONADO: Verificação explícita do User
    if (!User || (!User.id && !User.uid)) {
      alert(
        "Usuário não autenticado para upload de CV. Por favor, faça login."
      );
      return;
    }

    setCvSaveLoading(true); // NOVO: Ativar loading

    try {
      const userId = User.id || User.uid;
      const uploadResult = await uploadDocument(file, userId); // Use uploadDocument

      const cvData = {
        name: uploadResult.originalName,
        size: uploadResult.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };

      localStorage.setItem("userCV", JSON.stringify(cvData));
      setUserCV(cvData);
      setShowUploadModal(false);
      alert("Currículo salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar currículo no Cloudinary:", error);
      alert("Erro ao salvar currículo. Tente novamente.");
    } finally {
      setCvSaveLoading(false); // NOVO: Desativar loading
    }
  };

  async function handleLogout() {
      try {
        await auth.signOut();
        navigate("/login", { replace: true });
         window.location.reload();
        console.log("User logged out successfully!");
      } catch (error) {
        console.error("Error logging out:", error.message);
      }
    }

  return (
    <div className="min-h-screen bg-[#060B0D] text-white">
      <Navbar />

      <img className="pt-36 w-[200rem]" src={topoProfile} alt="" />

      <div className="flex flex-col items-center pt-20 pb-10">
        {/* Profile Image Section */}
        <div className="flex items-center gap-6  relative bottom-32">
          <div
            className={`w-36 h-36 bg-gray-600 right-[19rem] rounded-full overflow-hidden cursor-pointer relative ${
              imageLoading ? "opacity-50" : ""
            }`}
            onClick={handleClickImage}
            title={
              imageLoading
                ? "Carregando imagem..."
                : "Clique para trocar a foto"
            }
          >
            <img
              src={getUserAvatar()}
              alt={isAuthenticated() ? "User Avatar" : "Default Avatar"}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log("Image failed to load, using default");
                e.target.src = defaultAvatar;
              }}
              onLoad={() => console.log("Image loaded successfully")}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold right-[19rem] relative">
              {formData.fullName || "Nome do Usuário"}
            </h2>
          </div>
        </div>
        {/* Logout Button */}

        <button onClick={handleLogout} className="px-8 py-2 bg-red-500 absolute ml-[43rem] bottom-80 rounded-md text-white font-medium hover:bg-red-400">
          Terminar sessão
        </button>

        {/* Form Section */}
        <div className="w-full max-w-4xl grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome completo
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-green-500"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-green-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de Conta
              </label>
              <input
                type="text"
                value={formData.accountType}
                readOnly
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md  cursor-not-allowed"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Área de atuação
              </label>
              <input
                type="text"
                value={formData.area}
                readOnly
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Foco na área de atuação
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-green-500"
                disabled={!formData.area}
              >
                {getFocusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contacto</label>
              <div className="flex">
                <span className="px-3 py-3 bg-gray-700 border border-r-0 border-gray-600 rounded-l-md text-sm">
                  +244
                </span>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-r-md focus:outline-none focus:border-green-500"
                  placeholder="9********"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CV Upload Section - Agora mostra o CV carregado */}
        <div className="w-full max-w-4xl mt-8">
          <label className="block text-sm font-medium mb-2">Currículo</label>

          {/* Loading bar quando fazendo upload/delete */}
          {cvUploadLoading && (
            <div className="mb-4 p-4 bg-blue-50 bg-opacity-10 border border-blue-500 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-400">Processando currículo...</span>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full animate-pulse"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          )}

          {userCV ? (
            // Mostrar CV carregado
            <div
              className={`border border-gray-600 rounded-lg p-6 bg-gray-800 ${
                cvUploadLoading ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{userCV.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{formatFileSize(userCV.size)}</span>
                      <span>•</span>
                      <span>Carregado em: {formatDate(userCV.uploadDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(userCV.url, "_blank")}
                    disabled={cvUploadLoading}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Baixar CV"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleRemoveCVSimple}
                    disabled={cvUploadLoading}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Remover CV"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 bg-opacity-10 rounded-lg">
                <p className="text-sm text-green-400">
                  ✓ Currículo carregado com sucesso! Você pode acessar as
                  candidaturas.
                </p>
              </div>
            </div>
          ) : (
            // Mostrar área de upload quando não há CV
            <div
              className={`border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:cursor-pointer ${
                cvUploadLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => !cvUploadLoading && setShowUploadModal(true)}
            >
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-300 mb-2">
                <span className="font-medium">Nenhum currículo carregado</span>
              </p>
              <p className="text-sm text-gray-500">
                Vá para Candidaturas e faça o upload do seu CV para acessar as
                vagas disponíveis.
              </p>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="w-full max-w-4xl mt-8">
          <label className="block text-sm font-medium mb-2">Sobre mim</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            rows="6"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-green-500 resize-none"
            placeholder="Fale um pouco sobre você..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-10 py-2 relative right-96 mt-6  bg-green-500 rounded-md text-black font-medium hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed "
        >
          {loading && (
            <div className="w-4 h-4 mt-2 ml-6 absolute border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          )}
          Salvar
        </button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        className="hidden"
      />
      <CVUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={handleCVSave}
      />
      <CVDeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmRemoveCV}
      />
    </div>
  );
}
