import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const CandidaturaService = {
  /**
   * Verifica se a avaliação está desabilitada para o usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Status da avaliação
   */
  async checkAvaliacaoStatus(userId) {
    try {
      if (!userId) {
        throw new Error("User ID é obrigatório");
      }

      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Se o documento não existe, criar com status inicial
        await setDoc(userDocRef, {
          avaliacaoStatus: {
            disabled: false,
            disabledUntil: null,
            completedAt: null,
            attempts: 0
          }
        }, { merge: true });
        
        return {
          disabled: false,
          disabledUntil: null,
          timeRemaining: null
        };
      }

      const userData = userDoc.data();
      const avaliacaoData = userData.avaliacaoStatus;
      
      if (!avaliacaoData) {
        // Se não tem dados de avaliação, criar estrutura inicial
        await updateDoc(userDocRef, {
          'avaliacaoStatus.disabled': false,
          'avaliacaoStatus.disabledUntil': null,
          'avaliacaoStatus.completedAt': null,
          'avaliacaoStatus.attempts': 0
        });
        
        return {
          disabled: false,
          disabledUntil: null,
          timeRemaining: null
        };
      }

      if (avaliacaoData.disabledUntil) {
        const disabledUntil = new Date(avaliacaoData.disabledUntil);
        const now = new Date();
        
        if (now < disabledUntil) {
          return {
            disabled: true,
            disabledUntil: disabledUntil,
            timeRemaining: disabledUntil - now,
            completedAt: avaliacaoData.completedAt,
            attempts: avaliacaoData.attempts || 0
          };
        } else {
          // Período expirou, reabilitar
          await this.enableAvaliacao(userId);
          return {
            disabled: false,
            disabledUntil: null,
            timeRemaining: null
          };
        }
      }

      return {
        disabled: false,
        disabledUntil: null,
        timeRemaining: null,
        attempts: avaliacaoData.attempts || 0
      };
    } catch (error) {
      console.error("Erro ao verificar status da avaliação:", error);
      throw error;
    }
  },

  /**
   * Desabilita a avaliação por 3 meses
   * @param {string} userId - ID do usuário
   * @returns {Promise<void>}
   */
  async disableAvaliacaoFor3Months(userId) {
    try {
      if (!userId) {
        throw new Error("User ID é obrigatório");
      }

      const userDocRef = doc(db, "users", userId);
      const disabledUntil = new Date();
      disabledUntil.setMonth(disabledUntil.getMonth() + 3);
      
      // Buscar dados atuais para incrementar tentativas
      const currentDoc = await getDoc(userDocRef);
      let currentAttempts = 0;
      
      if (currentDoc.exists()) {
        const userData = currentDoc.data();
        currentAttempts = userData.avaliacaoStatus?.attempts || 0;
      }

      await updateDoc(userDocRef, {
        'avaliacaoStatus.disabled': true,
        'avaliacaoStatus.disabledUntil': disabledUntil.toISOString(),
        'avaliacaoStatus.completedAt': new Date().toISOString(),
        'avaliacaoStatus.attempts': currentAttempts + 1
      });

      console.log(`Avaliação desabilitada até: ${disabledUntil.toLocaleDateString()}`);
      
      return {
        disabledUntil: disabledUntil,
        attempts: currentAttempts + 1
      };
    } catch (error) {
      console.error("Erro ao desabilitar avaliação:", error);
      throw error;
    }
  },

  /**
   * Reabilita a avaliação manualmente
   * @param {string} userId - ID do usuário
   * @returns {Promise<void>}
   */
  async enableAvaliacao(userId) {
    try {
      if (!userId) {
        throw new Error("User ID é obrigatório");
      }

      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        'avaliacaoStatus.disabled': false,
        'avaliacaoStatus.disabledUntil': null
      });

      console.log("Avaliação reabilitada para o usuário:", userId);
    } catch (error) {
      console.error("Erro ao reabilitar avaliação:", error);
      throw error;
    }
  },

  /**
   * Obtém histórico de avaliações do usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Histórico de avaliações
   */
  async getAvaliacaoHistory(userId) {
    try {
      if (!userId) {
        throw new Error("User ID é obrigatório");
      }

      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return {
          attempts: 0,
          lastCompleted: null,
          nextAvailable: null
        };
      }

      const userData = userDoc.data();
      const avaliacaoData = userData.avaliacaoStatus;
      
      if (!avaliacaoData) {
        return {
          attempts: 0,
          lastCompleted: null,
          nextAvailable: null
        };
      }

      let nextAvailable = null;
      if (avaliacaoData.disabledUntil) {
        const disabledUntil = new Date(avaliacaoData.disabledUntil);
        const now = new Date();
        
        if (now < disabledUntil) {
          nextAvailable = disabledUntil;
        }
      }

      return {
        attempts: avaliacaoData.attempts || 0,
        lastCompleted: avaliacaoData.completedAt ? new Date(avaliacaoData.completedAt) : null,
        nextAvailable: nextAvailable,
        disabled: avaliacaoData.disabled || false
      };
    } catch (error) {
      console.error("Erro ao obter histórico de avaliações:", error);
      throw error;
    }
  },

  /**
   * Formata o tempo restante em formato legível
   * @param {number} milliseconds - Tempo em milissegundos
   * @returns {string} Tempo formatado
   */
  formatTimeRemaining(milliseconds) {
    const totalDays = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const totalMinutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (totalDays > 30) {
      const months = Math.floor(totalDays / 30);
      const remainingDays = totalDays % 30;
      return `${months} ${months === 1 ? 'mês' : 'meses'}${remainingDays > 0 ? ` e ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}` : ''}`;
    } else if (totalDays > 0) {
      return `${totalDays} ${totalDays === 1 ? 'dia' : 'dias'}${totalHours > 0 ? ` e ${totalHours} ${totalHours === 1 ? 'hora' : 'horas'}` : ''}`;
    } else if (totalHours > 0) {
      return `${totalHours} ${totalHours === 1 ? 'hora' : 'horas'}${totalMinutes > 0 ? ` e ${totalMinutes} ${totalMinutes === 1 ? 'minuto' : 'minutos'}` : ''}`;
    } else {
      return `${totalMinutes} ${totalMinutes === 1 ? 'minuto' : 'minutos'}`;
    }
  }
};