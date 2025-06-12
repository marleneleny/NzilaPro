import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building, Clock, DollarSign, Users, FileText, CheckCircle, X } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';

export default function PublicarV() {
  const { User, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    employmentType: '',
    workMode: '',
    salary: '',
    salaryType: 'AOA',
    experience: '',
    education: '',
    skills: [],
    description: '',
    requirements: '',
    benefits: '',
    positions: 1
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ message: '', color: '' });
  const [success, setSuccess] = useState({ message: '', color: '' });

  // Verificar autenticação e tipo de conta
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (!loading && isAuthenticated && User) {
      const accountType = User.accountType?.trim().toLowerCase();
      
      if (accountType !== 'empresa') {
        navigate('/home', { replace: true });
        return;
      }

      // Auto-preencher dados da empresa se disponível
      if (User.fullName && !formData.company) {
        setFormData(prev => ({
          ...prev,
          company: User.fullName
        }));
      }
    }
  }, [isAuthenticated, User, loading, navigate, formData.company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erros quando o usuário começar a digitar
    if (error.message) {
      setError({ message: '', color: '' });
    }
  };

  const addSkill = () => {
    const skillTrimmed = currentSkill.trim();
    
    if (!skillTrimmed) {
      setError({
        message: 'Digite uma habilidade válida.',
        color: 'text-red-500'
      });
      return;
    }

    if (formData.skills.includes(skillTrimmed)) {
      setError({
        message: 'Esta habilidade já foi adicionada.',
        color: 'text-yellow-500'
      });
      return;
    }

    if (formData.skills.length >= 10) {
      setError({
        message: 'Máximo de 10 habilidades permitidas.',
        color: 'text-yellow-500'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skillTrimmed]
    }));
    setCurrentSkill('');
    setError({ message: '', color: '' });
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        const step1Required = ['jobTitle', 'company', 'location', 'employmentType'];
        const missing1 = step1Required.filter(field => !formData[field]);
        
        if (missing1.length > 0) {
          setError({
            message: 'Por favor, preencha todos os campos obrigatórios.',
            color: 'text-red-500'
          });
          return false;
        }

        if (formData.positions < 1) {
          setError({
            message: 'O número de vagas deve ser pelo menos 1.',
            color: 'text-red-500'
          });
          return false;
        }
        break;

      case 2:
        // Validação opcional para step 2
        if (formData.skills.length === 0) {
          setError({
            message: 'Adicione pelo menos uma habilidade necessária.',
            color: 'text-yellow-500'
          });
          return false;
        }
        break;

      case 3:
        if (!formData.description.trim()) {
          setError({
            message: 'A descrição da vaga é obrigatória.',
            color: 'text-red-500'
          });
          return false;
        }

        if (formData.description.trim().length < 50) {
          setError({
            message: 'A descrição deve ter pelo menos 50 caracteres.',
            color: 'text-red-500'
          });
          return false;
        }
        break;

      default:
        return true;
    }

    setError({ message: '', color: '' });
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setError({ message: '', color: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);
    setError({ message: '', color: '' });
    setSuccess({ message: '', color: '' });

    try {
      // Validação final antes de enviar
      if (!User?.id) {
        throw new Error('Usuário não autenticado');
      }

      const dataToStore = {
        ...formData,
        // Dados do usuário/empresa
        companyId: User.id,
        companyEmail: User.email,
        // Timestamp
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Status da vaga
        status: 'active',
        // Processamento de dados
        salary: formData.salary ? formData.salary.trim() : '',
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        benefits: formData.benefits.trim(),
        positions: parseInt(formData.positions) || 1
      };

      await addDoc(collection(db, 'VagasPublicadas'), dataToStore);

      setSuccess({
        message: 'Vaga publicada com sucesso!',
        color: 'text-green-500'
      });

      // Reset form após 2 segundos
      setTimeout(() => {
        setFormData({
          jobTitle: '',
          company: User.fullName || '',
          location: '',
          employmentType: '',
          workMode: '',
          salary: '',
          salaryType: 'AOA',
          experience: '',
          education: '',
          skills: [],
          description: '',
          requirements: '',
          benefits: '',
          positions: 1
        });
        setStep(1);
        setSuccess({ message: '', color: '' });
      }, 2000);

    } catch (err) {
      console.error("Erro ao publicar vaga:", err);
      
      if (err.code === 'permission-denied') {
        setError({
          message: 'Você não tem permissão para publicar vagas.',
          color: 'text-red-500'
        });
      } else if (err.code === 'network-request-failed') {
        setError({
          message: 'Erro de conexão. Verifique sua internet.',
          color: 'text-red-500'
        });
      } else if (err.message === 'Usuário não autenticado') {
        setError({
          message: 'Sessão expirada. Faça login novamente.',
          color: 'text-red-500'
        });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError({
          message: 'Erro ao publicar vaga. Tente novamente.',
          color: 'text-red-500'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060B0D]">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#060B0D] text-white">
      {/* Header */}
      <div className="border-b border-[#4C4C4C] bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="font-poppins font-bold text-2xl">
            Publicar Nova <span className="text-[#BFF205]">Vaga</span>
          </h1>
          <p className="text-[#D7D7D7]/70 mt-2">
            Encontre os melhores talentos para sua empresa
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= num ? 'bg-[#BFF205] text-black' : 'bg-[#4C4C4C] text-white'
              }`}>
                {num}
              </div>
              {num < 3 && (
                <div className={`w-20 h-1 ${
                  step > num ? 'bg-[#BFF205]' : 'bg-[#4C4C4C]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error/Success Messages */}
        {error.message && (
          <div className={`${error.color} bg-red-900/20 border border-red-500/30 p-3 rounded-lg mb-4`}>
            {error.message}
          </div>
        )}
        {success.message && (
          <div className={`${success.color} bg-green-900/20 border border-green-500/30 p-3 rounded-lg mb-4`}>
            {success.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="bg-black border border-[#525252] rounded-xl p-8">
              <h2 className="font-poppins font-semibold text-xl mb-6 flex items-center">
                <Building className="mr-3 text-[#BFF205]" />
                Informações Básicas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título da Vaga *
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="Ex: Desenvolvedor Full Stack"
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Ex: Minha Empresa Ltda."
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Localização *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ex: Luanda, Angola"
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Número de Vagas
                  </label>
                  <input
                    type="number"
                    name="positions"
                    value={formData.positions}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de Emprego *
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="full-time">Tempo Integral</option>
                    <option value="part-time">Meio Período</option>
                    <option value="contract">Contrato</option>
                    <option value="internship">Estágio</option>
                    <option value="freelance">Freelancer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Modalidade de Trabalho
                  </label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleInputChange}
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="presencial">Presencial</option>
                    <option value="remoto">Remoto</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Salário
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="Ex: 150.000 - 200.000 ou A combinar"
                      className="flex-1 bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                    />
                    <select
                      name="salaryType"
                      value={formData.salaryType}
                      onChange={handleInputChange}
                      className="bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                    >
                      <option value="AOA">AOA</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-black border border-[#525252] rounded-xl p-8">
              <h2 className="font-poppins font-semibold text-xl mb-6 flex items-center">
                <Users className="mr-3 text-[#BFF205]" />
                Requisitos e Qualificações
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Experiência Necessária
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="entry">Iniciante (0-1 anos)</option>
                    <option value="junior">Júnior (1-3 anos)</option>
                    <option value="mid">Pleno (3-5 anos)</option>
                    <option value="senior">Sênior (5+ anos)</option>
                    <option value="lead">Liderança (7+ anos)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Escolaridade Mínima
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="ensino-medio">Ensino Médio</option>
                    <option value="tecnico">Técnico</option>
                    <option value="superior">Ensino Superior</option>
                    <option value="pos-graduacao">Pós-graduação</option>
                    <option value="mestrado">Mestrado</option>
                    <option value="doutorado">Doutorado</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Habilidades Necessárias *
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Digite uma habilidade"
                    className="flex-1 bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    disabled={!currentSkill.trim()}
                    className="bg-[#BFF205] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#a8d405] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#4C4C4C] px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                {formData.skills.length === 0 && (
                  <p className="text-[#D7D7D7]/50 text-sm mt-2">
                    Adicione pelo menos uma habilidade
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Requisitos Específicos
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="Descreva os requisitos específicos para a vaga..."
                  rows="4"
                  className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-black border border-[#525252] rounded-xl p-8">
              <h2 className="font-poppins font-semibold text-xl mb-6 flex items-center">
                <FileText className="mr-3 text-[#BFF205]" />
                Descrição e Benefícios
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrição da Vaga *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva as responsabilidades, objetivos e contexto da vaga..."
                    rows="6"
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none resize-none"
                    required
                  />
                  <div className="text-right text-sm text-[#D7D7D7]/50 mt-1">
                    {formData.description.length}/1000 caracteres
                    {formData.description.length < 50 && formData.description.length > 0 && (
                      <span className="text-yellow-500 ml-2">
                        (mínimo 50 caracteres)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Benefícios Oferecidos
                  </label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    placeholder="Liste os benefícios como seguro saúde, vale alimentação, etc..."
                    rows="4"
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || isLoading}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                step === 1 || isLoading
                  ? 'bg-[#4C4C4C] text-gray-400 cursor-not-allowed'
                  : 'bg-[#4C4C4C] text-white hover:bg-[#5C5C5C]'
              }`}
            >
              Anterior
            </button>

            <div className="text-center">
              <span className="text-[#D7D7D7]/70">
                Etapa {step} de 3
              </span>
            </div>

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={isLoading}
                className="bg-[#BFF205] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#a8d405] transition-colors disabled:opacity-50"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#BFF205] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#a8d405] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publicando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Publicar Vaga
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}