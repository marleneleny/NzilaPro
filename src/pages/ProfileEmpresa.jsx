import React, { useState, useRef, useEffect } from "react";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import defaultCompanyLogo from "../assets/default-company.png";
import NavbarEmpresa from "../componentes/NavBarEmpresa";
import NzilaFooter from "../componentes/NzilaFooter";
import topoProfile from "../assets/topoProfile.svg";
import {
  Building,
  Users,
  MapPin,
  Globe,
  Phone,
  Mail,
  Upload,
  X,
  Check,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";
import { uploadImage } from "../services/cloudinary";
import { useNavigate } from "react-router-dom";

// Função placeholder para upload de documentos (você precisará implementar esta função)
const uploadDocument = async (file, docType, userId, progressCallback) => {
  // Simular upload - substitua pela sua implementação real
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      progressCallback(progress);
      if (progress >= 100) {
        clearInterval(interval);
        resolve(`https://example.com/documents/${docType}_${userId}_${Date.now()}.pdf`);
      }
    }, 100);
  });
};

// Modal para upload de documentos da empresa
const CompanyDocumentModal = ({ isOpen, onClose, onSave, docType }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const getDocumentInfo = () => {
    const docTypes = {
      license: {
        title: "Alvará de Funcionamento",
        description: "Documento que comprova o funcionamento da empresa.",
      },
      nif: {
        title: "NIF (Número de Identificação Fiscal)",
        description: "Documento de identificação fiscal da empresa.",
      },
      certificate: {
        title: "Certificado de Constituição",
        description: "Documento que formaliza a existência legal da empresa.",
      },
    };
    return docTypes[docType] || { title: "", description: "" };
  };

  const { title, description } = getDocumentInfo();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveClick = async () => {
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadDocument(
          file,
          docType,
          auth.currentUser?.uid,
          (progress) => setUploadProgress(progress)
        );
        onSave(docType, { url, name: file.name, uploadedAt: new Date() });
        setFile(null);
        onClose();
      } catch (error) {
        console.error("Error uploading document:", error);
        alert("Erro ao carregar o documento. Tente novamente.");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setIsUploading(false);
      setUploadProgress(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">
            Carregar {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">{description}</p>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging ? "border-blue-500 bg-gray-800" : "border-gray-600"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Check className="w-5 h-5" />
              <span>{file.name}</span>
            </div>
          ) : (
            <div className="text-gray-400">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">
                Arraste e solte seu arquivo aqui, ou{" "}
                <span className="text-blue-400 cursor-pointer">
                  clique para selecionar
                </span>
              </p>
              <p className="text-xs mt-1">(PDF, DOC, DOCX - Max 5MB)</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
        </div>

        {isUploading && (
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <button
          onClick={handleSaveClick}
          disabled={!file || isUploading}
          className="mt-6 w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Carregando..." : "Salvar Documento"}
        </button>
      </div>
    </div>
  );
};

const ProfileEmpresa = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Estado para o usuário autenticado
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [companyData, setCompanyData] = useState({
    name: "",
    businessArea: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    employees: "",
    about: "",
    logoUrl: "",
  });

  const [companyDocuments, setCompanyDocuments] = useState({
    license: null,
    nif: null,
    certificate: null,
  });

  const [loading, setLoading] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [currentDocType, setCurrentDocType] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingData, setExistingData] = useState(null); // Novo estado para dados existentes

  const businessAreas = [
    "Tecnologia",
    "Saúde",
    "Finanças",
    "Educação",
    "Construção",
    "Comércio",
    "Agricultura",
    "Turismo",
    "Transporte",
    "Consultoria",
  ];

  const [websiteError, setWebsiteError] = useState("");
const [websiteSuccess, setWebsiteSuccess] = useState("");
const [checkingWebsite, setCheckingWebsite] = useState(false)

  // Verificar autenticação
  useEffect(() => {
    console.log("Configurando listener de autenticação...");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Estado de autenticação mudou:", currentUser);
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch company data quando o usuário for carregado
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) {
        console.log("Usuário não disponível ainda");
        return;
      }

      console.log("Iniciando fetch dos dados da empresa para usuário:", user.uid);
      setProfileLoading(true);
      setError(null);
      
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Documento encontrado:", docSnap.data());
          const data = docSnap.data();
          
          // Salvar todos os dados existentes
          setExistingData(data);
          
          // Mapear os dados do Firebase para o estado local
          setCompanyData({
            name: data.fullName || data.name || "",
            businessArea: data.area || data.businessArea || "",
            phone: data.contact || data.phone || "",
            email: data.email || "",
            website: data.website || "",
            address: data.address || "",
            employees: data.employees || "",
            about: data.about || "",
            logoUrl: data.avatar || data.logoUrl || "",
          });

          // Verificar se existem documentos
          if (data.documents) {
            setCompanyDocuments({
              license: data.documents.license || null,
              nif: data.documents.nif || null,
              certificate: data.documents.certificate || null,
            });
          }
        } else {
          console.log("Documento não existe, criando perfil inicial...");
          // Criar documento inicial baseado nos dados de autenticação
          const initialData = {
            fullName: user.displayName || "",
            email: user.email || "",
            area: "",
            contact: "",
            website: "",
            address: "",
            employees: "",
            about: "",
            avatar: user.photoURL || "",
            accountType: "Empresa",
            documents: {
              license: null,
              nif: null,
              certificate: null,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await setDoc(docRef, initialData);
          setExistingData(initialData);
          
          setCompanyData({
            name: initialData.fullName,
            businessArea: initialData.area,
            phone: initialData.contact,
            email: initialData.email,
            website: initialData.website,
            address: initialData.address,
            employees: initialData.employees,
            about: initialData.about,
            logoUrl: initialData.avatar,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
        setError("Erro ao carregar perfil da empresa: " + error.message);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchCompanyData();
    }
  }, [user, authLoading]);

  const checkWebsite = async (url) => {
  // Se estiver vazio, não tem erro
  if (!url) {
    setWebsiteError("");
    setWebsiteSuccess("");
    return;
  }

  setCheckingWebsite(true);
  setWebsiteError("");
  setWebsiteSuccess("");

  try {
    // Verificar se tem formato básico de website
    if (!url.includes('.') || url.length < 4) {
      setWebsiteError("Website deve ter formato válido (ex: google.com)");
      setCheckingWebsite(false);
      return;
    }

    // Adicionar https:// se não tiver
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }

    // Tentar acessar o website
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`);
    const result = await response.json();

    if (result.status.http_code >= 200 && result.status.http_code < 400) {
      setWebsiteSuccess("✓ Website verificado com sucesso!");
      // Atualizar com a versão completa do URL
      setCompanyData(prev => ({
        ...prev,
        website: fullUrl
      }));
    } else {
      setWebsiteError("⚠️ Website não encontrado. Verifique se está correto.");
    }
  } catch (error) {
    setWebsiteError("⚠️ Não foi possível verificar o website.");
  }

  setCheckingWebsite(false);
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

const handleSave = async () => {
  if (!user) {
    alert("Você precisa estar logado para salvar as informações.");
    return;
  }

  // NOVA VERIFICAÇÃO: Não permitir salvar se website tiver erro
  if (websiteError) {
    alert("Por favor, corrija o website antes de salvar.");
    return;
  }

  // ... resto do código permanece igual ...
  setLoading(true);
  try {
    const companyDocRef = doc(db, "users", user.uid);
    
    const updateData = {
      ...existingData,
      fullName: companyData.name,
      area: companyData.businessArea,
      contact: companyData.phone,
      email: companyData.email,
      website: companyData.website,
      address: companyData.address,
      employees: companyData.employees,
      about: companyData.about,
      avatar: companyData.logoUrl,
      documents: companyDocuments,
      accountType: "Empresa",
      updatedAt: new Date(),
    };
    
    await updateDoc(companyDocRef, updateData);
    setExistingData(updateData);
    
    alert("Perfil da empresa atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar perfil da empresa:", error);
    alert("Erro ao atualizar o perfil da empresa: " + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && user) {
      try {
        setLoading(true);
        const imageUrl = await uploadImage(
          file,
          user.uid,
          "company_logos"
        );
        setCompanyData((prevData) => ({
          ...prevData,
          logoUrl: imageUrl,
        }));
        alert("Logo da empresa atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao carregar imagem:", error);
        alert("Erro ao carregar o logo da empresa: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const openDocumentModal = (type) => {
    setCurrentDocType(type);
    setShowDocumentModal(true);
  };

  const handleDocumentSave = (docType, docInfo) => {
    setCompanyDocuments((prevDocs) => ({
      ...prevDocs,
      [docType]: docInfo,
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/cadastro', { state: { fromLogout: true } });
      window.location.reload();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao terminar sessão: " + error.message);
    }
  };

  // Loading da autenticação
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  // Usuário não autenticado
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <p className="text-yellow-400 mb-4">Você precisa estar logado para acessar esta página.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Fazer Login
        </button>
      </div>
    );
  }

  // Loading do perfil
  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Carregando perfil da empresa...</p>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#060B0D] min-h-screen text-white">
      <NavbarEmpresa />
      <div className="relative top-20">
        <img src={topoProfile} alt="Background" className="w-full h-48  object-cover" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">

        </div>
      </div>

      <div className="container mx-auto p-6 md:p-8 lg:p-12 mt-[-60px] relative z-10">
        {/* Company Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 bg-gray-800 flex items-center justify-center">
            <img
              src={companyData.logoUrl || defaultCompanyLogo}
              alt="Logo da Empresa"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = defaultCompanyLogo;
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full hover:bg-green-600 transition-colors"
              title="Carregar logo da empresa"
            >
              <Upload className="w-4 h-4 text-black" />
            </button>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome da Empresa *
            </label>
            <input
              type="text"
              name="name"
              value={companyData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-green-500 transition-colors"
              placeholder="Nome da sua empresa"
              required
            />
          </div>

          {/* Business Area */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Área de Negócio *
            </label>
            <select
              name="businessArea"
              value={companyData.businessArea}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-green-500 transition-colors"
              required
            >
              <option value="">Selecione uma área</option>
              {businessAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <input
              type="tel"
              name="phone"
              value={companyData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-green-500 transition-colors"
              placeholder="Ex: +244 9XX XXX XXX"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={companyData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-green-500 transition-colors"
              placeholder="seuemail@empresa.com"
            />
          </div>

          {/* Website */}
         <div>
  <label className="block text-sm font-medium mb-2">Website</label>
  <div className="relative">
    <input
      type="text"
      name="website"
      value={companyData.website}
      onChange={handleInputChange}
      onBlur={() => checkWebsite(companyData.website)} // Verifica quando sai do campo
      className={`w-full px-4 py-3 bg-gray-700 border rounded-md focus:outline-none transition-colors ${
        websiteError 
          ? 'border-red-500 focus:border-red-400' 
          : websiteSuccess
          ? 'border-green-500 focus:border-green-400'
          : 'border-gray-600 focus:border-green-500'
      }`}
      placeholder="www.suaempresa.com"
    />
    
    {/* Ícone de loading */}
    {checkingWebsite && (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}
    
    {/* Ícone de erro */}
    {websiteError && !checkingWebsite && (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <AlertCircle className="w-5 h-5 text-red-500" />
      </div>
    )}
    
    {/* Ícone de sucesso */}
    {websiteSuccess && !checkingWebsite && (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <Check className="w-5 h-5 text-green-500" />
      </div>
    )}
  </div>
  
  {/* Mensagem de erro */}
  {websiteError && (
    <p className="text-sm mt-1 text-red-400">{websiteError}</p>
  )}
  
  {/* Mensagem de sucesso */}
  {websiteSuccess && (
    <p className="text-sm mt-1 text-green-400">{websiteSuccess}</p>
  )}
</div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2">Endereço</label>
            <input
              type="text"
              name="address"
              value={companyData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-green-500 transition-colors"
              placeholder="Rua, Cidade, País"
            />
          </div>

          {/* Number of Employees */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Número de Funcionários
            </label>
            <input
              type="number"
              name="employees"
              value={companyData.employees}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-green-500 transition-colors"
              placeholder="Ex: 50"
              min="0"
            />
          </div>

          {/* About Company */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Sobre a Empresa
            </label>
            <textarea
              name="about"
              value={companyData.about}
              onChange={handleInputChange}
              rows="6"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-green-500 resize-none transition-colors"
              placeholder="Fale um pouco sobre a sua empresa, seus valores, missão e o que a torna única..."
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8 relative">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-10 py-3 bg-green-500 rounded-md text-black font-medium hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loading && (
              <div className="w-4 h-4 mr-2 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? "Salvando..." : "Salvar Perfil"}
          </button>
          
          <button 
            onClick={handleLogout} 
            className="px-8 py-2 bg-red-500 absolute ml-[43rem] bottom-0 rounded-md text-white font-medium hover:bg-red-400 transition-colors"
          >
            Terminar sessão
          </button>
        </div>

        {/* Document Upload Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Documentos da Empresa
          </h3>
          <p className="text-gray-400 mb-6">
            Carregue os documentos necessários para validar sua empresa
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Alvará de Funcionamento */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
              <h4 className="font-medium mb-2 flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Alvará de Funcionamento
              </h4>
              {companyDocuments.license ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-400">Carregado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 truncate">
                      {companyDocuments.license.name}
                    </span>
                    <button
                      onClick={() =>
                        window.open(companyDocuments.license.url, "_blank")
                      }
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Visualizar documento"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openDocumentModal("license")}
                  className="w-full py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Alvará
                </button>
              )}
            </div>

            {/* NIF */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
              <h4 className="font-medium mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                NIF
              </h4>
              {companyDocuments.nif ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-400">Carregado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 truncate">
                      {companyDocuments.nif.name}
                    </span>
                    <button
                      onClick={() => window.open(companyDocuments.nif.url, "_blank")}
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Visualizar documento"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openDocumentModal("nif")}
                  className="w-full py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar NIF
                </button>
              )}
            </div>

            {/* Certificado */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
              <h4 className="font-medium mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Certificado de Constituição
              </h4>
              {companyDocuments.certificate ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-400">Carregado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 truncate">
                      {companyDocuments.certificate.name}
                    </span>
                    <button
                      onClick={() =>
                        window.open(companyDocuments.certificate.url, "_blank")
                      }
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Visualizar documento"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openDocumentModal("certificate")}
                  className="w-full py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Certificado
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <CompanyDocumentModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onSave={handleDocumentSave}
        docType={currentDocType}
      />

    </div>
  );
};

export default ProfileEmpresa;