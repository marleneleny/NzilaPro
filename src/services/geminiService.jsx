// services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";

class GeminiCVAnalyzer {
  constructor() {
    // API Key handling with better fallback
    let apiKey;
    
    if (typeof window !== 'undefined') {
      // Browser environment
      apiKey = import.meta.env?.VITE_GEMINI_API_KEY || 
               window.env?.REACT_APP_GEMINI_API_KEY;
    } else {
      // Node.js environment
      apiKey = process.env.REACT_APP_GEMINI_API_KEY || 
               process.env.VITE_GEMINI_API_KEY;
    }
    
    // Remove the hardcoded API key for security
    if (!apiKey) {
      throw new Error('API Key do Gemini não encontrada. Configure VITE_GEMINI_API_KEY ou REACT_APP_GEMINI_API_KEY');
    }
    
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Mudança para modelo mais estável
      generationConfig: {
        temperature: 0.3, // Reduzido para respostas mais consistentes
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 4096, // Aumentado para respostas mais completas
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });
  }

  // Main method to generate questions based on area only
  async generateQuestions(userProfile) {
    try {
      console.log('Gerando perguntas baseadas na área:', userProfile);
      
      const prompt = this.buildPrompt(userProfile);
      
      console.log('Enviando requisição para Gemini...');
      
      let result;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          result = await Promise.race([
            this.model.generateContent(prompt),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('API timeout após 30 segundos')), 30000)
            )
          ]);
          break;
        } catch (error) {
          attempts++;
          console.warn(`Tentativa ${attempts} falhou:`, error.message);
          
          if (attempts >= maxAttempts) {
            throw new Error(`Falha após ${maxAttempts} tentativas: ${error.message}`);
          }
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
        }
      }
      
      if (!result?.response) {
        throw new Error('Resposta vazia da API Gemini');
      }

      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('Texto de resposta vazio da API');
      }
      
      console.log('Resposta recebida do Gemini:', text.substring(0, 200) + '...');
      
      return this.parseResponse(text);
    } catch (error) {
      console.error('Erro na geração de perguntas:', error);
      
      // Return enhanced fallback
      return this.generateFallbackQuestions(userProfile);
    }
  }

  // Build prompt based only on area - Simplified and more reliable
  buildPrompt(userProfile) {
    const area = userProfile?.area || userProfile?.specialization || 'Tecnologia';
    const name = userProfile?.fullName || userProfile?.name || 'Candidato';
    
    return `Você é um especialista em recrutamento. Gere 10 perguntas para entrevista de emprego na área de ${area}.

ÁREA: ${area}
CANDIDATO: ${name}

Crie:
- 3 perguntas técnicas específicas para ${area}
- 7 perguntas que as empresas sempre fazem no processo selectivo, devem ser simples

Responda APENAS com JSON no formato abaixo (sem markdown):

{
  "analysis": {
    "candidateProfile": "Profissional da área de ${area}",
    "strengths": ["Conhecimento técnico", "Experiência", "Competências"],
    "suggestedFocus": "Competências técnicas e comportamentais"
  },
  "questions": [
    {
      "id": 1,
      "text": "Qual sua experiência em ${area}?",
      "category": "Técnica",
      "timeLimit": 120,
      "purpose": "Avaliar conhecimento técnico"
    }
  ]
}`;
  }

  // Improved response parsing with better error handling
  parseResponse(text) {
    try {
      // Clean the response text more thoroughly
      let cleanText = text.trim();
      
      // Remove various markdown patterns
      cleanText = cleanText.replace(/```json\s*/gi, '');
      cleanText = cleanText.replace(/```javascript\s*/gi, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      cleanText = cleanText.replace(/^```/gm, '');
      cleanText = cleanText.replace(/```$/gm, '');
      
      // Remove any leading/trailing text that's not JSON
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('Nenhum JSON válido encontrado na resposta');
      }
      
      cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
      
      console.log('JSON extraído para parsing:', cleanText.substring(0, 300) + '...');
      
      const parsed = JSON.parse(cleanText);
      
      // Validate structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Resposta não é um objeto JSON válido');
      }
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Campo "questions" ausente ou inválido');
      }

      // Ensure we have analysis
      if (!parsed.analysis) {
        parsed.analysis = {
          candidateProfile: "Profissional analisado",
          strengths: ["Experiência", "Competências técnicas"],
          suggestedFocus: "Avaliação técnica e comportamental"
        };
      }

      // Validate and clean questions
      const validQuestions = [];
      
      for (let i = 0; i < Math.min(parsed.questions.length, 10); i++) {
        const q = parsed.questions[i];
        
        if (!q || typeof q !== 'object') {
          console.warn(`Pergunta ${i + 1} inválida:`, q);
          continue;
        }
        
        if (!q.text || typeof q.text !== 'string' || q.text.trim().length === 0) {
          console.warn(`Pergunta ${i + 1} sem texto válido:`, q);
          continue;
        }

        validQuestions.push({
          id: q.id || (i + 1),
          text: q.text.trim(),
          category: q.category && typeof q.category === 'string' ? q.category : 'Geral',
          timeLimit: this.validateTimeLimit(q.timeLimit),
          purpose: q.purpose && typeof q.purpose === 'string' ? q.purpose : 'Avaliar competências'
        });
      }

      if (validQuestions.length === 0) {
        throw new Error('Nenhuma pergunta válida encontrada na resposta');
      }

      // Fill remaining slots with fallback questions if needed
      if (validQuestions.length < 10) {
        const fallbackQuestions = this.generateFallbackQuestions().questions;
        const needed = 10 - validQuestions.length;
        const additional = fallbackQuestions.slice(0, needed).map((q, index) => ({
          ...q,
          id: validQuestions.length + index + 1
        }));
        validQuestions.push(...additional);
      }

      parsed.questions = validQuestions;

      console.log(`Resposta processada com sucesso: ${validQuestions.length} perguntas`);
      return parsed;
      
    } catch (error) {
      console.error('Erro ao processar resposta do Gemini:', error);
      console.error('Texto que causou erro:', text.substring(0, 500));
      throw new Error(`Falha ao processar resposta: ${error.message}`);
    }
  }

  // Helper method to validate time limits
  validateTimeLimit(timeLimit) {
    const parsed = parseInt(timeLimit);
    if (isNaN(parsed) || parsed < 30 || parsed > 300) {
      return 120; // Default 2 minutes
    }
    return Math.max(60, Math.min(180, parsed));
  }

  // Enhanced fallback questions based on area
  generateFallbackQuestions(userProfile = {}) {
    const area = userProfile?.area || userProfile?.specialization || 'sua área de atuação';
    
    return {
      analysis: {
        candidateProfile: `Profissional na área de ${area}`,
        strengths: ["Experiência na área", "Formação adequada", "Interesse em desenvolvimento"],
        suggestedFocus: "Competências técnicas e comportamentais"
      },
      questions: [
        {
          id: 1,
          text: `Conte-me sobre sua experiência profissional em ${area} e o que mais te motiva nesta área.`,
          category: "Experiência",
          timeLimit: 150,
          purpose: "Avaliar paixão pela área e trajetória profissional"
        },
        {
          id: 2,
          text: "Descreva um projeto ou desafio profissional complexo que você enfrentou. Como você abordou e resolveu?",
          category: "Situacional",
          timeLimit: 180,
          purpose: "Avaliar capacidade de resolução de problemas"
        },
        {
          id: 3,
          text: `Quais são suas principais competências técnicas em ${area} e como você as desenvolveu?`,
          category: "Técnica",
          timeLimit: 120,
          purpose: "Avaliar conhecimentos técnicos"
        },
        {
          id: 4,
          text: "Como você se mantém atualizado com as tendências e inovações da sua área?",
          category: "Desenvolvimento",
          timeLimit: 90,
          purpose: "Avaliar proatividade e aprendizado contínuo"
        },
        {
          id: 5,
          text: "Fale sobre uma situação onde você teve que trabalhar sob pressão e prazos apertados.",
          category: "Comportamental",
          timeLimit: 120,
          purpose: "Avaliar gestão de estresse e pressão"
        },
        {
          id: 6,
          text: "Descreva uma situação onde você teve que trabalhar em equipe para alcançar um objetivo comum.",
          category: "Trabalho em Equipe",
          timeLimit: 120,
          purpose: "Avaliar habilidades de colaboração"
        },
        {
          id: 7,
          text: "Quais são seus objetivos profissionais para os próximos 3 anos?",
          category: "Carreira",
          timeLimit: 100,
          purpose: "Avaliar ambição e planejamento de carreira"
        },
        {
          id: 8,
          text: "Como você lida com feedback negativo ou críticas construtivas?",
          category: "Comportamental",
          timeLimit: 90,
          purpose: "Avaliar maturidade profissional e capacidade de crescimento"
        },
        {
          id: 9,
          text: "Qual foi sua maior conquista profissional até agora e por que ela é significativa para você?",
          category: "Realizações",
          timeLimit: 130,
          purpose: "Avaliar orgulho profissional e valores pessoais"
        },
        {
          id: 10,
          text: "Por que você tem interesse em trabalhar conosco e como esta oportunidade se alinha com seus objetivos?",
          category: "Motivação",
          timeLimit: 120,
          purpose: "Avaliar interesse genuíno na empresa e posição"
        }
      ]
    };
  }
}

