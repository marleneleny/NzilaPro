import React, { useState } from 'react';
import { MapPin, Building, Clock, DollarSign, Users, FileText, CheckCircle, X } from 'lucide-react';

export default function publicarV() {
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    employmentType: '',
    workMode: '',
    salary: '',
    salaryType: '',
    experience: '',
    education: '',
    skills: [],
    description: '',
    requirements: '',
    benefits: '',
    applicationDeadline: '',
    positions: 1
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [step, setStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados da vaga:', formData);
    // Aqui você processaria os dados da vaga
    alert('Vaga publicada com sucesso!');
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="bg-black border border-[#525252] rounded-xl p-8">
              <h2 className="font-poppins font-semibold text-xl mb-6 flex items-center">
                <Building className="mr-3 text-[#BFF205]" />
                Informações Básicas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Título da Vaga *</label>
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
                  <label className="block text-sm font-medium mb-2">Empresa *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Nome da sua empresa"
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Localização *</label>
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
                  <label className="block text-sm font-medium mb-2">Número de Vagas</label>
                  <input
                    type="number"
                    name="positions"
                    value={formData.positions}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Emprego *</label>
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
                  <label className="block text-sm font-medium mb-2">Modalidade de Trabalho</label>
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

                <div>
                  <label className="block text-sm font-medium mb-2">Salário</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="Ex: 150.000 - 200.000"
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

                <div>
                  <label className="block text-sm font-medium mb-2">Prazo para Candidatura</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                  />
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
                  <label className="block text-sm font-medium mb-2">Experiência Necessária</label>
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
                  <label className="block text-sm font-medium mb-2">Escolaridade Mínima</label>
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
                <label className="block text-sm font-medium mb-2">Habilidades Necessárias</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Digite uma habilidade"
                    className="flex-1 bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-[#BFF205] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#a8d405] transition-colors"
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Requisitos Específicos</label>
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
                  <label className="block text-sm font-medium mb-2">Descrição da Vaga *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva as responsabilidades, objetivos e contexto da vaga..."
                    rows="6"
                    className="w-full bg-[#1A1A1A] border border-[#4C4C4C] rounded-lg px-4 py-3 focus:border-[#BFF205] focus:outline-none resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Benefícios Oferecidos</label>
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
              disabled={step === 1}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                step === 1 
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
                className="bg-[#BFF205] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#a8d405] transition-colors"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="bg-[#BFF205] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#a8d405] transition-colors flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Publicar Vaga
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}