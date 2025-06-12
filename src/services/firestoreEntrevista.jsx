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
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj
        .map(item => this.sanitizeForFirestore(item))
        .filter(item => item !== undefined); // Remove undefined items
    }

    // Para objetos, processar recursivamente
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedValue = this.sanitizeForFirestore(value);
      if (sanitizedValue !== undefined) {
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
    
    const sanitized = this.sanitizeForFirestore(responseData || {});
    
    return {
      questions: Array.isArray(sanitized.questions) ? 
        sanitized.questions.map(q => this.sanitizeForFirestore(q)) : [],
      responses: Array.isArray(sanitized.responses) ? 
        sanitized.responses.map(r => this.sanitizeForFirestore(r)) : [],
      behaviorData: Array.isArray(sanitized.behaviorData) ? 
        sanitized.behaviorData.map(b => this.sanitizeForFirestore(b)) : [],
      cvContent: sanitized.cvContent || null
    };
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

      // PASSO 1: Normalizar dados do usuário
      const normalizedData = this.normalizeUserData(interviewData);
      
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

   async saveInterviewResponses(interviewId, responseData) {
    try {
      console.log('💾 Salvando respostas para entrevista:', interviewId);
      
      if (!interviewId) {
        throw new Error('ID da entrevista é obrigatório');
      }

      // SANITIZAR dados de entrada
      const sanitizedResponseData = this.sanitizeResponseData(responseData);
      const { questions, responses, behaviorData, cvContent } = sanitizedResponseData;

      // Construir documento de respostas
      const responsesDoc = {
        interviewId: String(interviewId),
        questions: questions,
        responses: responses,
        behaviorData: behaviorData,
        cvContent: cvContent,
        analysisMetadata: {
          totalBehaviorDataPoints: behaviorData.length,
          avgEngagement: this.calculateAverageEngagement(behaviorData) || 0,
          avgEyeContact: this.calculateAverageEyeContact(behaviorData) || 0,
          dominantExpressions: this.calculateDominantExpressions(behaviorData) || {},
          questionsCount: questions.length,
          responsesCount: responses.length
        },
        createdAt: serverTimestamp()
      };

      // SANITIZAR documento final
      const finalResponsesDoc = this.sanitizeForFirestore(responsesDoc);

      console.log('📝 Documento de respostas sanitizado:', {
        interviewId: finalResponsesDoc.interviewId,
        questionsCount: finalResponsesDoc.questions?.length || 0,
        responsesCount: finalResponsesDoc.responses?.length || 0,
        behaviorDataPoints: finalResponsesDoc.behaviorData?.length || 0
      });

      const responsesRef = collection(this.db, this.responsesCollection);
      const responseDocRef = await addDoc(responsesRef, finalResponsesDoc);

      console.log('✅ Respostas salvas com ID:', responseDocRef.id);
      
      return {
        success: true,
        responseId: responseDocRef.id,
        message: 'Respostas salvas com sucesso'
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