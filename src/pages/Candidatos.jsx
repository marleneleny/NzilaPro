import React, { useState, useEffect } from "react";
import { 
  ArrowLeft,
  Eye,
  Check,
  X,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Globe,
  Download,
  MessageCircle,
  Star,
  User,
  AlertCircle,
  Search,
  Filter,
  RefreshCw
} from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

// Modal para visualizar PDF
const CVViewerModal = ({ cvUrl, fileName, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(false);
    }
  }, [isOpen, cvUrl]);

  if (!isOpen) return null;

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {fileName || 'Currículo'}
          </h3>
          <div className="flex items-center space-x-2">
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <ExternalLink size={16} />
                <span>Abrir em nova aba</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando currículo...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar CV</h4>
                <p className="text-gray-600 mb-4">Não foi possível exibir o currículo.</p>
                {cvUrl && (
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <ExternalLink size={16} />
                    <span>Abrir em nova aba</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {cvUrl && !error && (
            <iframe
              src={`${cvUrl}#toolbar=1`}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleError}
              title="Visualizador de CV"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Modal de detalhes do candidato
const CandidateDetailModal = ({ candidate, isOpen, onClose }) => {
  const [isCVViewerOpen, setIsCVViewerOpen] = useState(false);

  if (!isOpen || !candidate) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  // Função para obter dados do CV seguindo a lógica do Profile.jsx
  const getCVData = () => {
    // Primeiro verifica se existe cvData (estrutura principal)
    if (candidate.cvData) {
      console.log("CV Data encontrado:", candidate.cvData);
      return {
        fileName: candidate.cvData.fileName || candidate.cvData.name || 'Currículo.pdf',
        url: candidate.cvData.url,
        uploadDate: candidate.cvData.uploadDate,
        fileSize: candidate.cvData.fileSize || candidate.cvData.size,
        fileType: candidate.cvData.fileType || candidate.cvData.type,
        publicId: candidate.cvData.publicId,
        area: candidate.cvData.area,
        focus: candidate.cvData.focus
      };
    }
    
    // Fallback para estrutura alternativa (se houver)
    if (candidate.cv) {
      console.log("CV alternativo encontrado:", candidate.cv);
      return {
        fileName: candidate.cv.fileName || candidate.cv.name || 'Currículo.pdf',
        url: candidate.cv.url,
        uploadDate: candidate.cv.uploadDate,
        fileSize: candidate.cv.fileSize || candidate.cv.size,
        fileType: candidate.cv.fileType || candidate.cv.type,
        publicId: candidate.cv.publicId,
        area: candidate.cv.area,
        focus: candidate.cv.focus
      };
    }

    console.log("Nenhum CV encontrado para o candidato:", candidate.id);
    return null;
  };

  const cvData = getCVData();

  const handleViewCV = () => {
    if (cvData?.url) {
      console.log("Abrindo CV:", cvData.url);
      setIsCVViewerOpen(true);
    } else {
      console.log("URL do CV não encontrada:", cvData);
      alert('URL do currículo não encontrada');
    }
  };

  const handleDownloadCV = async () => {
    if (cvData?.url) {
      try {
        console.log("Iniciando download do CV:", cvData.fileName);
        const response = await fetch(cvData.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cvData.fileName || 'curriculo.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log("Download concluído");
      } catch (error) {
        console.error('Erro ao baixar CV:', error);
        alert('Erro ao baixar currículo. Tente visualizar online.');
      }
    } else {
      console.log("URL do CV não encontrada para download:", cvData);
      alert('URL do currículo não encontrada para download');
    }
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Tamanho não disponível';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {candidate.fullName ? candidate.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 
                   candidate.name ? candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'N/A'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{candidate.fullName || candidate.name || 'Nome não disponível'}</h2>
                  <p className="text-blue-100">{candidate.area || 'Área não especificada'}</p>
                  <p className="text-blue-200 text-sm">{candidate.specialization || 'Especialização não especificada'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sobre */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {candidate.about || 'Informações sobre o candidato não disponíveis.'}
                  </p>
                </div>

                {/* Currículo */}
                {cvData ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Currículo</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-red-600" size={24} />
                          <div>
                            <p className="font-medium text-gray-900">
                              {cvData.fileName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {cvData.uploadDate ? 
                                `Enviado em ${formatDate(cvData.uploadDate)}` : 
                                'Data de envio não disponível'
                              }
                            </p>
                            {cvData.fileSize && (
                              <p className="text-xs text-gray-500">
                                Tamanho: {formatFileSize(cvData.fileSize)}
                              </p>
                            )}
                            {cvData.fileType && (
                              <p className="text-xs text-gray-500">
                                Tipo: {cvData.fileType}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleViewCV}
                            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Eye size={16} />
                            <span>Visualizar</span>
                          </button>
                          <button
                            onClick={handleDownloadCV}
                            className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <Download size={16} />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Informações adicionais do CV */}
                      {(cvData.area || cvData.focus) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <strong>Informações extraídas do CV:</strong>
                          </p>
                          {cvData.area && (
                            <p className="text-sm text-gray-600">
                              • Área: {cvData.area}
                            </p>
                          )}
                          {cvData.focus && (
                            <p className="text-sm text-gray-600">
                              • Foco: {cvData.focus}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Currículo</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="text-yellow-600" size={24} />
                        <div>
                          <p className="font-medium text-yellow-800">Currículo não disponível</p>
                          <p className="text-sm text-yellow-700">
                            Este candidato ainda não enviou seu currículo.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Portfólio */}
                {(candidate.portifolio || candidate.portfolio) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Portfólio</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Globe className="text-blue-600" size={24} />
                          <div>
                            <p className="font-medium text-gray-900">Site/Portfólio Online</p>
                            <p className="text-blue-600 text-sm">{candidate.portifolio || candidate.portfolio}</p>
                          </div>
                        </div>
                        <a
                          href={candidate.portifolio || candidate.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <ExternalLink size={16} />
                          <span>Visitar</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar com informações */}
              <div className="space-y-6">
                {/* Informações de contato */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Informações de Contato</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="text-gray-500" size={18} />
                      <span className="text-sm text-gray-700">{candidate.email || 'Email não disponível'}</span>
                    </div>
                    {candidate.contact && (
                      <div className="flex items-center space-x-3">
                        <Phone className="text-gray-500" size={18} />
                        <span className="text-sm text-gray-700">{candidate.contact}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <MapPin className="text-gray-500" size={18} />
                      <span className="text-sm text-gray-700">Luanda, Angola</span>
                    </div>
                  </div>
                </div>

                {/* Dados profissionais */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Dados Profissionais</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Área</p>
                      <p className="text-sm text-gray-700 font-medium">{candidate.area || 'Não especificada'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Especialização</p>
                      <p className="text-sm text-gray-700 font-medium">{candidate.specialization || 'Não especificada'}</p>
                    </div>

                  </div>
                </div>

                {/* Status do candidato */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CV:</span>
                      <span className={`text-sm font-medium ${cvData ? 'text-green-600' : 'text-red-600'}`}>
                        {cvData ? 'Enviado' : 'Pendente'}
                      </span>
                    </div>
                   
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Teste em Vídeo:</span>
                      <span className={`text-sm font-medium ${candidate.videoTestCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                        {candidate.videoTestCompleted ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="space-y-2">
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do visualizador de CV */}
      <CVViewerModal
        cvUrl={cvData?.url}
        fileName={cvData?.fileName}
        isOpen={isCVViewerOpen}
        onClose={() => setIsCVViewerOpen(false)}
      />
    </>
  );
};

const Candidatos = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [filteredCandidatos, setFilteredCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // Função para verificar se o candidato tem CV (seguindo a lógica do Profile.jsx)
  const hasCVData = (candidate) => {
    return !!(candidate.cvData?.url || candidate.cv?.url);
  };

  // Função para filtrar candidatos em tempo real
  const filterCandidatos = (searchTerm, statusFilter, candidatos) => {
    let filtered = candidatos;

    // Filtro por termo de pesquisa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(candidate => {
        const displayName = (candidate.fullName || candidate.name || '').toLowerCase();
        const email = (candidate.email || '').toLowerCase();
        const area = (candidate.area || '').toLowerCase();
        const specialization = (candidate.specialization || '').toLowerCase();
        const about = (candidate.about || '').toLowerCase();

        return displayName.includes(searchLower) ||
               email.includes(searchLower) ||
               area.includes(searchLower) ||
               specialization.includes(searchLower) ||
               about.includes(searchLower);
      });
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => {
        const status = candidate.applicationStatus || 'pendente';
        return status === statusFilter;
      });
    }

    return filtered;
  };

  // Atualizar lista filtrada quando mudarem os filtros ou candidatos
  useEffect(() => {
    const filtered = filterCandidatos(searchTerm, statusFilter, candidatos);
    setFilteredCandidatos(filtered);
  }, [searchTerm, statusFilter, candidatos]);

  // Buscar candidatos do Firestore
  useEffect(() => {
    const fetchCandidatos = async () => {
      try {
        setLoading(true);
        console.log("Iniciando busca de candidatos...");
        
        // Query para buscar usuários com accountType = 'Profissional'
        const q = query(
          collection(db, "users"), 
          where("accountType", "==", "Profissional")
        );
        
        const querySnapshot = await getDocs(q);
        console.log("Documentos encontrados:", querySnapshot.size);
        
        const candidatosData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Documento encontrado:", doc.id, {
            nome: data.fullName || data.name,
            cvData: !!data.cvData,
            cvUrl: data.cvData?.url || 'não encontrada'
          });
          
          candidatosData.push({
            id: doc.id,
            ...data
          });
        });
        
        console.log("Total de candidatos processados:", candidatosData.length);
        setCandidatos(candidatosData);
      } catch (error) {
        console.error("Erro ao buscar candidatos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidatos();
  }, []);

  const handleViewDetails = (candidate) => {
    console.log("Visualizando detalhes do candidato:", {
      id: candidate.id,
      nome: candidate.fullName || candidate.name,
      cvData: candidate.cvData,
      temCV: hasCVData(candidate)
    });
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      const candidateRef = doc(db, "users", candidateId);
      await updateDoc(candidateRef, {
        applicationStatus: newStatus,
        statusUpdatedAt: new Date().toISOString()
      });
      
      // Atualizar lista local
      setCandidatos(prev => 
        prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, applicationStatus: newStatus }
            : candidate
        )
      );
      
      console.log(`Status do candidato ${candidateId} atualizado para: ${newStatus}`);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status. Tente novamente.");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendente': { color: 'bg-yellow-500', text: 'Pendente' },
      'aceito': { color: 'bg-green-500', text: 'Aceito' },
      'rejeitado': { color: 'bg-red-500', text: 'Rejeitado' }
    };
    
    const config = statusConfig[status] || statusConfig['pendente'];
    
    return (
      <span className={`${config.color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-6"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Candidatos</h1>
            <p className="text-gray-400">Profissionais disponíveis para oportunidades</p>
          </div>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barra de pesquisa */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome, email, área ou especialização..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              >
                <option value="all">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="aceito">Aceito</option>
                <option value="rejeitado">Rejeitado</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Botão limpar filtros */}
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de candidatos */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              Lista de Candidatos ({filteredCandidatos.length})
            </h2>
            <p className="text-sm text-gray-400">
              Mostrando {filteredCandidatos.length} de {candidatos.length} candidatos
            </p>
          </div>

          {filteredCandidatos.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                {candidatos.length === 0 ? 'Nenhum candidato encontrado' : 'Nenhum resultado para os filtros aplicados'}
              </h3>
              <p className="text-gray-500">
                {candidatos.length === 0 
                  ? 'Ainda não há profissionais cadastrados no sistema.' 
                  : 'Tente ajustar sua pesquisa ou filtros.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidatos.map((candidate) => {
                const displayName = candidate.fullName || candidate.name || candidate.displayName;
                const initials = displayName 
                  ? displayName.split(' ').map(n => n[0]).join('').slice(0, 2)
                  : candidate.email?.slice(0, 2).toUpperCase() || 'N/A';
                
                const temCV = hasCVData(candidate);
                
                return (
                  <div key={candidate.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      {/* Info do candidato */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {displayName || 'Nome não disponível'}
                          </h3>
                          <p className="text-gray-300">{candidate.email}</p>
                          <p className="text-blue-400 text-sm">
                            {candidate.area || 'Área não especificada'} 
                            {candidate.specialization && ` • ${candidate.specialization}`}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {candidate.about?.slice(0, 80) || 'Descrição não disponível'}
                            {candidate.about?.length > 80 && '...'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
                            <div className="flex items-center space-x-1">
                              <MapPin size={14} />
                              <span>Luanda, Angola</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Briefcase size={14} />
                              <span>{candidate.area || 'Tecnologia'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>Registrado em {formatDate(candidate.createdAt)}</span>
                            </div>
                            {/* Indicador de CV */}
                            <div className="flex items-center space-x-1">
                              <FileText size={14} />
                              <span className={candidate.cvData || candidate.cv ? 'text-green-400' : 'text-red-400'}>
                                {candidate.cvData || candidate.cv ? 'CV Enviado' : 'CV Pendente'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(candidate.applicationStatus || 'pendente')}
                        
                        <button
                          onClick={() => handleViewDetails(candidate)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                        >
                          <Eye size={16} />
                          <span>Detalhes</span>
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(candidate.id, 'aceito')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                        >
                          <Check size={16} />
                          <span>Aceitar</span>
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(candidate.id, 'rejeitado')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                        >
                          <X size={16} />
                          <span>Rejeitar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalhes */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default Candidatos;