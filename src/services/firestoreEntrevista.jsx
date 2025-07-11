// services/firestoreService.js
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../services/firebase'; 

class FirestoreService {
  constructor() {
    this.db = db;
    this.interviewsCollection = 'interviews';
    this.responsesCollection = 'interview_responses';
    this.usersCollection = 'users';
  }

  // MÉTODO PRINCIPAL DE SANITIZAÇÃO - Remove undefined e valores inválidos
sanitizeForFirestore(obj) {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj !== 'object') {
    // Para tipos primitivos, verificar se são válidos para Firestore
    if (typeof obj === 'function') return null;
    if (typeof obj === 'symbol') return null;
    if (Number.isNaN(obj)) return null;
    if (obj === Infinity || obj === -Infinity) return null;
    return obj; // PRESERVAR TODAS AS STRINGS, INCLUINDO VAZIAS
  }

  if (Array.isArray(obj)) {
    return obj
      .map(item => this.sanitizeForFirestore(item))
      .filter(item => item !== undefined);
  }

    // Para objetos, processar recursivamente
   const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedValue = this.sanitizeForFirestore(value);
    
    // CAMPOS CRÍTICOS QUE DEVEM SER PRESERVADOS MESMO SE VAZIOS
    const criticalFields = ['transcription', 'text', 'answer', 'content', 'response'];
    
    if (criticalFields.includes(key)) {
      // Preservar o campo mesmo se for string vazia
      sanitized[key] = sanitizedValue !== undefined ? sanitizedValue : '';
    } else if (sanitizedValue !== undefined) {
      sanitized[key] = sanitizedValue;
    }
  }

  return sanitized;
}

  // VALIDAÇÃO ESPECÍFICA PARA DADOS DE ENTREVISTA
  validateAndSanitizeInterviewData(data) {
    console.log('🧹 Sanitizando dados da entrevista...');
    
    // Primeiro, sanitizar recursivamente
    const sanitized = this.sanitizeForFirestore(data);
    
    // Garantir que campos essenciais existam com valores padrão seguros
    const validated = {
      // Campos do usuário
      userId: String(sanitized.userId || ''),
      userName: String(sanitized.userName || ''),
      userEmail: String(sanitized.userEmail || ''),
      userSpecialization: String(sanitized.userSpecialization || ''),
      userAccountType: String(sanitized.userAccountType || ''),
      userContact: String(sanitized.userContact || ''),
      userAbout: String(sanitized.userAbout || ''),
      
      // Campos da entrevista
      questions: Array.isArray(sanitized.questions) ? sanitized.questions : [],
      responses: Array.isArray(sanitized.responses) ? sanitized.responses : [],
      behaviorData: Array.isArray(sanitized.behaviorData) ? sanitized.behaviorData : [],
      
      // Campos opcionais com fallbacks
      cvAnalysis: sanitized.cvAnalysis || null,
      cvContent: sanitized.cvContent || null,
      startTime: sanitized.startTime || null,
      endTime: sanitized.endTime || null,
      duration: Number(sanitized.duration) || 0,
      
      // Preservar outros campos sanitizados
      ...Object.keys(sanitized)
        .filter(key => ![
          'userId', 'userName', 'userEmail', 'userSpecialization', 
          'userAccountType', 'userContact', 'userAbout', 'questions', 
          'responses', 'behaviorData', 'cvAnalysis', 'cvContent', 
          'startTime', 'endTime', 'duration'
        ].includes(key))
        .reduce((acc, key) => ({ ...acc, [key]: sanitized[key] }), {})
    };

    console.log('✅ Dados sanitizados e validados');
    return validated;
  }

  // SANITIZAÇÃO PARA DADOS DE RESPOSTA
  sanitizeResponseData(responseData) {
  console.log('🧹 Sanitizando dados de resposta...');
  console.log('📥 Dados de entrada:', {
    hasQuestions: !!responseData.questions,
    hasResponses: !!responseData.responses,
    responsesCount: responseData.responses?.length || 0,
    firstResponseSample: responseData.responses?.[0]
  });
  
  const sanitized = this.sanitizeForFirestore(responseData || {});
  
  const result = {
    questions: Array.isArray(sanitized.questions) ? 
      sanitized.questions.map(q => this.sanitizeForFirestore(q)) : [],
    responses: Array.isArray(sanitized.responses) ? 
      sanitized.responses.map((r, index) => {
        console.log(`🔍 Processando resposta ${index}:`, {
          hasTranscription: !!r.transcription,
          transcriptionLength: r.transcription?.length || 0,
          transcriptionSample: r.transcription?.substring(0, 50)
        });
        
        const sanitizedResponse = this.sanitizeForFirestore(r);
        
        // GARANTIR QUE A TRANSCRIÇÃO SEJA PRESERVADA
        if (r.transcription !== undefined) {
          sanitizedResponse.transcription = r.transcription;
        }
        
        return sanitizedResponse;
      }) : [],
    behaviorData: Array.isArray(sanitized.behaviorData) ? 
      sanitized.behaviorData.map(b => this.sanitizeForFirestore(b)) : [],
    cvContent: sanitized.cvContent || null
  };
  
  console.log('📤 Dados sanitizados:', {
    questionsCount: result.questions.length,
    responsesCount: result.responses.length,
    transcriptionsPreserved: result.responses.filter(r => r.transcription && r.transcription.trim()).length
  });
  
  return result;
}

