class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    
    // Inicialização será feita quando start() for chamado
  }

  static isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  isSupported() {
    return SpeechRecognitionService.isSupported();
  }

  initializeRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.warn('Speech Recognition API não disponível neste navegador');
        return false;
      }

      this.recognition = new SpeechRecognition();
      
      // Configurações do reconhecimento
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'pt-BR';
      this.recognition.maxAlternatives = 1;

      // Configurar event listeners
      this.setupEventListeners();
      return true;

    } catch (error) {
      console.error('Erro ao inicializar reconhecimento de fala:', error);
      return false;
    }
  }

  setupEventListeners() {
    if (!this.recognition) return;

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = this.finalTranscript;

      // Processar resultados
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      this.finalTranscript = finalTranscript;
      this.interimTranscript = interimTranscript;

      // Chamar callback se definido
      if (this.onResultCallback) {
        this.onResultCallback({
          final: finalTranscript,
          interim: interimTranscript,
          transcript: finalTranscript + interimTranscript
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de fala:', event.error);
      
      // Tratar diferentes tipos de erro
      switch (event.error) {
        case 'network':
          console.warn('Erro de rede no reconhecimento de fala');
          break;
        case 'not-allowed':
          console.warn('Permissão de microfone negada');
          break;
        case 'no-speech':
          console.warn('Nenhuma fala detectada');
          break;
        default:
          console.warn('Erro desconhecido:', event.error);
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Reconhecimento de fala finalizado');
      
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Reconhecimento de fala iniciado');
    };
  }

  start() {
    if (!this.isSupported()) {
      console.warn('Speech Recognition não suportado neste navegador');
      return false;
    }

    // Inicializar se ainda não foi feito
    if (!this.recognition && !this.initializeRecognition()) {
      return false;
    }

    if (this.isListening) {
      console.warn('Reconhecimento já está ativo');
      return false;
    }

    try {
      // Resetar transcrições
      this.finalTranscript = '';
      this.interimTranscript = '';
      
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error);
      return false;
    }
  }

  stop() {
    if (!this.recognition || !this.isListening) {
      return this.finalTranscript;
    }

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Erro ao parar reconhecimento:', error);
    }

    return this.finalTranscript;
  }

  abort() {
    if (!this.recognition) return;

    try {
      this.recognition.abort();
      this.isListening = false;
    } catch (error) {
      console.error('Erro ao abortar reconhecimento:', error);
    }
  }

  setOnResult(callback) {
    this.onResultCallback = callback;
  }

  setOnError(callback) {
    this.onErrorCallback = callback;
  }

  setOnEnd(callback) {
    this.onEndCallback = callback;
  }

  getCurrentTranscript() {
    return this.finalTranscript + this.interimTranscript;
  }

  getFinalTranscript() {
    return this.finalTranscript;
  }

  getInterimTranscript() {
    return this.interimTranscript;
  }

  isActive() {
    return this.isListening;
  }

  destroy() {
    this.stop();
    this.recognition = null;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
  }
}

export default SpeechRecognitionService;