// Hook to use the analyzer
export const useGeminiCVAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyzer] = useState(() => {
    try {
      return new GeminiCVAnalyzer();
    } catch (err) {
      console.error('Erro ao inicializar GeminiCVAnalyzer:', err);
      return null;
    }
  });

  const generateQuestions = async (userProfile) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!analyzer) {
        throw new Error('Analyzer não inicializado - verifique a API key');
      }
      
      const result = await analyzer.generateQuestions(userProfile);
      return result;
    } catch (err) {
      console.error('Erro no hook:', err);
      setError(err.message);
      
      // Return fallback questions on error
      const fallbackAnalyzer = new GeminiCVAnalyzer();
      return fallbackAnalyzer.generateFallbackQuestions(userProfile);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    generateQuestions,
    loading,
    error,
    clearError,
    isInitialized: !!analyzer
  };
};

// Main function to generate questions based on area
export const generateQuestionsFromArea = async (userData) => {
  try {
    console.log('Gerando perguntas baseadas na área:', userData);
    
    const analyzer = new GeminiCVAnalyzer();
    
    // Prepare user profile with only necessary data
    const userProfile = {
      fullName: userData?.fullName || userData?.name || userData?.displayName || 'Candidato',
      area: userData?.area || userData?.field || userData?.specialization || 'Tecnologia',
      specialization: userData?.specialization
    };
    
    console.log('Dados do usuário preparados:', userProfile);
    
    const result = await analyzer.generateQuestions(userProfile);
    
    return {
      success: true,
      data: result,
      message: 'Perguntas geradas com sucesso'
    };
  } catch (error) {
    console.error('Erro ao gerar perguntas:', error);
    
    // Return fallback questions on error
    const fallbackAnalyzer = new GeminiCVAnalyzer();
    const fallbackResult = fallbackAnalyzer.generateFallbackQuestions(userData);
    
    return {
      success: false,
      data: fallbackResult,
      message: 'Usando perguntas padrão devido a erro na geração',
      error: error.message
    };
  }
};

// Alias for backward compatibility
export const generateQuestionsFromCV = generateQuestionsFromArea;

export default GeminiCVAnalyzer;