import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Square, SkipForward, 
  Clock, ArrowLeft, PhoneOff, 
  MoreVertical, Users, MessageCircle,
  Eye, Smile, TrendingUp
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function Avaliacao() {
  const { User } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [responses, setResponses] = useState([]);
  const [stream, setStream] = useState(null);
  const [showChat, setShowChat] = useState(true);
  
  // Estados para análise facial
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [behaviorData, setBehaviorData] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const analysisInterval = useRef(null);

  // Perguntas de exemplo
  const questions = [
    {
      id: 1,
      text: "Fale sobre sua experiência com desenvolvimento React e como você estrutura componentes complexos.",
      category: "Técnica",
      timeLimit: 120
    },
    {
      id: 2,
      text: "Descreva uma situação desafiadora que você enfrentou em um projeto anterior e como a resolveu.",
      category: "Comportamental",
      timeLimit: 150
    },
    {
      id: 3,
      text: "Como você se mantém atualizado com as novas tecnologias e tendências do mercado?",
      category: "Desenvolvimento Profissional",
      timeLimit: 90
    },
    {
      id: 4,
      text: "Explique como você trabalharia em equipe para entregar um projeto com prazo apertado.",
      category: "Trabalho em Equipe",
      timeLimit: 120
    },
    {
      id: 5,
      text: "Quais são seus objetivos profissionais para os próximos 2 anos?",
      category: "Carreira",
      timeLimit: 100
    }
  ];

  // Carregar modelos do Face-api.js
  useEffect(() => {
    const loadFaceApiModels = async () => {
      try {
        // Simulando carregamento dos modelos (em produção, carregaria os arquivos reais)
        console.log('Carregando modelos Face-api.js...');
     
        
        // Simulando carregamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setFaceApiLoaded(true);
        console.log('Modelos Face-api.js carregados com sucesso!');
      } catch (error) {
        console.error('Erro ao carregar modelos Face-api.js:', error);
      }
    };

    loadFaceApiModels();
  }, []);

  // Análise facial contínua
  const startFaceAnalysis = () => {
    if (!faceApiLoaded || !videoRef.current) return;

    analysisInterval.current = setInterval(async () => {
      try {
        // Simulando detecção facial (em produção usaria face-api.js real)
        const mockAnalysis = {
          timestamp: Date.now(),
          faceDetected: Math.random() > 0.1, // 90% chance de detectar rosto
          expressions: {
            neutral: Math.random() * 0.6 + 0.2,
            happy: Math.random() * 0.3,
            sad: Math.random() * 0.1,
            angry: Math.random() * 0.05,
            fearful: Math.random() * 0.05,
            disgusted: Math.random() * 0.05,
            surprised: Math.random() * 0.1
          },
          eyeContact: {
            score: Math.random() * 0.8 + 0.2, // 20-100% contato visual
            looking: Math.random() > 0.3
          },
          engagement: {
            score: Math.random() * 0.7 + 0.3, // 30-100% engajamento
            stability: Math.random() * 0.5 + 0.5
          }
        };

        setCurrentAnalysis(mockAnalysis);
        setBehaviorData(prev => [...prev.slice(-19), mockAnalysis]); // Mantém últimos 20 registros

      } catch (error) {
        console.error('Erro na análise facial:', error);
      }
    }, 2000); // Análise a cada 2 segundos
  };

  const stopFaceAnalysis = () => {
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
      analysisInterval.current = null;
    }
  };

    // Função para obter a especialização do usuário
  const getUserSpecialization = () => {
    // Verificar se o usuário tem especialização definida
    if (User?.specialization && User.specialization !== '') {
      return User.specialization;
    }
    
    // Fallback para área de atuação se não tiver especialização
    if (User?.area && User.area !== '') {
      return User.area;
    }
    
    // Fallback padrão
    return 'Desenvolvedor';
  };

  // Prevenir fechamento da aba durante a entrevista
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (interviewStarted && !isInterviewComplete()) {
        e.preventDefault();
        e.returnValue = 'Você tem certeza que deseja sair? Sua entrevista será perdida.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [interviewStarted]);

  // Timer para cada pergunta
  useEffect(() => {
    let timer;
    if (interviewStarted && timeLeft > 0 && !isInterviewComplete()) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(timer);
  }, [timeLeft, interviewStarted]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      stopFaceAnalysis();
    };
  }, [stream]);

  // Inicializar câmera e microfone
  const initializeMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      return mediaStream;
    } catch (error) {
      console.error('Erro ao acessar mídia:', error);
      alert('Erro ao acessar câmera/microfone. Verifique as permissões.');
    }
  };

  // Iniciar gravação
  const startRecording = async () => {
    try {
      const mediaStream = stream || await initializeMedia();
      
      if (!mediaStream) return;

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, {
          type: 'video/webm'
        });
        
        console.log('Gravação salva:', blob);
        simulateTranscription(blob);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      
      // Iniciar análise facial
      startFaceAnalysis();
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopFaceAnalysis();
    }
  };

  // Simular transcrição
  const simulateTranscription = (blob) => {
    const questionBehaviorData = behaviorData.filter(data => 
      data.timestamp >= Date.now() - (questions[currentQuestion].timeLimit * 1000)
    );

    // Calcular métricas da pergunta
    const avgEngagement = questionBehaviorData.reduce((acc, curr) => 
      acc + (curr.engagement?.score || 0), 0) / questionBehaviorData.length;
    
    const avgEyeContact = questionBehaviorData.reduce((acc, curr) => 
      acc + (curr.eyeContact?.score || 0), 0) / questionBehaviorData.length;
    
    const dominantExpression = questionBehaviorData.reduce((acc, curr) => {
      const expressions = curr.expressions || {};
      const maxExpr = Object.keys(expressions).reduce((a, b) => 
        expressions[a] > expressions[b] ? a : b
      );
      acc[maxExpr] = (acc[maxExpr] || 0) + 1;
      return acc;
    }, {});

    const mockTranscription = "Esta é uma transcrição simulada da resposta do candidato...";
    
    setResponses(prev => [...prev, {
      questionId: questions[currentQuestion].id,
      question: questions[currentQuestion].text,
      transcription: mockTranscription,
      duration: questions[currentQuestion].timeLimit - timeLeft,
      timestamp: new Date().toISOString(),
      behaviorAnalysis: {
        avgEngagement: avgEngagement || 0,
        avgEyeContact: avgEyeContact || 0,
        dominantExpression: Object.keys(dominantExpression)[0] || 'neutral',
        dataPoints: questionBehaviorData.length
      }
    }]);
  };

  // Iniciar entrevista
  const startInterview = async () => {
    await initializeMedia();
    setInterviewStarted(true);
    setTimeLeft(questions[0].timeLimit);
    startRecording();
  };

  // Próxima pergunta
  const handleNextQuestion = () => {
    stopRecording();
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(questions[currentQuestion + 1].timeLimit);
      setTimeout(() => startRecording(), 1000);
    } else {
      finishInterview();
    }
  };

  // Finalizar entrevista
  const finishInterview = () => {
    stopRecording();
    setInterviewStarted(false);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    console.log('Entrevista finalizada. Respostas:', responses);
    console.log('Dados comportamentais:', behaviorData);
    alert('Entrevista finalizada! Suas respostas estão sendo processadas.');
  };

  // Voltar para tela inicial
  const handleGoBack = () => {
    if (interviewStarted) {
      const confirmExit = window.confirm('Tem certeza que deseja sair? Sua entrevista será perdida.');
      if (!confirmExit) return;
      
      stopRecording();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setInterviewStarted(false);
    setCurrentQuestion(0);
    setTimeLeft(120);
    setResponses([]);
    setBehaviorData([]);
  };

  // Funções utilitárias
  const isInterviewComplete = () => currentQuestion >= questions.length;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getEngagementColor = (score) => {
    if (score >= 0.7) return 'text-green-400';
    if (score >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {!interviewStarted ? (
        /* Tela inicial */
        <div className="h-full flex items-center justify-center p-4">
          <div className="max-w-sm w-full">
            <div className="text-center mb-6">
              <h1 className="text-xl font-medium text-white mb-2">Pronto para participar?</h1>
              <p className="text-gray-300 text-sm">Entrevista Técnica - {getUserSpecialization()}</p>
            </div>
            
            {/* Status Face-api.js */}
            <div className="mb-4">
              <div className={`text-center p-2 rounded-lg ${faceApiLoaded ? 'bg-green-900/50 border border-green-500' : 'bg-yellow-900/50 border border-yellow-500'}`}>
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${faceApiLoaded ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></div>
                  <span className="text-xs">
                    {faceApiLoaded ? 'Análise facial ativada' : 'Carregando análise facial...'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Preview do vídeo */}
            <div className="relative mb-4">
              <div className="w-full h-48 bg-gray-800 rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
                <div className="absolute bottom-2 left-2 bg-gray-900/80 rounded-full px-2 py-1">
                  <span className="text-white text-xs">Você</span>
                </div>
              </div>
            </div>

            {/* Informações da entrevista */}
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <h3 className="text-white font-medium mb-2 text-sm">Detalhes da Entrevista</h3>
              <div className="space-y-1 text-xs text-gray-300">
                <div>• {questions.length} perguntas baseadas no seu currículo</div>
                <div>• Tempo médio: 2 minutos por pergunta</div>
                <div>• Suas respostas serão gravadas e transcritas</div>
                <div>• Análise comportamental com IA</div>
                <div>• Mantenha contato visual com a câmera</div>
              </div>
            </div>

            <button
              onClick={startInterview}
              disabled={!faceApiLoaded}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{faceApiLoaded ? 'Participar agora' : 'Aguarde...'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Interface da entrevista */
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGoBack}
                className="p-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-white font-mono text-sm">{formatTime(timeLeft)}</span>
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-white font-medium text-sm">Entrevista Técnica</h1>
              <p className="text-gray-400 text-xs">Pergunta {currentQuestion + 1} de {questions.length}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Indicadores de análise facial */}
              {currentAnalysis && (
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`flex items-center space-x-1 ${currentAnalysis.faceDetected ? 'text-green-400' : 'text-red-400'}`}>
                    <Eye className="w-3 h-3" />
                    <span>{currentAnalysis.eyeContact?.looking ? 'Olhando' : 'Desviado'}</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getEngagementColor(currentAnalysis.engagement?.score || 0)}`}>
                    <TrendingUp className="w-3 h-3" />
                    <span>{Math.round((currentAnalysis.engagement?.score || 0) * 100)}%</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-xs">1</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Área do vídeo */}
            <div className="flex-1 relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              
              {/* Nome do participante */}
              <div className="absolute bottom-3 left-3 bg-gray-900/80 rounded px-2 py-1">
                <span className="text-white text-xs">Você</span>
              </div>
              
              {/* Status de gravação */}
              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center space-x-2 bg-red-600 rounded-full px-2 py-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium">REC</span>
                </div>
              )}

              {/* Barra de progresso */}
              <div className="absolute top-3 right-3 w-24">
                <div className="bg-gray-800/80 rounded-full p-2">
                  <div className="flex items-center justify-between text-xs text-white mb-1">
                    <span className="text-xs">Progresso</span>
                    <span className="text-xs">{Math.round(getProgressPercentage())}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Painel lateral */}
            {showChat && (
              <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
                <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-white font-medium text-sm">Pergunta Atual</h3>
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${showAnalytics ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    Analytics
                  </button>
                </div>
                
                <div className="flex-1 p-3 overflow-y-auto">
                  {!showAnalytics ? (
                    <>
                      <div className="bg-gray-700 rounded-lg p-3 mb-3">
                        <div className="text-blue-400 text-xs font-medium mb-2 uppercase">
                          {questions[currentQuestion]?.category}
                        </div>
                        <p className="text-white text-sm leading-relaxed">
                          {questions[currentQuestion]?.text}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-gray-300 text-sm">
                          <div className="flex justify-between items-center">
                            <span>Tempo restante:</span>
                            <span className={`font-mono ${timeLeft <= 30 ? 'text-red-400' : 'text-white'}`}>
                              {formatTime(timeLeft)}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleNextQuestion}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2"
                        >
                          <span>
                            {currentQuestion < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Entrevista'}
                          </span>
                          <SkipForward className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Painel de Analytics */
                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-sm">Análise em Tempo Real</h4>
                      
                      {currentAnalysis ? (
                        <>
                          {/* Contato Visual */}
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-300 text-xs">Contato Visual</span>
                              <span className={`text-xs font-medium ${getEngagementColor(currentAnalysis.eyeContact?.score || 0)}`}>
                                {Math.round((currentAnalysis.eyeContact?.score || 0) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(currentAnalysis.eyeContact?.score || 0) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Engajamento */}
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-300 text-xs">Engajamento</span>
                              <span className={`text-xs font-medium ${getEngagementColor(currentAnalysis.engagement?.score || 0)}`}>
                                {Math.round((currentAnalysis.engagement?.score || 0) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(currentAnalysis.engagement?.score || 0) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Expressões */}
                          <div className="bg-gray-700 rounded-lg p-3">
                            <span className="text-gray-300 text-xs block mb-2">Expressão Dominante</span>
                            <div className="space-y-1">
                              {Object.entries(currentAnalysis.expressions || {})
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 3)
                                .map(([expr, value]) => (
                                  <div key={expr} className="flex items-center justify-between">
                                    <span className="text-gray-300 text-xs capitalize">{expr}</span>
                                    <span className="text-white text-xs">{Math.round(value * 100)}%</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-gray-400 text-sm">
                          <div className="animate-pulse">Analisando...</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Instruções */}
                <div className="p-3 border-t border-gray-700">
                  <h4 className="text-white font-medium mb-2 text-sm">Instruções:</h4>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>• Responda de forma clara e objetiva</li>
                    <li>• Use exemplos práticos quando possível</li>
                    <li>• Mantenha contato visual com a câmera</li>
                    <li>• Clique em "Próxima" quando terminar</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Controles inferiores */}
          <div className="p-3 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-between">
              {/* Info da reunião */}
              <div className="flex items-center space-x-4">
                <div className="text-gray-300 text-sm">
                  <div className="font-mono text-xs">
                    {formatTime((questions[currentQuestion]?.timeLimit || 120) - timeLeft)}
                  </div>
                </div>
              </div>

              {/* Controles centrais */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={finishInterview}
                  className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all"
                >
                  <PhoneOff className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Controles adicionais */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    showChat ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                
                <button className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-all">
                  <MoreVertical className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}