debugResponseData(responseData, step = 'unknown') {
  console.log(`🔍 DEBUG ${step}:`, {
    step,
    timestamp: new Date().toISOString(),
    hasData: !!responseData,
    responsesCount: responseData.responses?.length || 0,
    sampleResponse: responseData.responses?.[0] ? {
      keys: Object.keys(responseData.responses[0]),
      hasTranscription: !!responseData.responses[0].transcription,
      transcriptionType: typeof responseData.responses[0].transcription,
      transcriptionLength: responseData.responses[0].transcription?.length || 0,
      transcriptionSample: responseData.responses[0].transcription?.substring(0, 100)
    } : null
  });
}
  // Validar dados obrigatórios - MANTIDO COM MELHORIAS
  validateInterviewData(interviewData) {
    if (!interviewData || typeof interviewData !== 'object') {
      throw new Error('Dados da entrevista são obrigatórios');
    }

    console.log('🔍 Validando dados da entrevista:', {
      hasUserId: !!interviewData.userId,
      hasUserName: !!interviewData.userName,
      hasUserEmail: !!interviewData.userEmail,
      hasFullName: !!interviewData.fullName,
      hasName: !!interviewData.name,
      hasDisplayName: !!interviewData.displayName,
      hasEmail: !!interviewData.email,
      keys: Object.keys(interviewData)
    });

    const hasAnyNameField = interviewData.userName || interviewData.fullName || 
                           interviewData.name || interviewData.displayName;
    const hasAnyEmailField = interviewData.userEmail || interviewData.email;
    const hasMinimumData = hasAnyNameField && hasAnyEmailField;
    
    if (!hasMinimumData) {
      console.error('❌ Dados insuficientes:', JSON.stringify(interviewData, null, 2));
      throw new Error('Campos obrigatórios ausentes. Necessário: nome e email do usuário');
    }

    console.log('✅ Validação passou - dados suficientes encontrados');
    return true;
  }

  // Normalizar dados do usuário - MELHORADO
  normalizeUserData(interviewData) {
    if (!interviewData) return {};

    console.log('🔄 Iniciando normalização dos dados...');

    let userId = interviewData.userId || interviewData.uid || interviewData.id;
    
    if (!userId) {
      const email = interviewData.userEmail || interviewData.email;
      if (email) {
        userId = `user_${email.replace(/[@.]/g, '_')}_${Date.now()}`;
        console.log('🆔 ID gerado automaticamente:', userId);
      } else {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('🆔 ID aleatório gerado:', userId);
      }
    }

    const normalized = {
      ...interviewData,
      userId: userId,
      userName: interviewData.userName || interviewData.name || 
               interviewData.displayName || interviewData.fullName || '',
      userEmail: interviewData.userEmail || interviewData.email || '',
      userSpecialization: interviewData.userSpecialization || 
                         interviewData.specialization || interviewData.area || '',
      userAccountType: interviewData.userAccountType || interviewData.accountType || '',
      userContact: interviewData.userContact || interviewData.contact || '',
      userAbout: interviewData.userAbout || interviewData.about || ''
    };

    // Garantir que todos os campos obrigatórios sejam strings
    Object.keys(normalized).forEach(key => {
      if (key.startsWith('user') && typeof normalized[key] !== 'string') {
        normalized[key] = String(normalized[key] || '');
      }
    });

    console.log('📝 Dados normalizados com sucesso');
    return normalized;
  }

  // Testar conexão com Firestore
  async testConnection() {
    try {
      console.log('🔄 Testando conexão com Firestore...');
      const testDoc = {
        test: true,
        timestamp: serverTimestamp()
      };
      
      const testRef = collection(this.db, 'connection_test');
      const docRef = await addDoc(testRef, testDoc);
      console.log('✅ Conexão OK - Test document ID:', docRef.id);
      return { success: true, docId: docRef.id };
    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      return { success: false, error: error.message };
    }
  }

  // Buscar dados do usuário no Firestore
  async getUserData(userId) {
    try {
      console.log('🔍 Buscando dados do usuário:', userId);
      
      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }

      const userRef = doc(this.db, this.usersCollection, String(userId));
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        console.warn('⚠️ Usuário não encontrado no Firestore:', userId);
        return {
          userId: String(userId),
          userName: '',
          userEmail: '',
          userSpecialization: '',
          userAccountType: '',
          userContact: '',
          userAbout: ''
        };
      }
      
      const userData = docSnap.data();
      console.log('✅ Dados do usuário encontrados:', userData);
      
      const normalizedData = {
        userId: userData.uid || userData.userId || userData.id || userId,
        userName: userData.name || userData.displayName || userData.fullName || userData.userName || '',
        userEmail: userData.email || userData.userEmail || '',
        userSpecialization: userData.specialization || userData.area || userData.userSpecialization || '',
        userAccountType: userData.accountType || userData.userAccountType || '',
        userContact: userData.contact || userData.userContact || '',
        userAbout: userData.about || userData.userAbout || ''
      };

      Object.keys(normalizedData).forEach(key => {
        normalizedData[key] = String(normalizedData[key] || '');
      });

      return normalizedData;
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do usuário:', error);
      return {
        userId: String(userId),
        userName: '',
        userEmail: '',
        userSpecialization: '',
        userAccountType: '',
        userContact: '',
        userAbout: ''
      };
    }
  }

  // Função auxiliar para extrair dados do usuário do objeto User do useAuth
  extractUserDataFromAuth(user) {
    if (!user) return {};

    return {
      userId: user.uid || user.id || '',
      userName: user.name || user.displayName || user.fullName || '',
      userEmail: user.email || '',
      userSpecialization: user.specialization || user.area || '',
      userAccountType: user.accountType || '',
      userContact: user.contact || '',
      userAbout: user.about || ''
    };
  }

  // SALVAR ENTREVISTA - MÉTODO PRINCIPAL MELHORADO
  async saveInterview(interviewData) {
  try {
    console.log('🔄 Iniciando salvamento da entrevista...');
    console.log('📝 Dados recebidos (primeiro nível):', Object.keys(interviewData));

    // *** NOVO: PRÉ-PROCESSAMENTO PARA LIMPAR TRANSCRIÇÕES ***
    const preprocessedData = this.preprocessInterviewData(interviewData);

    // PASSO 1: Normalizar dados do usuário
    const normalizedData = this.normalizeUserData(preprocessedData);
    
    // PASSO 2: Validar dados obrigatórios
    this.validateInterviewData(normalizedData);

    // PASSO 3: Sanitizar e validar todos os dados
    const sanitizedData = this.validateAndSanitizeInterviewData(normalizedData);

 const {
      userId,
      userName,
      userEmail,
      userSpecialization,
      userAccountType,
      userContact,
      userAbout,
      questions = [],
      responses = [],
      behaviorData = [],
      cvAnalysis = null,
      cvContent = null,
      startTime,
      endTime,
      duration = 0
    } = sanitizedData;


      // Validação final do userId
      if (!userId || userId === '' || userId === 'undefined') {
        throw new Error('Erro interno: ID do usuário não foi gerado corretamente');
      }

      // Calcular status baseado nas respostas
      const totalQuestions = questions.length;
      const completedQuestions = responses.length;
      const isCompleted = totalQuestions > 0 && completedQuestions === totalQuestions;

      // PASSO 4: Construir documento sanitizado
      const interviewDoc = {
        userId: String(userId),
        userName: String(userName),
        userEmail: String(userEmail),
        userSpecialization: String(userSpecialization),
        userAccountType: String(userAccountType),
        userContact: String(userContact),
        userAbout: String(userAbout),
        totalQuestions: Number(totalQuestions) || 0,
        completedQuestions: Number(completedQuestions) || 0,
        startTime: startTime || serverTimestamp(),
        endTime: endTime || (isCompleted ? serverTimestamp() : null),
        duration: Number(duration) || 0,
        status: isCompleted ? 'completed' : 'incomplete',
        cvAnalysis: cvAnalysis,
        hasCVContent: Boolean(cvContent),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // PASSO 5: Sanitizar documento final antes de salvar
      const finalDoc = this.sanitizeForFirestore(interviewDoc);

      console.log('📄 Documento final sanitizado:', {
        userId: finalDoc.userId,
        userName: finalDoc.userName,
        userEmail: finalDoc.userEmail,
        totalQuestions: finalDoc.totalQuestions,
        status: finalDoc.status
      });

      // PASSO 6: Salvar documento principal
      console.log('💾 Salvando documento principal...');
      const interviewRef = collection(this.db, this.interviewsCollection);
      const interviewDocRef = await addDoc(interviewRef, finalDoc);
      
      console.log('✅ Entrevista principal salva com ID:', interviewDocRef.id);

      // PASSO 7: Salvar respostas detalhadas se existirem
      if (questions.length > 0 || responses.length > 0 || behaviorData.length > 0) {
        console.log('💾 Salvando respostas detalhadas...');
        const responseResult = await this.saveInterviewResponses(interviewDocRef.id, {
          questions,
          responses,
          behaviorData,
          cvContent
        });

        if (!responseResult.success) {
          console.warn('⚠️ Aviso: Erro ao salvar respostas detalhadas:', responseResult.error);
        }
      }

      return {
        success: true,
        interviewId: interviewDocRef.id,
        message: 'Entrevista salva com sucesso!',
        data: {
          id: interviewDocRef.id,
          status: finalDoc.status,
          totalQuestions: finalDoc.totalQuestions,
          completedQuestions: finalDoc.completedQuestions,
          generatedUserId: userId
        }
      };

    } catch (error) {
      console.error('❌ Erro ao salvar entrevista:', error);
      console.error('📊 Stack trace:', error.stack);
      
      return {
        success: false,
        error: error.message,
        message: 'Erro ao salvar entrevista',
        errorCode: error.code || 'unknown',
        details: {
          originalError: error.toString(),
          errorType: error.constructor.name
        }
      };
    }
  }

  async analyzeAccumulationProblem(interviewId) {
  try {
    console.log('🔍 Analisando problema de acumulação...');
    
    const result = await this.getInterviewDetails(interviewId);
    if (!result.success) {
      throw new Error('Entrevista não encontrada');
    }

    const { responses } = result.data;
    
    const analysis = responses.map(responseDoc => {
      const responsesInDoc = responseDoc.responses || [];
      
      return {
        documentId: responseDoc.id,
        totalResponses: responsesInDoc.length,
        transcriptionAnalysis: responsesInDoc.map((response, index) => {
          const transcription = response.transcription || '';
          const words = transcription.split(' ');
          
          return {
            responseIndex: index,
            transcriptionLength: transcription.length,
            wordCount: words.length,
            startsWithPrevious: index > 0 ? 
              transcription.startsWith(responsesInDoc[0].transcription?.substring(0, 50) || '') : false,
            containsPreviousResponse: index > 0 ? 
              responsesInDoc.slice(0, index).some(prev => 
                transcription.includes(prev.transcription?.substring(0, 100) || '')
              ) : false
          };
        })
      };
    });

    console.log('📊 Análise de acumulação:', analysis);
    
    return {
      success: true,
      analysis,
      summary: {
        documentsAnalyzed: analysis.length,
        potentialAccumulation: analysis.some(doc => 
          doc.transcriptionAnalysis.some(t => t.containsPreviousResponse)
        )
      }
    };
    
  } catch (error) {
    console.error('❌ Erro na análise:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 6. MÉTODO PARA CORRIGIR DADOS EXISTENTES (OPCIONAL)
async fixAccumulatedTranscriptions(interviewId) {
  try {
    console.log('🔧 Corrigindo transcrições acumuladas...');
    
    const details = await this.getInterviewDetails(interviewId);
    if (!details.success) {
      throw new Error('Entrevista não encontrada');
    }

    const { responses } = details.data;
    
    for (const responseDoc of responses) {
      if (responseDoc.responses && responseDoc.responses.length > 0) {
        const cleanedResponses = this.cleanTranscriptionData(responseDoc.responses);
        
        // Atualizar o documento
        const responseRef = doc(this.db, this.responsesCollection, responseDoc.id);
        await updateDoc(responseRef, {
          responses: cleanedResponses,
          fixedAt: serverTimestamp(),
          wasFixed: true
        });
        
        console.log(`✅ Documento ${responseDoc.id} corrigido`);
      }
    }
    
    return {
      success: true,
      message: 'Transcrições corrigidas com sucesso',
      documentsFixed: responses.length
    };
    
  } catch (error) {
    console.error('❌ Erro ao corrigir:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async saveInterviewResponses(interviewId, responseData) {
  try {
    console.log('💾 Salvando respostas para entrevista:', interviewId);
    
    // DEBUG INICIAL
    this.debugResponseData(responseData, 'ENTRADA');
    
    if (!interviewId) {
      throw new Error('ID da entrevista é obrigatório');
    }

    // SANITIZAR dados de entrada
    const sanitizedResponseData = this.sanitizeResponseData(responseData);
    
    // DEBUG APÓS SANITIZAÇÃO
    this.debugResponseData(sanitizedResponseData, 'APÓS_SANITIZAÇÃO');
    
    const { questions, responses, behaviorData, cvContent } = sanitizedResponseData;

    // PROCESSAR DADOS COMPORTAMENTAIS DA FACE API
    const processedBehaviorData = this.processBehaviorData(behaviorData);
    const behaviorAnalysis = this.generateBehaviorAnalysis(processedBehaviorData);

    // Construir documento de respostas
    const responsesDoc = {
      interviewId: String(interviewId),
      questions: questions,
      responses: responses,
      
      // DADOS COMPORTAMENTAIS ESTRUTURADOS
      behaviorData: {
        rawData: processedBehaviorData.slice(-50), // Manter apenas os últimos 50 pontos para otimizar storage
        summary: behaviorAnalysis.summary,
        timeline: behaviorAnalysis.timeline,
        insights: behaviorAnalysis.insights
      },
      
      cvContent: cvContent,
      
      // METADADOS DE ANÁLISE APRIMORADOS
      analysisMetadata: {
        // Dados básicos
        totalBehaviorDataPoints: processedBehaviorData.length,
        questionsCount: questions.length,
        responsesCount: responses.length,
        transcriptionsFound: responses.filter(r => r.transcription && r.transcription.trim()).length,
        
        // Análise comportamental
        avgEngagement: behaviorAnalysis.averages.engagement || 0,
        avgEyeContact: behaviorAnalysis.averages.eyeContact || 0,
        avgConfidence: behaviorAnalysis.averages.confidence || 0,
        
        // Expressões dominantes
        dominantExpressions: behaviorAnalysis.dominantExpressions || {},
        
        // Métricas de qualidade
        faceDetectionRate: behaviorAnalysis.quality.faceDetectionRate || 0,
        eyeContactConsistency: behaviorAnalysis.quality.eyeContactConsistency || 0,
        emotionalStability: behaviorAnalysis.quality.emotionalStability || 0,
        
        // Timeline de engajamento
        engagementTrend: behaviorAnalysis.trends.engagement || 'stable',
        eyeContactTrend: behaviorAnalysis.trends.eyeContact || 'stable'
      },
      
      createdAt: serverTimestamp()
    };

    // DEBUG ANTES DA SANITIZAÇÃO FINAL
    console.log('📋 Documento antes da sanitização final:', {
      responsesCount: responsesDoc.responses.length,
      behaviorDataPoints: responsesDoc.behaviorData.rawData.length,
      transcriptionsInDoc: responsesDoc.responses.filter(r => r.transcription).length,
      avgEngagement: responsesDoc.analysisMetadata.avgEngagement,
      avgEyeContact: responsesDoc.analysisMetadata.avgEyeContact
    });

    // SANITIZAR documento final
    const finalResponsesDoc = this.sanitizeForFirestore(responsesDoc);
    
    // DEBUG FINAL
    console.log('📝 Documento final sanitizado:', {
      interviewId: finalResponsesDoc.interviewId,
      questionsCount: finalResponsesDoc.questions?.length || 0,
      responsesCount: finalResponsesDoc.responses?.length || 0,
      behaviorDataPoints: finalResponsesDoc.behaviorData?.rawData?.length || 0,
      avgEngagement: finalResponsesDoc.analysisMetadata?.avgEngagement || 0,
      transcriptionsInFinalDoc: finalResponsesDoc.responses?.filter(r => r.transcription && r.transcription.trim()).length || 0
    });

    const responsesRef = collection(this.db, this.responsesCollection);
    const responseDocRef = await addDoc(responsesRef, finalResponsesDoc);

    console.log('✅ Respostas salvas com ID:', responseDocRef.id);
    
    // VERIFICAÇÃO FINAL
    try {
      const savedDoc = await getDoc(responseDocRef);
      const savedData = savedDoc.data();
      console.log('🔍 Verificação - documento salvo:', {
        responsesCount: savedData.responses?.length || 0,
        behaviorDataPoints: savedData.behaviorData?.rawData?.length || 0,
        avgEngagement: savedData.analysisMetadata?.avgEngagement || 0,
        transcriptionsInSavedDoc: savedData.responses?.filter(r => r.transcription && r.transcription.trim()).length || 0
      });
    } catch (verifyError) {
      console.warn('⚠️ Não foi possível verificar o documento salvo:', verifyError);
    }
    
    return {
      success: true,
      responseId: responseDocRef.id,
      message: 'Respostas e análise comportamental salvas com sucesso',
      debug: {
        transcriptionsProcessed: finalResponsesDoc.responses?.filter(r => r.transcription && r.transcription.trim()).length || 0,
        totalResponses: finalResponsesDoc.responses?.length || 0,
        behaviorDataPoints: finalResponsesDoc.behaviorData?.rawData?.length || 0,
        avgEngagement: finalResponsesDoc.analysisMetadata?.avgEngagement || 0
      }
    };

  } catch (error) {
    console.error('❌ Erro ao salvar respostas:', error);
    return {
      success: false,
      error: error.message,
      message: 'Erro ao salvar respostas detalhadas'
    };
  }
}

// MÉTODOS AUXILIARES PARA PROCESSAMENTO DE DADOS COMPORTAMENTAIS

processBehaviorData(behaviorData) {
  if (!Array.isArray(behaviorData) || behaviorData.length === 0) {
    console.warn('⚠️ Dados comportamentais vazios ou inválidos');
    return [];
  }

  return behaviorData
    .filter(data => data && typeof data === 'object')
    .map(data => ({
      timestamp: data.timestamp || Date.now(),
      faceDetected: Boolean(data.faceDetected),
      confidence: this.sanitizeNumber(data.confidence, 0),
      
      expressions: {
        neutral: this.sanitizeNumber(data.expressions?.neutral, 0),
        happy: this.sanitizeNumber(data.expressions?.happy, 0),
        sad: this.sanitizeNumber(data.expressions?.sad, 0),
        angry: this.sanitizeNumber(data.expressions?.angry, 0),
        fearful: this.sanitizeNumber(data.expressions?.fearful, 0),
        disgusted: this.sanitizeNumber(data.expressions?.disgusted, 0),
        surprised: this.sanitizeNumber(data.expressions?.surprised, 0)
      },
      
      eyeContact: {
        score: this.sanitizeNumber(data.eyeContact?.score, 0),
        looking: Boolean(data.eyeContact?.looking),
        direction: data.eyeContact?.direction || 'unknown',
        confidence: this.sanitizeNumber(data.eyeContact?.confidence, 0)
      },
      
      engagement: {
        score: this.sanitizeNumber(data.engagement?.score, 0),
        stability: this.sanitizeNumber(data.engagement?.stability, 0)
      },
      
      facePosition: data.facePosition ? {
        x: Math.round(data.facePosition.x || 0),
        y: Math.round(data.facePosition.y || 0),
        width: Math.round(data.facePosition.width || 0),
        height: Math.round(data.facePosition.height || 0),
        centered: Boolean(data.facePosition.centered)
      } : null
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

generateBehaviorAnalysis(behaviorData) {
  if (!Array.isArray(behaviorData) || behaviorData.length === 0) {
    return this.getDefaultBehaviorAnalysis();
  }

  const validData = behaviorData.filter(d => d.faceDetected);
  const dataLength = behaviorData.length;
  const validLength = validData.length;

  // CÁLCULO DE MÉDIAS
  const averages = {
    engagement: validLength > 0 ? validData.reduce((sum, d) => sum + d.engagement.score, 0) / validLength : 0,
    eyeContact: validLength > 0 ? validData.reduce((sum, d) => sum + d.eyeContact.score, 0) / validLength : 0,
    confidence: validLength > 0 ? validData.reduce((sum, d) => sum + d.confidence, 0) / validLength : 0
  };

  // EXPRESSÕES DOMINANTES
  const expressionTotals = {
    neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0
  };

  validData.forEach(d => {
    Object.keys(expressionTotals).forEach(expr => {
      expressionTotals[expr] += d.expressions[expr] || 0;
    });
  });

  const dominantExpressions = Object.entries(expressionTotals)
    .map(([expr, total]) => ({ expression: expr, average: total / validLength }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 3);

  // MÉTRICAS DE QUALIDADE
  const quality = {
    faceDetectionRate: dataLength > 0 ? validLength / dataLength : 0,
    eyeContactConsistency: this.calculateConsistency(validData.map(d => d.eyeContact.score)),
    emotionalStability: this.calculateEmotionalStability(validData)
  };

  // TENDÊNCIAS
  const trends = {
    engagement: this.calculateTrend(validData.map(d => d.engagement.score)),
    eyeContact: this.calculateTrend(validData.map(d => d.eyeContact.score))
  };

  // TIMELINE RESUMIDA (dividir em segmentos de 5 segundos)
  const timeline = this.createTimeline(validData);

  return {
    summary: {
      totalDataPoints: dataLength,
      validDataPoints: validLength,
      duration: dataLength > 0 ? (behaviorData[dataLength - 1].timestamp - behaviorData[0].timestamp) / 1000 : 0
    },
    averages,
    dominantExpressions: dominantExpressions.reduce((acc, item) => {
      acc[item.expression] = Math.round(item.average * 100) / 100;
      return acc;
    }, {}),
    quality,
    trends,
    timeline,
    insights: this.generateInsights(averages, quality, trends)
  };
}

calculateConsistency(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.max(0, 1 - Math.sqrt(variance));
}

calculateEmotionalStability(validData) {
  if (validData.length < 2) return 0;
  
  const stabilityScores = validData.map(d => d.engagement.stability || 0);
  return stabilityScores.reduce((sum, score) => sum + score, 0) / stabilityScores.length;
}

calculateTrend(values) {
  if (values.length < 3) return 'stable';
  
  const firstThird = values.slice(0, Math.floor(values.length / 3));
  const lastThird = values.slice(-Math.floor(values.length / 3));
  
  const firstAvg = firstThird.reduce((sum, val) => sum + val, 0) / firstThird.length;
  const lastAvg = lastThird.reduce((sum, val) => sum + val, 0) / lastThird.length;
  
  const difference = lastAvg - firstAvg;
  
  if (difference > 0.1) return 'improving';
  if (difference < -0.1) return 'declining';
  return 'stable';
}

createTimeline(validData) {
  if (validData.length === 0) return [];
  
  const segments = [];
  const segmentDuration = 5000; // 5 segundos
  const startTime = validData[0].timestamp;
  const endTime = validData[validData.length - 1].timestamp;
  
  for (let time = startTime; time < endTime; time += segmentDuration) {
    const segmentData = validData.filter(d => 
      d.timestamp >= time && d.timestamp < time + segmentDuration
    );
    
    if (segmentData.length > 0) {
      segments.push({
        startTime: time,
        duration: segmentDuration,
        avgEngagement: segmentData.reduce((sum, d) => sum + d.engagement.score, 0) / segmentData.length,
        avgEyeContact: segmentData.reduce((sum, d) => sum + d.eyeContact.score, 0) / segmentData.length,
        dataPoints: segmentData.length
      });
    }
  }
  
  return segments;
}

generateInsights(averages, quality, trends) {
  const insights = [];
  
  // Insights de engajamento
  if (averages.engagement > 0.7) {
    insights.push('Alto nível de engajamento durante a entrevista');
  } else if (averages.engagement < 0.4) {
    insights.push('Baixo nível de engajamento detectado');
  }
  
  // Insights de contato visual
  if (averages.eyeContact > 0.6) {
    insights.push('Bom contato visual mantido');
  } else if (averages.eyeContact < 0.3) {
    insights.push('Contato visual limitado');
  }
  
  // Insights de tendências
  if (trends.engagement === 'improving') {
    insights.push('Engajamento melhorou ao longo da entrevista');
  } else if (trends.engagement === 'declining') {
    insights.push('Engajamento diminuiu durante a entrevista');
  }
  
  // Insights de qualidade
  if (quality.faceDetectionRate < 0.7) {
    insights.push('Qualidade de detecção facial pode ter afetado a análise');
  }
  
  return insights;
}

getDefaultBehaviorAnalysis() {
  return {
    summary: { totalDataPoints: 0, validDataPoints: 0, duration: 0 },
    averages: { engagement: 0, eyeContact: 0, confidence: 0 },
    dominantExpressions: {},
    quality: { faceDetectionRate: 0, eyeContactConsistency: 0, emotionalStability: 0 },
    trends: { engagement: 'stable', eyeContact: 'stable' },
    timeline: [],
    insights: ['Nenhum dado comportamental disponível']
  };
}

sanitizeNumber(value, defaultValue = 0) {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : Math.round(num * 100) / 100;
}

async investigateTranscriptionProblem(interviewId) {
  try {
    console.log('🕵️ Investigando problema de transcrição...');
    
    if (!interviewId) {
      throw new Error('ID da entrevista necessário');
    }
    
    const result = await this.getInterviewDetails(interviewId);
    
    if (!result.success) {
      throw new Error('Entrevista não encontrada');
    }
    
    const { responses } = result.data;
    
    console.log('📊 Análise completa:', {
      totalResponseDocuments: responses.length,
      responseDocuments: responses.map((doc, index) => ({
        docIndex: index,
        docId: doc.id,
        responsesInDoc: doc.responses?.length || 0,
        transcriptionsInDoc: doc.responses?.filter(r => r.transcription && r.transcription.trim()).length || 0,
        sampleResponses: doc.responses?.slice(0, 2).map(r => ({
          hasTranscription: !!r.transcription,
          transcriptionLength: r.transcription?.length || 0,
          transcriptionSample: r.transcription?.substring(0, 50)
        }))
      }))
    });
    
    return {
      success: true,
      data: result.data,
      analysis: responses.map((doc, index) => ({
        docIndex: index,
        docId: doc.id,
        responsesInDoc: doc.responses?.length || 0,
        transcriptionsInDoc: doc.responses?.filter(r => r.transcription && r.transcription.trim()).length || 0
      }))
    };
    
  } catch (error) {
    console.error('❌ Erro na investigação:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 1. MÉTODO PARA LIMPAR TRANSCRIÇÕES DUPLICADAS/ACUMULADAS
cleanTranscriptionData(responses) {
  console.log('🧹 Limpando transcrições acumuladas...');
  
  if (!Array.isArray(responses)) {
    console.log('⚠️ Responses não é um array:', typeof responses);
    return [];
  }

  const cleanedResponses = responses.map((response, index) => {
    if (!response || typeof response !== 'object') {
      console.log(`⚠️ Resposta ${index} inválida:`, response);
      return response;
    }

    // Se tem transcrição, verificar se está acumulada
    if (response.transcription && typeof response.transcription === 'string') {
      const originalLength = response.transcription.length;
      
      // ESTRATÉGIA 1: Se a transcrição é muito longa, pode estar acumulada
      if (originalLength > 1000) { // Ajuste este valor conforme necessário
        console.log(`⚠️ Transcrição ${index} muito longa (${originalLength} chars), pode estar acumulada`);
        
        // Tentar extrair apenas a última parte (mais recente)
        const sentences = response.transcription.split(/[.!?]+/).filter(s => s.trim());
        const lastSentences = sentences.slice(-3).join('. '); // Pegar últimas 3 frases
        
        console.log(`🔧 Reduzindo transcrição de ${originalLength} para ${lastSentences.length} chars`);
        
        return {
          ...response,
          transcription: lastSentences.trim(),
          originalTranscriptionLength: originalLength, // Para debug
          wasReduced: true
        };
      }
      
      // ESTRATÉGIA 2: Detectar padrões repetitivos
      const words = response.transcription.toLowerCase().split(' ');
      const uniqueWords = new Set(words);
      const repetitionRatio = words.length / uniqueWords.size;
      
      if (repetitionRatio > 3) { // Se há muita repetição
        console.log(`⚠️ Transcrição ${index} com alta repetição (ratio: ${repetitionRatio})`);
        
        // Pegar apenas uma porção única
        const uniquePortion = Array.from(uniqueWords).slice(0, 50).join(' ');
        
        return {
          ...response,
          transcription: uniquePortion,
          originalTranscriptionLength: originalLength,
          repetitionRatio: repetitionRatio,
          wasDeduped: true
        };
      }
    }

    return response;
  });

  console.log('✅ Transcrições limpas:', {
    total: cleanedResponses.length,
    reduced: cleanedResponses.filter(r => r.wasReduced).length,
    deduped: cleanedResponses.filter(r => r.wasDeduped).length
  });

  return cleanedResponses;
}

// 2. MÉTODO PARA ASSOCIAR TRANSCRIÇÕES CORRETAS A PERGUNTAS
mapTranscriptionsToQuestions(questions, responses) {
  console.log('🔗 Mapeando transcrições para perguntas...');
  
  if (!Array.isArray(questions) || !Array.isArray(responses)) {
    console.log('⚠️ Dados inválidos para mapeamento');
    return responses;
  }

  const mappedResponses = questions.map((question, questionIndex) => {
    // Encontrar a resposta correspondente a esta pergunta
    const correspondingResponse = responses.find(r => 
      r.questionId === question.id || 
      r.questionIndex === questionIndex ||
      r.questionNumber === (questionIndex + 1)
    ) || responses[questionIndex]; // Fallback para index

    if (!correspondingResponse) {
      console.log(`⚠️ Nenhuma resposta encontrada para pergunta ${questionIndex}`);
      return {
        questionId: question.id || questionIndex,
        questionIndex: questionIndex,
        transcription: '',
        timestamp: new Date().toISOString()
      };
    }

    console.log(`✅ Mapeada pergunta ${questionIndex} com resposta:`, {
      questionId: question.id,
      hasTranscription: !!correspondingResponse.transcription,
      transcriptionLength: correspondingResponse.transcription?.length || 0
    });

    return {
      ...correspondingResponse,
      questionId: question.id || questionIndex,
      questionIndex: questionIndex,
      questionText: question.text || question.question
    };
  });

  return mappedResponses;
}

// 3. MÉTODO PRINCIPAL PARA PROCESSAR DADOS ANTES DO SALVAMENTO
preprocessInterviewData(interviewData) {
  console.log('🔄 Pré-processando dados da entrevista...');
  
  let { questions = [], responses = [], ...otherData } = interviewData;
  
  console.log('📊 Dados originais:', {
    questionsCount: questions.length,
    responsesCount: responses.length,
    sampleResponse: responses[0] ? {
      keys: Object.keys(responses[0]),
      transcriptionLength: responses[0].transcription?.length || 0
    } : null
  });

  // PASSO 1: Limpar transcrições acumuladas
  const cleanedResponses = this.cleanTranscriptionData(responses);
  
  // PASSO 2: Mapear corretamente para perguntas
  const mappedResponses = this.mapTranscriptionsToQuestions(questions, cleanedResponses);
  
  // PASSO 3: Validar correspondência
  const validatedResponses = mappedResponses.map((response, index) => {
    if (!response.transcription || response.transcription.trim() === '') {
      console.log(`⚠️ Resposta ${index} sem transcrição válida`);
      return {
        ...response,
        transcription: '', 
        isEmpty: true
      };
    }
    
    return response;
  });

  console.log('✅ Dados pré-processados:', {
    questionsCount: questions.length,
    responsesCount: validatedResponses.length,
    responsesWithTranscription: validatedResponses.filter(r => r.transcription && r.transcription.trim()).length,
    emptyResponses: validatedResponses.filter(r => r.isEmpty).length
  });

  return {
    ...otherData,
    questions,
    responses: validatedResponses
  };
}

  // Salvar entrevista com dados do usuário do useAuth
  async saveInterviewWithAuthUser(user, interviewData) {
    try {
      console.log('🔄 Salvando entrevista com dados do useAuth...');
      
      if (!user) {
        throw new Error('Objeto User do useAuth é obrigatório');
      }

      const userData = this.extractUserDataFromAuth(user);
      const completeInterviewData = {
        ...userData,
        ...interviewData,
        userId: user.uid || user.id
      };
      
      return await this.saveInterview(completeInterviewData);
      
    } catch (error) {
      console.error('❌ Erro ao salvar entrevista com dados do useAuth:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao salvar entrevista com dados do usuário'
      };
    }
  }

  // Salvar entrevista com dados do usuário automaticamente
  async saveInterviewWithUserData(userId, interviewData) {
    try {
      console.log('🔄 Salvando entrevista com dados do usuário...');
      
      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }

      const userData = await this.getUserData(userId);
      const completeInterviewData = {
        ...userData,
        ...interviewData,
        userId: userId
      };
      
      return await this.saveInterview(completeInterviewData);
      
    } catch (error) {
      console.error('❌ Erro ao salvar entrevista com dados do usuário:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao salvar entrevista com dados do usuário'
      };
    }
  }

  // Buscar entrevistas do usuário
  async getUserInterviews(userId) {
    try {
      console.log('🔍 Buscando entrevistas para usuário:', userId);
      
      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }
      
      const q = query(
        collection(this.db, this.interviewsCollection),
        where('userId', '==', String(userId)),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const interviews = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          startTime: data.startTime?.toDate?.() || data.startTime,
          endTime: data.endTime?.toDate?.() || data.endTime
        });
      });

      console.log(`✅ Encontradas ${interviews.length} entrevistas para o usuário`);
      return {
        success: true,
        data: interviews,
        count: interviews.length
      };

    } catch (error) {
      console.error('❌ Erro ao buscar entrevistas:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Buscar detalhes de uma entrevista específica
  async getInterviewDetails(interviewId) {
    try {
      console.log('🔍 Buscando detalhes da entrevista:', interviewId);
      
      if (!interviewId) {
        throw new Error('ID da entrevista é obrigatório');
      }
      
      const interviewDoc = await getDoc(doc(this.db, this.interviewsCollection, interviewId));
      
      if (!interviewDoc.exists()) {
        throw new Error('Entrevista não encontrada');
      }

      const responsesQuery = query(
        collection(this.db, this.responsesCollection),
        where('interviewId', '==', interviewId)
      );

      const responsesSnapshot = await getDocs(responsesQuery);
      const responseDetails = responsesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt
        };
      });

      const interviewData = interviewDoc.data();
      
      console.log('✅ Detalhes da entrevista encontrados com sucesso');
      return {
        success: true,
        data: {
          interview: {
            id: interviewDoc.id,
            ...interviewData,
            createdAt: interviewData.createdAt?.toDate?.() || interviewData.createdAt,
            updatedAt: interviewData.updatedAt?.toDate?.() || interviewData.updatedAt,
            startTime: interviewData.startTime?.toDate?.() || interviewData.startTime,
            endTime: interviewData.endTime?.toDate?.() || interviewData.endTime
          },
          responses: responseDetails
        }
      };

    } catch (error) {
      console.error('❌ Erro ao buscar detalhes da entrevista:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Atualizar status da entrevista
  async updateInterviewStatus(interviewId, status, additionalData = {}) {
    try {
      console.log('🔄 Atualizando status da entrevista:', interviewId, 'para:', status);
      
      if (!interviewId) {
        throw new Error('ID da entrevista é obrigatório');
      }

      if (!status) {
        throw new Error('Status é obrigatório');
      }
      
      const interviewRef = doc(this.db, this.interviewsCollection, interviewId);
      
      const updateData = {
        status: String(status),
        updatedAt: serverTimestamp(),
        ...this.sanitizeForFirestore(additionalData)
      };
      
      await updateDoc(interviewRef, updateData);

      console.log('✅ Status da entrevista atualizado com sucesso');
      return {
        success: true,
        message: 'Status atualizado com sucesso',
        data: { interviewId, status, ...additionalData }
      };

    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao atualizar status da entrevista'
      };
    }
  }

  // Métodos auxiliares para cálculos - MANTIDOS COM VALIDAÇÃO
  calculateAverageEngagement(behaviorData) {
    if (!Array.isArray(behaviorData) || behaviorData.length === 0) return 0;
    
    try {
      const validData = behaviorData.filter(data => 
        data && 
        data.engagement && 
        typeof data.engagement.score === 'number' && 
        !isNaN(data.engagement.score) &&
        isFinite(data.engagement.score)
      );
      
      if (validData.length === 0) return 0;
      
      const sum = validData.reduce((acc, data) => acc + data.engagement.score, 0);
      const average = sum / validData.length;
      return Math.round(average * 100) / 100;
    } catch (error) {
      console.warn('Erro ao calcular engagement médio:', error);
      return 0;
    }
  }

  calculateAverageEyeContact(behaviorData) {
    if (!Array.isArray(behaviorData) || behaviorData.length === 0) return 0;
    
    try {
      const validData = behaviorData.filter(data => 
        data && 
        data.eyeContact && 
        typeof data.eyeContact.score === 'number' && 
        !isNaN(data.eyeContact.score) &&
        isFinite(data.eyeContact.score)
      );
      
      if (validData.length === 0) return 0;
      
      const sum = validData.reduce((acc, data) => acc + data.eyeContact.score, 0);
      const average = sum / validData.length;
      return Math.round(average * 100) / 100;
    } catch (error) {
      console.warn('Erro ao calcular contato visual médio:', error);
      return 0;
    }
  }

  calculateDominantExpressions(behaviorData) {
    if (!Array.isArray(behaviorData) || behaviorData.length === 0) return {};
    
    try {
      const expressionCounts = {};
      
      behaviorData.forEach(data => {
        if (data && data.expressions && typeof data.expressions === 'object') {
          const expressions = Object.keys(data.expressions);
          if (expressions.length > 0) {
            const dominant = expressions.reduce((a, b) => 
              (data.expressions[a] || 0) > (data.expressions[b] || 0) ? a : b
            );
            
            if (dominant && typeof dominant === 'string') {
              expressionCounts[dominant] = (expressionCounts[dominant] || 0) + 1;
            }
          }
        }
      });
      
      return expressionCounts;
    } catch (error) {
      console.warn('Erro ao calcular expressões dominantes:', error);
      return {};
    }
  }

  // Estatísticas gerais
  async getInterviewStats() {
    try {
      console.log('📊 Buscando estatísticas gerais...');
      
      const snapshot = await getDocs(collection(this.db, this.interviewsCollection));
      
      let totalInterviews = 0;
      let completedInterviews = 0;
      let totalQuestions = 0;
      let totalDuration = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        totalInterviews++;
        
        if (data.status === 'completed') {
          completedInterviews++;
        }
        
        totalQuestions += Number(data.totalQuestions) || 0;
        totalDuration += Number(data.duration) || 0;
      });

      const stats = {
        totalInterviews,
        completedInterviews,
        incompleteInterviews: totalInterviews - completedInterviews,
        completionRate: totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100 * 100) / 100 : 0,
        averageQuestionsPerInterview: totalInterviews > 0 ? Math.round((totalQuestions / totalInterviews) * 100) / 100 : 0,
        averageDuration: totalInterviews > 0 ? Math.round((totalDuration / totalInterviews) * 100) / 100 : 0,
        totalQuestions,
        totalDuration
      };

      console.log('✅ Estatísticas calculadas:', stats);
      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

// Exportar instância única (singleton)
export default new FirestoreService();