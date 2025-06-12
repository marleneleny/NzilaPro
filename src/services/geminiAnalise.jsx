// services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiAnalysisService {
  constructor() {
    // Configurar API Key - deve ser definida nas variáveis de ambiente
    this.apiKey = process.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!this.apiKey) {
      console.error('❌ API Key do Gemini não encontrada. Configure REACT_APP_GEMINI_API_KEY ou VITE_GEMINI_API_KEY');
    }
    
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" }) : null;
  }

  // Verificar se o serviço está configurado corretamente
  isConfigured() {
    return !!(this.apiKey && this.genAI && this.model);
  }

  // Preparar dados da entrevista para análise
  prepareInterviewDataForAnalysis(interviewData, responsesData) {
    try {
      console.log('📋 Preparando dados para análise...');
      
      const { interview } = interviewData;
      const responses = responsesData[0] || {};
      
      const analysisData = {
        candidate: {
          name: interview.userName || 'Candidato',
          email: interview.userEmail || '',
          specialization: interview.userSpecialization || '',
          accountType: interview.userAccountType || '',
          contact: interview.userContact || '',
          about: interview.userAbout || ''
        },
        interview: {
          id: interview.id,
          totalQuestions: interview.totalQuestions || 0,
          completedQuestions: interview.completedQuestions || 0,
          duration: interview.duration || 0,
          status: interview.status || '',
          startTime: interview.startTime,
          endTime: interview.endTime
        },
        responses: {
          questions: responses.questions || [],
          answers: responses.responses || [],
          behaviorData: responses.behaviorData || [],
          cvContent: responses.cvContent || null
        },
        metadata: responses.analysisMetadata || {}
      };

      console.log('✅ Dados preparados para análise');
      return analysisData;
      
    } catch (error) {
      console.error('❌ Erro ao preparar dados:', error);
      throw new Error('Erro ao preparar dados para análise');
    }
  }

  // Criar prompt estruturado para análise
  createAnalysisPrompt(analysisData) {
    const { candidate, interview, responses, metadata } = analysisData;
    
    return `
# ANÁLISE COMPLETA DE ENTREVISTA

## DADOS DO CANDIDATO
- Nome: ${candidate.name}
- Especialização: ${candidate.specialization}
- Tipo de Conta: ${candidate.accountType}
- Sobre: ${candidate.about}

## DADOS DA ENTREVISTA
- ID: ${interview.id}
- Total de Perguntas: ${interview.totalQuestions}
- Perguntas Respondidas: ${interview.completedQuestions}
- Duração: ${interview.duration} segundos
- Status: ${interview.status}

## PERGUNTAS E RESPOSTAS
${responses.questions.map((question, index) => `
**Pergunta ${index + 1}:** ${question.text || question}
**Resposta:** ${responses.answers[index]?.text || responses.answers[index] || 'Não respondida'}
`).join('\n')}

## DADOS COMPORTAMENTAIS
- Pontos de Dados Comportamentais: ${metadata.totalBehaviorDataPoints || 0}
- Engajamento Médio: ${metadata.avgEngagement || 0}%
- Contato Visual Médio: ${metadata.avgEyeContact || 0}%
- Expressões Dominantes: ${JSON.stringify(metadata.dominantExpressions || {})}

## ANÁLISE SOLICITADA
Por favor, forneça uma análise completa e estruturada desta entrevista incluindo:

### 1. RESUMO EXECUTIVO
- Avaliação geral do candidato
- Principais pontos fortes
- Principais áreas de melhoria
- Recomendação final (Recomendado/Parcialmente Recomendado/Não Recomendado)

### 2. ANÁLISE TÉCNICA
- Qualidade das respostas técnicas
- Conhecimento demonstrado na área de especialização
- Capacidade de comunicação técnica

### 3. ANÁLISE COMPORTAMENTAL
- Engajamento durante a entrevista
- Linguagem corporal e contato visual
- Confiança e apresentação pessoal
- Consistência nas respostas

### 4. COMPETÊNCIAS AVALIADAS
Para cada competência, forneça uma nota de 1-10 e justificativa:
- Conhecimento Técnico
- Comunicação
- Resolução de Problemas
- Adaptabilidade
- Trabalho em Equipe
- Liderança (se aplicável)

### 5. FEEDBACK DETALHADO
- Análise pergunta por pergunta
- Pontos específicos de cada resposta
- Sugestões de melhoria

### 6. COMPARAÇÃO COM PERFIL DESEJADO
- Alinhamento com a vaga/área de especialização
- Gaps identificados
- Potencial de desenvolvimento

### 7. PRÓXIMOS PASSOS
- Recomendações específicas
- Áreas para aprofundar em próximas etapas
- Sugestões de desenvolvimento

Por favor, formate a resposta em JSON estruturado para facilitar o processamento e exibição dos resultados.
    `;
  }

  // Analisar entrevista usando Gemini
  async analyzeInterview(interviewData, responsesData) {
    try {
      console.log('🤖 Iniciando análise com Gemini...');
      
      if (!this.isConfigured()) {
        throw new Error('Serviço Gemini não está configurado. Verifique a API Key.');
      }

      // Preparar dados
      const analysisData = this.prepareInterviewDataForAnalysis(interviewData, responsesData);
      
      // Criar prompt
      const prompt = this.createAnalysisPrompt(analysisData);
      
      console.log('📤 Enviando dados para análise...');
      
      // Realizar análise
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      console.log('✅ Análise concluída com sucesso');
      
      // Tentar parsear como JSON, se falhar, retornar como texto
      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(analysisText);
      } catch (parseError) {
        console.warn('⚠️ Resposta não está em JSON, retornando como texto estruturado');
        parsedAnalysis = {
          rawAnalysis: analysisText,
          type: 'text',
          generatedAt: new Date().toISOString()
        };
      }

      // Adicionar metadados
      const finalAnalysis = {
        ...parsedAnalysis,
        metadata: {
          interviewId: interviewData.interview.id,
          candidateName: analysisData.candidate.name,
          analyzedAt: new Date().toISOString(),
          totalQuestions: analysisData.interview.totalQuestions,
          completedQuestions: analysisData.interview.completedQuestions,
          interviewDuration: analysisData.interview.duration,
          behaviorDataPoints: analysisData.metadata.totalBehaviorDataPoints || 0,
          avgEngagement: analysisData.metadata.avgEngagement || 0,
          avgEyeContact: analysisData.metadata.avgEyeContact || 0
        }
      };

      return {
        success: true,
        analysis: finalAnalysis,
        message: 'Análise realizada com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro na análise com Gemini:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao analisar entrevista'
      };
    }
  }

  // Análise simplificada para casos de erro ou fallback
  createFallbackAnalysis(interviewData, responsesData) {
    const { interview } = interviewData;
    const responses = responsesData[0] || {};
    
    const completionRate = interview.totalQuestions > 0 
      ? Math.round((interview.completedQuestions / interview.totalQuestions) * 100) 
      : 0;
    
    const durationMinutes = Math.round(interview.duration / 60);
    
    return {
      type: 'fallback',
      summary: {
        candidateName: interview.userName,
        completionRate: completionRate,
        duration: durationMinutes,
        totalQuestions: interview.totalQuestions,
        status: interview.status
      },
      basicMetrics: {
        avgEngagement: responses.analysisMetadata?.avgEngagement || 0,
        avgEyeContact: responses.analysisMetadata?.avgEyeContact || 0,
        behaviorDataPoints: responses.analysisMetadata?.totalBehaviorDataPoints || 0
      },
      recommendation: completionRate >= 80 ? 'Entrevista concluída com sucesso' : 'Entrevista incompleta',
      message: 'Análise básica gerada (serviço de IA indisponível)',
      generatedAt: new Date().toISOString()
    };
  }

  // Analisar com fallback
  async analyzeInterviewWithFallback(interviewData, responsesData) {
    try {
      // Tentar análise completa com Gemini
      const result = await this.analyzeInterview(interviewData, responsesData);
      
      if (result.success) {
        return result;
      }
      
      // Se falhar, usar análise básica
      console.log('🔄 Usando análise básica como fallback...');
      const fallbackAnalysis = this.createFallbackAnalysis(interviewData, responsesData);
      
      return {
        success: true,
        analysis: fallbackAnalysis,
        message: 'Análise básica gerada (serviço de IA indisponível)',
        fallback: true
      };
      
    } catch (error) {
      console.error('❌ Erro em análise com fallback:', error);
      
      // Último recurso - análise muito básica
      const emergencyAnalysis = {
        type: 'emergency',
        message: 'Erro na análise. Dados básicos da entrevista disponíveis.',
        basicData: {
          interviewId: interviewData.interview.id,
          candidateName: interviewData.interview.userName,
          status: interviewData.interview.status,
          totalQuestions: interviewData.interview.totalQuestions,
          completedQuestions: interviewData.interview.completedQuestions
        },
        error: error.message,
        generatedAt: new Date().toISOString()
      };
      
      return {
        success: false,
        analysis: emergencyAnalysis,
        message: 'Erro na análise da entrevista',
        error: error.message
      };
    }
  }

  // Gerar relatório em PDF (preparar dados)
  preparePDFData(analysis) {
    return {
      title: `Relatório de Análise - ${analysis.metadata?.candidateName || 'Candidato'}`,
      date: new Date().toLocaleDateString('pt-BR'),
      analysis: analysis,
      sections: [
        'Resumo Executivo',
        'Análise Técnica',
        'Análise Comportamental',
        'Competências Avaliadas',
        'Feedback Detalhado',
        'Recomendações'
      ]
    };
  }

  // Validar dados antes da análise
  validateAnalysisData(interviewData, responsesData) {
    const errors = [];
    
    if (!interviewData || !interviewData.interview) {
      errors.push('Dados da entrevista não encontrados');
    }
    
    if (!responsesData || !Array.isArray(responsesData) || responsesData.length === 0) {
      errors.push('Dados de respostas não encontrados');
    }
    
    if (interviewData && interviewData.interview && interviewData.interview.completedQuestions === 0) {
      errors.push('Nenhuma pergunta foi respondida');
    }
    
    return errors;
  }
}

// Exportar instância única
export default new GeminiAnalysisService();