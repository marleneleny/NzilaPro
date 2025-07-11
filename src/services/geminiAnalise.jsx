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

  async analyzeInterviewPerformance(interviewData) {
    if (!this.genAI) {
      throw new Error('Gemini API não configurada. Configure REACT_APP_GEMINI_API_KEY no seu .env');
    }

    try {
      console.log('🤖 Iniciando análise com Gemini...');
      
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const analysisPrompt = this.buildAnalysisPrompt(interviewData);
      
      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const analysisText = response.text();
      
      // Parse da resposta estruturada
      const analysis = this.parseGeminiResponse(analysisText);
      
      console.log('✅ Análise do Gemini concluída');
      return {
        success: true,
        analysis: analysis,
        rawResponse: analysisText
      };
      
    } catch (error) {
      console.error('❌ Erro na análise do Gemini:', error);
      return {
        success: false,
        error: error.message,
        analysis: this.getFallbackAnalysis()
      };
    }
  }

  buildAnalysisPrompt(interviewData) {
    const { interview, responses } = interviewData;
    
    // Extrair dados das respostas
    const responsesData = responses.map(responseDoc => ({
      questions: responseDoc.questions || [],
      responses: responseDoc.responses || [],
      behaviorData: responseDoc.behaviorData || {},
      analysisMetadata: responseDoc.analysisMetadata || {}
    }));

    // Construir dados consolidados
    const allQuestions = responsesData.flatMap(r => r.questions);
    const allResponses = responsesData.flatMap(r => r.responses);
    const behaviorMetrics = responsesData.map(r => r.analysisMetadata).filter(m => m);

    const prompt = `
Você é um especialista em análise de entrevistas de emprego e avaliação comportamental com foco em metodologias de RH modernas.
Analise os seguintes dados de uma entrevista e forneça uma avaliação detalhada baseada em critérios profissionais de recrutamento.

DADOS DA ENTREVISTA:
- Candidato: ${interview.userName}
- Especialização: ${interview.userSpecialization}
- Total de Perguntas: ${interview.totalQuestions}
- Perguntas Respondidas: ${interview.completedQuestions}
- Duração: ${interview.duration} segundos
- Status: ${interview.status}

PERGUNTAS E RESPOSTAS:
${allQuestions.map((q, i) => `
Pergunta ${i + 1}: ${q.text || q.question || 'Pergunta não especificada'}
Resposta: ${allResponses[i]?.transcription || 'Sem resposta gravada'}
`).join('\n')}

DADOS COMPORTAMENTAIS (AGREGADOS):
${behaviorMetrics.map(m => `
- Engajamento Médio: ${(m.avgEngagement * 100).toFixed(1)}%
- Contato Visual Médio: ${(m.avgEyeContact * 100).toFixed(1)}%
- Confiança Média: ${(m.avgConfidence * 100).toFixed(1)}%
- Transcrições Válidas: ${m.transcriptionsFound}/${m.responsesCount}
- Taxa de Detecção Facial: ${(m.faceDetectionRate * 100).toFixed(1)}%
- Expressões Dominantes: ${JSON.stringify(m.dominantExpressions)}
`).join('\n')}

CRITÉRIOS DE AVALIAÇÃO PROFISSIONAL:
1. Avaliações Comportamentais e Psicológicas
   - Teste DISC: identifica perfil comportamental
   - Teste de personalidade (Big Five): extroversão, responsabilidade, estabilidade emocional
   - Teste de inteligência emocional: controle emocional, empatia, autoconsciência
   - Avaliação de valores e cultura organizacional: alinhamento aos valores da empresa

2. Avaliações Técnicas
   - Perguntas técnicas adequadas para teste em vídeo
   - Competências específicas da área de especialização
   - Capacidade de explicar conceitos técnicos

INSTRUÇÕES PARA ANÁLISE:
1. Calcule uma pontuação geral de 0-50% (NUNCA acima de 50%)
2. Identifique 5-7 pontos específicos para melhoria
3. Avalie comunicação, postura, confiança e preparação
4. Considere dados comportamentais e qualidade das respostas
5. Seja construtivo mas realista, seguindo padrões de RH profissional

FORMATO DE RESPOSTA (JSON):
{
  "overallScore": [0-50],
  "scoreBreakdown": {
    "behavioralAssessment": [0-10],
    "technicalCompetence": [0-10],
    "culturalFit": [0-10],
    "communication": [0-10],
    "videoPresence": [0-10]
  },
  "discProfile": "Perfil comportamental identificado (D/I/S/C)",
  "strengths": [
    "Força identificada 1",
    "Força identificada 2"
  ],
  "improvementPoints": [
    "Ponto específico para melhoria 1",
    "Ponto específico para melhoria 2",
    "Ponto específico para melhoria 3",
    "Ponto específico para melhoria 4",
    "Ponto específico para melhoria 5"
  ],
  "behavioralInsights": [
    "Insight comportamental baseado em DISC/Big Five",
    "Avaliação de inteligência emocional",
    "Análise de fit cultural"
  ],
  "technicalAssessment": [
    "Avaliação das competências técnicas",
    "Qualidade das explicações técnicas"
  ],
  "recommendations": [
    "Recomendação específica 1",
    "Recomendação específica 2",
    "Recomendação específica 3"
  ],
  "hiringRecommendation": "Recomendação final sobre contratação",
  "mentorshipRecommendation": "Razão específica pela qual mentoria ajudaria este candidato"
}

Responda APENAS com o JSON válido, sem explicações adicionais.
`;

return prompt;
  }

  parseGeminiResponse(responseText) {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Validar estrutura e limitar pontuação
        return {
          overallScore: Math.min(parsed.overallScore || 0, 50),
          scoreBreakdown: {
            communication: Math.min(parsed.scoreBreakdown?.communication || 0, 10),
            confidence: Math.min(parsed.scoreBreakdown?.confidence || 0, 10),
            preparation: Math.min(parsed.scoreBreakdown?.preparation || 0, 10),
            engagement: Math.min(parsed.scoreBreakdown?.engagement || 0, 10),
            eyeContact: Math.min(parsed.scoreBreakdown?.eyeContact || 0, 10)
          },
          strengths: parsed.strengths || [],
          improvementPoints: parsed.improvementPoints || [],
          behavioralInsights: parsed.behavioralInsights || [],
          recommendations: parsed.recommendations || [],
          mentorshipRecommendation: parsed.mentorshipRecommendation || ''
        };
      }
      
      throw new Error('JSON não encontrado na resposta');
      
    } catch (error) {
      console.error('❌ Erro ao parsear resposta do Gemini:', error);
      return this.getFallbackAnalysis();
    }
  }

  getFallbackAnalysis() {
    return {
      overallScore: 25,
      scoreBreakdown: {
        communication: 5,
        confidence: 5,
        preparation: 5,
        engagement: 5,
        eyeContact: 5
      },
      strengths: [
        "Participou da entrevista completa",
        "Demonstrou interesse na oportunidade"
      ],
      improvementPoints: [
        "Melhorar clareza na comunicação verbal",
        "Desenvolver confiança na apresentação pessoal",
        "Preparar respostas mais estruturadas",
        "Praticar contato visual consistente",
        "Desenvolver exemplos específicos de experiências"
      ],
      behavioralInsights: [
        "Análise comportamental limitada devido a dados insuficientes",
        "Recomenda-se sessões de prática para melhorar naturalidade"
      ],
      recommendations: [
        "Praticar entrevistas simuladas",
        "Estudar técnicas de comunicação eficaz",
        "Buscar feedback de profissionais experientes"
      ],
      mentorshipRecommendation: "A mentoria ajudará a desenvolver confiança e técnicas específicas de apresentação profissional"
    };
  }
}

export default new GeminiAnalysisService();