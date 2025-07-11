class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.shouldKeepListening = false; // Flag para controlar se deve continuar ouvindo
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    this.restartAttempts = 0;
    this.maxRestartAttempts = 10;
    this.restartDelay = 100; // ms
    
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

      // Reset restart attempts quando obtemos resultados
      this.restartAttempts = 0;

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
          this.shouldKeepListening = false; // Parar tentativas se permissão negada
          break;
        case 'no-speech':
          console.warn('Nenhuma fala detectada - continuando a ouvir...');
          // Não parar por falta de fala
          break;
        case 'audio-capture':
          console.warn('Erro de captura de áudio');
          break;
        case 'service-not-allowed':
          console.warn('Serviço não permitido');
          this.shouldKeepListening = false;
          break;
        default:
          console.warn('Erro desconhecido:', event.error);
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }

      // Não reiniciar se for erro de permissão ou serviço não permitido
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.shouldKeepListening = false;
        this.isListening = false;
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Reconhecimento de fala finalizado');
      
      // Reiniciar automaticamente se ainda devemos continuar ouvindo
      if (this.shouldKeepListening && this.restartAttempts < this.maxRestartAttempts) {
        console.log('Reiniciando reconhecimento automaticamente...');
        this.restartAttempts++;
        
        setTimeout(() => {
          if (this.shouldKeepListening) {
            this.startRecognition();
          }
        }, this.restartDelay);
      } else {
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.restartAttempts = 0; // Reset contador quando inicia com sucesso
      console.log('Reconhecimento de fala iniciado');
    };
  }

  startRecognition() {
    if (!this.recognition) {
      if (!this.initializeRecognition()) {
        return false;
      }
    }

    if (this.isListening) {
      return true; // Já está ouvindo
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error);
      return false;
    }
  }

  start() {
    if (!this.isSupported()) {
      console.warn('Speech Recognition não suportado neste navegador');
      return false;
    }

    // Definir que deve continuar ouvindo
    this.shouldKeepListening = true;
    this.restartAttempts = 0;

    // Resetar transcrições apenas no início
    if (!this.isListening) {
      this.finalTranscript = '';
      this.interimTranscript = '';
    }

    return this.startRecognition();
  }

  stop() {
    // Parar tentativas de reinicialização
    this.shouldKeepListening = false;

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
    this.shouldKeepListening = false;
    
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
    return this.isListening || this.shouldKeepListening;
  }

  // Método para verificar se está tentando manter ativo
  isKeepingAlive() {
    return this.shouldKeepListening;
  }

  // Método para definir configurações de restart
  setRestartConfig(maxAttempts = 10, delay = 100) {
    this.maxRestartAttempts = maxAttempts;
    this.restartDelay = delay;
  }

  destroy() {
    this.shouldKeepListening = false;
    this.stop();
    this.recognition = null;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
  }
}

export default SpeechRecognitionService;