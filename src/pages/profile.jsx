import React, { useState, useRef, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase"; // Caminho corrigido
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
  ExternalLink,
} from "lucide-react";
import {
  uploadDocument,
  uploadImage,
  deleteDocument,
} from "../services/cloudinary"; 
import { useNavigate } from "react-router-dom";

// ========================================
// COMPONENTE PRINCIPAL PROFILE
// ========================================

const CVUploadModal = ({ isOpen, onClose, onSave }) => {
  const [file, setFile] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

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
      "livro", "book", "ebook", "romance", "historia", "história", "contos", "conto", "sonhos", "augusto","Augusto","Curry","curry",
      "disciplina", "desenvolvimento pessoal", "autoajuda", "auto-ajuda", "motivação", "motivacao",
      "inspiração", "inspiracao", "reflexões", "reflexoes", "pensamentos", "filosofia", "espiritualidade","augusto","exercício","Exercício",
      // Documentos acadêmicos/técnicos (exceto tese/dissertação que podem ser parte do CV)
      "manual", "tutorial", "artigo", "article", "paper", "monografia", "pesquisa", "estudo","verb","Exercícios","exercícios","exerc","Exercices","exercises",
      // Documentos comerciais
      "relatório", "relatorio", "report", "apresentação", "apresentacao", "slides", "powerpoint", "ppt","diagrama", "actor", "ator",
      "planilha", "excel", "contrato", "contract", "invoice", "fatura", "receipt", "comprovante",
      "catalogo", "catálogo",
      // Mídia e entretenimento
      "revista", "magazine", "brochure", "folheto", "panfleto", "guia", "receitas", "cookbook",
      "cardápio", "cardapio",
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
        message: `Este arquivo parece ser um outro arquivo e não um currículo profissional. Por favor, envie seu CV pessoal.`,
      });
      setIsValidating(false);
      return;
    }

    // 2. INDICADORES POSITIVOS FORTES (alta confiança de ser CV)
    const strongCVIndicators = [
      "cv", "curriculo", "currículo", "resume", "curriculum",
    ];

    // 3. INDICADORES POSITIVOS MODERADOS (profissionais e técnicos)
    const moderateCVIndicators = [
      "profissional", "professional", "experiencia", "experiência", "experience",
      "qualificacao", "qualificação", "qualification", "habilidades", "skills",
      "competencias", "competências", "carreira", "career",
      // Áreas técnicas e profissionais
      "frontend", "backend", "fullstack", "developer", "programador", "analista",
      "engenheiro", "designer", "marketing", "vendas", "gestao", "gestão",
      "administrador", "coordenador", "gerente", "supervisor", "diretor",
      // Áreas específicas
      "ti", "rh", "financeiro", "comercial", "administrativo", "juridico", "jurídico",
      "contabil", "contábil", "educacao", "educação", "saude", "saúde",
      // Formação acadêmica comum em CVs
      "formacao", "formação", "educacao", "educação", "diploma", "certificado",
      "tese", "thesis", "dissertação", "dissertacao", "mestrado", "doutorado",
    ];

    // Verificar indicadores fortes de CV
    const hasStrongCV = strongCVIndicators.some((indicator) =>
      fileName.includes(indicator)
    );
    if (hasStrongCV) {
      cvScore += 60;
      hasPositiveIndicator = true;
    }

    // Verificar indicadores moderados
    const hasModerateCV = moderateCVIndicators.some((indicator) =>
      fileName.includes(indicator)
    );
    if (hasModerateCV) {
      cvScore += 30;
      hasPositiveIndicator = true;
    }

    // 4. Padrões de nome que sugerem dados pessoais (nomes próprios)
    const namePattern =
      /\b[a-z]{2,}\s+[a-z]{2,}|[a-z]+_[a-z]+(?:_cv|_curriculo|_resume)?|(?:cv|curriculo|resume)_[a-z]+/i;
    if (namePattern.test(fileName)) {
      cvScore += 25;
      hasPositiveIndicator = true;
    }

    // 5. Verificar se tem pelo menos um indicador positivo
    if (!hasPositiveIndicator) {
      // Verificação mais flexível - se o arquivo parece ter formato de nome pessoal
      const possiblePersonalName =
        /^[a-z]+(?:[-_\s][a-z]+)*\.(?:pdf|docx?|doc)$/i.test(fileName);
      if (possiblePersonalName && Math.random() > 0.5) {
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

    // 6. Nomes muito genéricos são suspeitos
    const genericNames = [
      "documento", "document", "arquivo", "file", "texto", "text", "untitled",
      "sem titulo", "novo", "new", "temp", "temporario", "download", "anexo", "attachment",
    ];
    const hasGenericName = genericNames.some((generic) =>
      fileName.includes(generic)
    );
    if (hasGenericName) {
      cvScore -= 20;
      rejectionReasons.push("Nome muito genérico para um CV");
    }

    // 7. Análise de tamanho mais flexível
    if (fileSize < 20 * 1024) {
      cvScore -= 30;
      rejectionReasons.push("Arquivo muito pequeno para um CV (menos de 20KB)");
    } else if (fileSize >= 20 * 1024 && fileSize <= 3 * 1024 * 1024) {
      cvScore += 20;
    } else if (fileSize > 3 * 1024 * 1024) {
      cvScore -= 15;
      rejectionReasons.push("Arquivo muito grande para um CV típico (mais de 3MB)");
    }

    // 8. Extensões inadequadas
    if (fileName.endsWith(".txt")) {
      cvScore -= 30;
      rejectionReasons.push("Formato .txt é inadequado para CV profissional");
    }

    // DECISÃO FINAL
    let isLikelyCV = false;
    let validationMessage = "";

    console.log(`Score do arquivo "${fileName}": ${cvScore}`);

    if (cvScore >= 35) {
      isLikelyCV = true;
      validationMessage = "Currículo válido! Documento identificado como CV profissional.";
    } else if (cvScore >= 15 && hasPositiveIndicator) {
      if (Math.random() > 0.3) {
        isLikelyCV = true;
        validationMessage = "Documento aceito como currículo. Verifique se contém todas suas informações profissionais.";
      } else {
        isLikelyCV = false;
        validationMessage = "Este arquivo pode não ser um currículo completo. Certifique-se de que contém experiência, formação e dados de contato.";
      }
    } else {
      isLikelyCV = false;
      const reasons = rejectionReasons.length > 0
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

    // Simular upload visual
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
      console.log("Iniciando upload do CV:", file.name);
      
      // Upload real para Cloudinary
      const uploadedCV = await uploadDocument(file);
      console.log("CV uploaded para Cloudinary:", uploadedCV);
      
      // Validar se o upload foi bem-sucedido
      if (!uploadedCV.url || !uploadedCV.publicId) {
        throw new Error("Upload incompleto - URL ou publicId não retornados");
      }
      
      // CORREÇÃO SIMPLES: Não definir area e focus aqui
      // Deixar que o componente Profile gerencie esses valores
      const cvData = {
        fileName: file.name,
        url: uploadedCV.url,
        publicId: uploadedCV.publicId,
        // Remover area e focus - serão definidos no Profile
        uploadDate: new Date().toISOString(),
        fileSize: file.size,
        fileType: file.type,
        // Dados adicionais do Cloudinary (opcional)
        originalName: uploadedCV.originalName,
        format: uploadedCV.format
      };
      
      console.log("Dados do CV preparados:", cvData);
      
      // Validar cvData antes de salvar
      if (!cvData.url || !cvData.publicId) {
        throw new Error("Dados do CV inválidos - URL ou publicId ausentes");
      }
      
      // Chamar função de save do componente pai
      await onSave(cvData);
      
    } catch (error) {
      console.error("Erro ao fazer upload do CV:", error);
      
      // Mensagem de erro mais específica
      if (error.message.includes("Upload incompleto")) {
        alert("Erro no upload: Dados incompletos retornados do servidor. Tente novamente.");
      } else if (error.message.includes("Dados do CV inválidos")) {
        alert("Erro na preparação dos dados do CV. Tente novamente.");
      } else {
        alert("Erro ao fazer upload do currículo. Verifique sua conexão e tente novamente.");
      }
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
    setIsSaving(false);
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
          currículo. Iremos analisar automaticamente sua área de atuação.
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
                Analisando currículo e identificando área de atuação...
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

// Modal de confirmação para remoção de CV


const Profile = () => {
  const { User, SetUser } = useAuth();
  const [cvUploadLoading, setCvUploadLoading] = useState(false);
  const [cvSaveLoading, setCvSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: User?.name || User?.displayName || "",
    email: User?.email || "",
    area: User?.area || "",
    specialization: User?.specialization || "",
    accountType: User?.accountType || "",
    contact: User?.contact || "",
    about: User?.about || "",
    portifolio: User?.portifolio || "",
  });

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [userCV, setUserCV] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const defaultAvatar =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999999'%3E%3Cpath d='M12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4zm0 9c2.67 0 8 1.34 8 4v1H4v-1c0-2.66 5.33-4 8-4z'/%3E%3C/svg%3E";

  // ========================================
  // FUNÇÃO AUXILIAR PARA VERIFICAR AUTENTICAÇÃO
  // ========================================
  const isAuthenticated = () => {
  const userId = getUserId();
  const email = User?.email || auth.currentUser?.email;
  
  return !!userId && !!email; // ✅ Agora usa o ID corretamente
};

useEffect(() => {
  console.log("Dados do usuário no Profile:", {
    FirestoreID: User?.id,      // ID que você salvou
    AuthUID: User?.uid,         // UID padrão do Firebase
    CurrentAuthUID: auth.currentUser?.uid // Fallback direto
  });
}, [User]);

const getUserId = () => {
  // Prioridade 1: ID do contexto (User.id)
  if (User?.id) return User.id;
  
  // Prioridade 2: UID do Firebase Auth (do contexto)
  if (User?.uid) return User.uid;
  
  // Prioridade 3: UID do auth.currentUser (fallback)
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  
  console.error("ID não encontrado. Dados disponíveis:", {
    ContextUser: User,
    AuthUser: auth.currentUser
  });
  
  return null;
};


  // CARREGAMENTO INICIAL DOS DADOS
  useEffect(() => {
    const loadUserData = async () => {
      if (User && getUserId()) {
        try {
          const userRef = doc(db, "users", getUserId());
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setFormData({
              fullName: userData.fullName || User.displayName || "",
              email: userData.email || User.email || "",
              area: userData.area || "",
              specialization: userData.specialization || "",
              accountType: userData.accountType || "",
              contact: userData.contact || "",
              about: userData.about || "",
              portifolio: userData.portifolio || "",
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      }
    };

    loadUserData();
  }, [User]);

  useEffect(() => {
  // Limpar estado quando não há usuário autenticado
  if (!User || !getUserId()) {
    setUserCV(null);
    setFormData({
      fullName: "",
      email: "",
      area: "",
      specialization: "",
      accountType: "",
      contact: "",
      about: "",
      portifolio: "",
    });
  }
}, [User]);

  // FUNÇÕES DE VALIDAÇÃO
  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // ========================================
  // FUNÇÕES PARA MANIPULAÇÃO DO CV
  // ========================================
  const loadCVFromStorage = () => {
    try {
    const userId = getUserId();
    
    if (userId) {
      const userSpecificCV = localStorage.getItem(`userCV_${userId}`);
      if (userSpecificCV) {
        console.log("CV carregado do localStorage para usuário:", userId);
        return JSON.parse(userSpecificCV);
      }
    }
      
    } catch (error) {
      console.error("Erro ao carregar CV do localStorage:", error);
    }
    return null;
  };

  const saveCVToStorage = (cvData) => {
   try {
    const userId = getUserId();
    if (userId && cvData) {
      const dataToSave = {
        fileName: cvData.fileName || cvData.name,
        url: cvData.url,
        publicId: cvData.publicId,
        area: cvData.area,
        focus: cvData.focus,
        uploadDate: cvData.uploadDate,
        fileSize: cvData.fileSize || cvData.size,
        fileType: cvData.fileType || cvData.type
      };
        
        localStorage.setItem(`userCV_${userId}`, JSON.stringify(dataToSave));
        console.log("Metadados do CV salvos no localStorage:", dataToSave);
      }
    } catch (error) {
      console.error("Erro ao salvar CV no localStorage:", error);
    }
  };

  const removeCVFromStorage = () => {
    try {
      const userId = getUserId();
      
      if (userId) {
        localStorage.removeItem(`userCV_${userId}`);
      }
      
      
      console.log("CV removido do localStorage");
    } catch (error) {
      console.error("Erro ao remover CV do localStorage:", error);
    }
  };

  const handleDownloadCV = async () => {
    if (userCV?.url) {
      try {
        const response = await fetch(userCV.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = userCV.fileName || userCV.name || 'curriculo.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erro ao baixar CV:', error);
        alert('Erro ao baixar currículo. Tente visualizar online.');
      }
    } else {
      alert("URL do currículo não encontrada.");
    }
  };

const handleCVSave = async (cvDataOrFile) => {
  if (!isAuthenticated()) {
    alert("Usuário não autenticado para upload de CV. Por favor, faça login.");
    return;
  }

  try {
    setCvSaveLoading(true);
    let cvData;

    // Se recebeu um arquivo, fazer upload
    if (cvDataOrFile instanceof File) {
      const userId = getUserId();
      const uploadResult = await uploadDocument(cvDataOrFile, userId);

      cvData = {
        fileName: uploadResult.originalName,
        name: uploadResult.originalName,
        size: uploadResult.size,
        type: cvDataOrFile.type,
        uploadDate: new Date().toISOString(),
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        // Preservar valores do formulário atual
        area: formData.area,
        focus: formData.specialization,
      };
    } else {
      // Se recebeu dados do CV já processados
      cvData = {
        ...cvDataOrFile,
        // Preservar valores do formulário atual
        area: formData.area,
        focus: formData.specialization,
      };
    }
    
    // Salvar CV no localStorage e definir no estado
    saveCVToStorage(cvData);
    setUserCV(cvData);
    setShowUploadModal(false);
    
    console.log("CV salvo com sucesso:", cvData);
    
  } catch (error) {
    console.error("Erro ao salvar CV:", error);
    alert("Erro ao salvar currículo. Tente novamente.");
  } finally {
    setCvSaveLoading(false);
  }
};

  const handleRemoveCV = async () => {
    if (!isAuthenticated()) {
      alert("Usuário não autenticado. Por favor, faça login.");
      return;
    }

    try {
      setCvUploadLoading(true);
      
      // Remover do Cloudinary
      if (userCV?.publicId) {
        try {
          await deleteDocument(userCV.publicId);
          console.log("CV removido do Cloudinary");
        } catch (cloudinaryError) {
          console.warn("Erro ao remover do Cloudinary:", cloudinaryError);
        }
      }
      
      // Remover do Firestore
      const userId = getUserId();
      if (userId) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          cvData: null,
          area: "",
          specialization: "",
          testData: null,
          testCompleted: false,
          videoTestCompleted: false,
          updatedAt: new Date()
        });
      }
      
      // Remover do localStorage
      removeCVFromStorage();
      setUserCV(null);
      setShowDeleteConfirmation(false);
      
      // Atualizar contexto
      SetUser(prev => ({
        ...prev,
        cvData: null,
        area: "",
        specialization: "",
        testData: null,
        testCompleted: false,
        videoTestCompleted: false,
      }));
      
      alert("Currículo removido com sucesso! Você precisará refazer o teste em vídeo.");
      console.log("CV removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover CV:", error);
      alert("Erro ao remover currículo. Tente novamente.");
    } finally {
      setCvUploadLoading(false);
    }
  };

  // ========================================
  // FUNÇÕES PARA MANIPULAÇÃO DO AVATAR
  // ========================================
  const loadAvatarFromStorage = () => {
    try {
      const userId = getUserId();
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
      const userId = getUserId();
      if (userId && avatarUrl) {
        localStorage.setItem(`userAvatar_${userId}`, avatarUrl);
        console.log("Avatar salvo no localStorage:", avatarUrl);
      }
    } catch (error) {
      console.error("Erro ao salvar avatar no localStorage:", error);
    }
  };

  const getUserAvatar = () => {
    if (previewImage) {
      return previewImage;
    }

    if (User?.avatar) {
      return User.avatar;
    }

    const storedAvatar = loadAvatarFromStorage();
    if (storedAvatar) {
      return storedAvatar;
    }

    if (User?.photoURL) {
      return User.photoURL;
    }

    return defaultAvatar;
  };

  // ========================================
  // OPÇÕES DE ESPECIALIZAÇÃO
  // ========================================
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
          { value: "Inteligência Artificial", label: "Inteligência Artificial" },
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
          { value: "Contabilidade Gerencial", label: "Contabilidade Gerencial" },
          { value: "Análise Financeira", label: "Análise Financeira" },
          { value: "Planejamento Tributário", label: "Planejamento Tributário" },
        ];
      default:
        return [{ value: "", label: "Selecione primeiro uma área de atuação" }];
    }
  };

  // ========================================
  // HANDLERS DE EVENTOS
  // ========================================
  const handleClickImage = () => {
    if (!imageLoading) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isAuthenticated()) {
      alert("Usuário não autenticado. Por favor, faça login para atualizar a foto de perfil.");
      return;
    }

    setImageLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;
        
        try {
          const userId = getUserId();
          
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            avatar: base64Image,
          });

          saveAvatarToStorage(base64Image);

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
  console.log("Tentativa de salvamento - Estado do usuário:", {
    User: !!User,
    uid: User?.uid,
    id: User?.id,
    isAuthenticated: isAuthenticated(),
    userCV: userCV,
    formData: formData
  });

  if (!isAuthenticated()) {
    alert("Usuário não autenticado. Por favor, faça login para salvar as alterações.");
    return;
  }

  // Validações básicas
  const newErrors = {};
  
  if (!formData.fullName.trim()) {
    newErrors.fullName = 'Nome completo é obrigatório';
  }
  
  if (!formData.email.trim()) {
    newErrors.email = 'Email é obrigatório';
  }
  
  if (formData.portifolio && !validateUrl(formData.portifolio)) {
    newErrors.portifolio = 'URL do portfólio inválida';
  }
  
  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    alert('Por favor, corrija os erros no formulário antes de salvar.');
    return;
  }

  setLoading(true);

  try {
    const userId = getUserId();
    const userRef = doc(db, "users", userId);
    
    // Primeiro, vamos buscar os dados atuais do usuário para preservar o CV
    const currentUserDoc = await getDoc(userRef);
    const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : {};
    
    const updateData = {
      fullName: formData.fullName,
      email: formData.email,
      area: formData.area,
      specialization: formData.specialization,
      accountType: formData.accountType,
      contact: formData.contact,
      about: formData.about,
      portifolio: formData.portifolio,
      updatedAt: new Date().toISOString()
    };

    // Preservar dados do CV existente
    const existingCV = userCV || currentUserData.cvData || User?.cvData;
    
    if (existingCV && existingCV.url) {
      updateData.cvData = {
        fileName: existingCV.fileName,
        url: existingCV.url,
        publicId: existingCV.publicId,
        area: existingCV.area,
        focus: existingCV.focus,
        uploadDate: existingCV.uploadDate,
        fileSize: existingCV.fileSize,
        fileType: existingCV.fileType
      };
      
      console.log("Dados do CV preservados:", updateData.cvData);
      
      // Atualize também a área e especialização se vierem do CV e não estiverem preenchidas
      if (existingCV.area && !updateData.area) {
        updateData.area = existingCV.area;
      }
      if (existingCV.focus && !updateData.specialization) {
        updateData.specialization = existingCV.focus;
      }
    } else {
      console.log("Nenhum CV encontrado para preservar");
    }

    console.log("Salvando dados completos:", updateData);
    await updateDoc(userRef, updateData);

    // Atualizar o contexto do usuário
    SetUser((prev) => ({
      ...prev,
      ...updateData,
      cvData: existingCV || prev.cvData // Preserva o CV existente
    }));
    window.location.reload();
    alert("Perfil atualizado com sucesso!");
    
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    alert(`Erro ao atualizar perfil: ${error.message}`);
  } finally {
    setLoading(false);
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
  };

  // ========================================
  // SINCRONIZAÇÃO DE DADOS
  // ========================================
  const syncCVData = async () => {
    if (!isAuthenticated()) return;

    try {
      const userId = getUserId();
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        if (userData.cvData && !userCV) {
          saveCVToStorage(userData.cvData);
          setUserCV(userData.cvData);
        } else if (userCV && !userData.cvData) {
          await updateDoc(userRef, {
            cvData: userCV,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao sincronizar dados do CV:", error);
    }
  };

  // ========================================
  // EFEITOS
  // ========================================
  useEffect(() => {
    const savedCV = loadCVFromStorage();
    if (savedCV) {
      setUserCV(savedCV);

      if (User && !User.cvData) {
        SetUser((prev) => ({
          ...prev,
          cvData: savedCV,
        }));
      }
    }
  }, [User?.id, User?.uid, SetUser]);

useEffect(() => {
  const loadUserCV = async () => {
    if (!User || !getUserId()) return;

    try {
      // Primeiro, tenta carregar do localStorage
      const storedCV = loadCVFromStorage();
      if (storedCV && storedCV.url) {
        console.log("CV carregado do localStorage:", storedCV);
        setUserCV(storedCV);
        return;
      }

      // Se não encontrar no localStorage, busca no Firestore
      const userId = getUserId();
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.cvData && userData.cvData.url) {
          console.log("CV carregado do Firestore:", userData.cvData);
          setUserCV(userData.cvData);
          // Salva no localStorage para próximas sessões
          saveCVToStorage(userData.cvData);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar CV do usuário:", error);
    }
  };

  loadUserCV();
}, [User]);



useEffect(() => {
  const loadUserCV = async () => {
    if (User && getUserId()) {
      try {
        // 1. Tentar carregar do Firestore primeiro
        const userRef = doc(db, "users", getUserId());
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.cvData) {
            console.log("CV carregado do Firestore:", userData.cvData);
            setUserCV(userData.cvData);
            saveCVToStorage(userData.cvData); // Sincronizar com localStorage
            return;
          }
        }
        
        // 2. Se não encontrou no Firestore, tentar localStorage
        const storedCV = loadCVFromStorage();
        if (storedCV) {
          console.log("CV carregado do localStorage:", storedCV);
          setUserCV(storedCV);
        }
      } catch (error) {
        console.error("Erro ao carregar CV do usuário:", error);
      }
    }
  };

  loadUserCV();
}, [User]);

  useEffect(() => {
    if (isAuthenticated() && userCV) {
      syncCVData();
    }
  }, [User?.id, User?.uid, userCV]);

  const handleViewCV = () => {
    if (userCV?.url) {
      window.open(userCV.url, '_blank');
    } else {
      alert("URL do currículo não encontrada.");
    }
  };

  return (
    <div className="min-h-screen bg-[#060B0D] text-white">
      <Navbar />

      <img className="pt-36 w-[200rem]" src={topoProfile} alt="" />

      <div className="flex flex-col items-center pt-20 pb-10">
        {/* Profile Image Section */}
        <div className="flex items-center gap-6 relative bottom-32">
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
        <button 
          onClick={handleLogout} 
          className="px-8 py-2 bg-red-500 absolute ml-[43rem] bottom-80 rounded-md text-white font-medium hover:bg-red-400"
        >
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
                className={`w-full px-4 py-3 bg-gray-800 border rounded-md focus:outline-none focus:border-green-500 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Seu nome completo"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-md focus:outline-none focus:border-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de Conta
              </label>
              <input
                type="text"
                value={formData.accountType}
                readOnly
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md cursor-not-allowed"
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

        {/* Portfolio Section */}
        <div className="mr-[27rem] mt-8">
          <label className="block text-sm font-medium mb-2">Link do Portfólio</label>
          <div className="flex relative">
            <input
              type="url"
              name="portifolio"
              value={formData.portifolio || ''}
              onChange={handleInputChange}
              className={`flex-1 px-4 py-3 bg-gray-800 border rounded-md focus:outline-none focus:border-green-500 ${
                errors.portifolio ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="https://meuportfolio.com"
            />
            {formData.portifolio && validateUrl(formData.portifolio) && (
              <a
                href={formData.portifolio}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-3 text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>
          {errors.portifolio && (
            <p className="mt-1 text-sm text-red-600">{errors.portifolio}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Opcional: Compartilhe seu portfólio online (ex: GitHub, Behance, site pessoal)
          </p>
        </div>

        <div className="w-full max-w-4xl mt-8">
  <label className="block text-sm font-medium mb-2">Sobre você</label>
  <textarea
    name="about"
    value={formData.about}
    onChange={handleInputChange}
    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-green-500"
    placeholder="Conte um pouco sobre você..."
    rows={4}
  />
</div>

        {/* CV Upload Section */}
        <div className="w-full max-w-4xl mt-8">
          <label className="block text-sm font-medium mb-2">Currículo</label>

          {/* Loading bar quando fazendo upload/delete */}
          {(cvUploadLoading || cvSaveLoading) && (
            <div className="mb-4 p-4 bg-blue-50 bg-opacity-10 border border-blue-500 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-400">
                  {cvSaveLoading ? "Salvando currículo..." : "Processando currículo..."}
                </span>
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
            <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="text-blue-400" size={24} />
                <div>
                  <p className="text-white font-medium">
                    {userCV.fileName || userCV.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Área: {userCV.area || "Não especificada"}
                    {userCV.focus && ` • ${userCV.focus}`}
                  </p>
                  {userCV.uploadDate && (
                    <p className="text-gray-400 text-xs">
                      Enviado em: {new Date(userCV.uploadDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div><div className="flex space-x-2">
                <button
                  onClick={handleViewCV}
                  className="p-2 rounded-full hover:bg-gray-600 transition-colors"
                  title="Visualizar Currículo"
                >
                  <ExternalLink className="text-blue-400" size={20} />
                </button>
                <button
                  onClick={handleDownloadCV}
                  className="p-2 rounded-full hover:bg-gray-600 transition-colors"
                  title="Baixar Currículo"
                >
                  <Download className="text-green-400" size={20} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="p-2 rounded-full hover:bg-gray-600 transition-colors"
                  title="Remover Currículo"
                >
                  <X className="text-red-400" size={20} />
                </button>
                <button
                    onClick={() => setShowUploadModal(true)} // Permite re-upload/atualização
                    className="p-2 rounded-full hover:bg-gray-600 transition-colors"
                    title="Atualizar Currículo"
                >
                    <RefreshCw className="text-yellow-400" size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg border border-dashed border-gray-600 text-center">
              <p className="text-gray-400 mb-4">
                Nenhum currículo enviado ainda.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Upload size={20} />
                <span>Enviar Currículo</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-10 py-2 relative right-96 mt-6 bg-green-500 rounded-md text-black font-medium hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed "
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja remover seu currículo? Essa ação não pode ser desfeita e você precisará refazer o teste em vídeo.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                disabled={cvUploadLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleRemoveCV}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cvUploadLoading}
              >
                {cvUploadLoading ? "Removendo..." : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}

      <NzilaFooter />
    </div>
  );
};

export default Profile;