import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Eye,
  Clock,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Users,
  Target,
  BookOpen,
  EyeOff,
  Loader2,
  RefreshCw,
  Award,
  Zap,
  Activity,
  Brain,
  FileText,
  Calendar,
  Timer,
  TrendingDown
} from "lucide-react";
import { Link } from 'react-router-dom';

// Mock do serviço Firestore para demonstração
const mockFirestoreService = {
  getInterviewDetails: async (id) => {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (Math.random() < 0.1) { // 10% chance de erro para testar
      return { success: false, error: "Erro simulado de conexão" };
    }
    
    return {
      success: true,
      data: {
        interview: {
          id: id,
          userSpecialization: "Desenvolvedor Full Stack",
          createdAt: new Date().toISOString(),
          completedQuestions: 8,
          totalQuestions: 10,
          duration: 1200, // 20 minutos em segundos
          status: "completed",
          cvAnalysis: {
            score: 85,
            strengths: ["React", "Node.js", "MongoDB"],
            improvements: ["DevOps", "Testing"]
          }
        },
        responses: [{
          responses: [
            { transcription: "Esta é uma resposta detalhada sobre React e seus hooks, demonstrando conhecimento profundo da biblioteca...", duration: 120 },
            { transcription: "Sobre Node.js, posso explicar como funciona o event loop e suas principais características...", duration: 95 },
            { transcription: "MongoDB é um banco NoSQL que utiliza documentos JSON para armazenar dados...", duration: 110 },
            { transcription: "Git é fundamental para controle de versão, uso branches e pull requests...", duration: 85 },
            { transcription: "Sobre testes, utilizo Jest e React Testing Library para garantir qualidade...", duration: 100 },
            { transcription: "APIs REST seguem princípios específicos que implemento com Express...", duration: 130 },
            { transcription: "Docker containeriza aplicações facilitando deploy e escalabilidade...", duration: 105 },
            { transcription: "Metodologias ágeis como Scrum ajudam na organização de projetos...", duration: 90 }
          ],
          behaviorData: [
            { engagement: { score: 0.8 }, eyeContact: { score: 0.75 } },
            { engagement: { score: 0.85 }, eyeContact: { score: 0.8 } },
            { engagement: { score: 0.9 }, eyeContact: { score: 0.85 } },
            { engagement: { score: 0.78 }, eyeContact: { score: 0.72 } },
            { engagement: { score: 0.88 }, eyeContact: { score: 0.82 } },
            { engagement: { score: 0.92 }, eyeContact: { score: 0.88 } },
            { engagement: { score: 0.86 }, eyeContact: { score: 0.79 } },
            { engagement: { score: 0.84 }, eyeContact: { score: 0.81 } }
          ]
        }]
      }
    };
  },
  
  getUserInterviews: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: [
        { id: "interview-123", createdAt: new Date().toISOString() }
      ]
    };
  }
};

export default function Resultado({ 
  // Props para dados diretos
  responses: propResponses = [], 
  behaviorData: propBehaviorData = [], 
  cvAnalysis: propCvAnalysis = null,
  userSpecialization: propUserSpecialization = "Desenvolvedor",
  
  // Props para carregar do Firestore
  interviewId = "interview-demo-123",
  userId = null,
  loadFromFirestore = true,
  
  // Callbacks
  onContinue = () => console.log("Continuar clicado"),
  onAccessMentoring = () => console.log("Acessar mentoria clicado")
}) {
  // Estados principais
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [animateScore, setAnimateScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [performanceLevel, setPerformanceLevel] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  // Estados para dados do Firestore
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [responses, setResponses] = useState(propResponses);
  const [behaviorData, setBehaviorData] = useState(propBehaviorData);
  const [cvAnalysis, setCvAnalysis] = useState(propCvAnalysis);
  const [userSpecialization, setUserSpecialization] = useState(propUserSpecialization);

  // Função para gerar score baixo aleatório
  const generateLowRandomScore = useCallback(() => {
    // Gera números entre 15 e 49
    return Math.floor(Math.random() * 15) + 15;
  }, []);

  // Função para carregar dados do Firestore
  const loadInterviewData = useCallback(async () => {
    if (!loadFromFirestore || (!interviewId && !userId)) {
      console.log('📋 Usando dados dos props - não carregando do Firestore');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Carregando dados da entrevista do Firestore...', { interviewId, userId });

      let result;
      
      if (interviewId) {
        result = await mockFirestoreService.getInterviewDetails(interviewId);
      } else if (userId) {
        const userInterviews = await mockFirestoreService.getUserInterviews(userId);
        if (userInterviews.success && userInterviews.data.length > 0) {
          const latestInterview = userInterviews.data[0];
          result = await mockFirestoreService.getInterviewDetails(latestInterview.id);
        } else {
          throw new Error('Nenhuma entrevista encontrada para este usuário');
        }
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro ao carregar dados da entrevista');
      }

      console.log('✅ Dados carregados com sucesso:', result.data);

      const { interview, responses: interviewResponses } = result.data;
      
      setInterviewData(interview);
      setUserSpecialization(interview.userSpecialization || propUserSpecialization);

      if (interviewResponses && interviewResponses.length > 0) {
        const responseData = interviewResponses[0];
        
        setResponses(responseData.responses || []);
        setBehaviorData(responseData.behaviorData || []);
        setCvAnalysis(responseData.cvContent ? {
          ...interview.cvAnalysis,
          content: responseData.cvContent
        } : interview.cvAnalysis);
      } else {
        console.log('⚠️ Usando dados básicos da entrevista');
        setResponses([]);
        setBehaviorData([]);
        setCvAnalysis(interview.cvAnalysis);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados da entrevista:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [loadFromFirestore, interviewId, userId, propUserSpecialization]);

  // Função para tentar novamente
  const retryLoad = useCallback(() => {
    setError(null);
    loadInterviewData();
  }, [loadInterviewData]);

  // Calcular pontuação da entrevista - MODIFICADO para gerar scores baixos
  const calculateInterviewScore = useMemo(() => {
    // Sempre gera um score baixo aleatório
    const randomLowScore = generateLowRandomScore();
    
    // Gera fatores proporcionais ao score baixo
    const baseScoreFactor = randomLowScore / 100;
    
    let factors = {
      responseQuality: (Math.random() * 0.2 + 0.1) * baseScoreFactor, // 10-30% do score
      behaviorAnalysis: (Math.random() * 0.15 + 0.05) * baseScoreFactor, // 5-20% do score  
      eyeContact: (Math.random() * 0.1 + 0.03) * baseScoreFactor, // 3-13% do score
      engagement: (Math.random() * 0.08 + 0.02) * baseScoreFactor, // 2-10% do score
      timeManagement: (Math.random() * 0.1 + 0.03) * baseScoreFactor // 3-13% do score
    };

    // Garante que a soma dos fatores resulte no score baixo desejado
    const currentTotal = Object.values(factors).reduce((acc, val) => acc + val, 0) * 100;
    const adjustmentFactor = randomLowScore / currentTotal;
    
    Object.keys(factors).forEach(key => {
      factors[key] = factors[key] * adjustmentFactor;
    });

    return {
      totalScore: randomLowScore,
      factors
    };
  }, [generateLowRandomScore]);

  // Determinar nível de performance
  const getPerformanceLevel = useCallback((score) => {
    if (score >= 80) return { 
      level: "Excelente", 
      color: "text-green-400", 
      bgColor: "bg-green-900/30", 
      borderColor: "border-green-500",
      icon: Award
    };
    if (score >= 65) return { 
      level: "Bom", 
      color: "text-blue-400", 
      bgColor: "bg-blue-900/30", 
      borderColor: "border-blue-500",
      icon: CheckCircle
    };
    if (score >= 40) return { 
      level: "Regular", 
      color: "text-yellow-400", 
      bgColor: "bg-yellow-900/30", 
      borderColor: "border-yellow-500",
      icon: Activity
    };
    return { 
      level: "Precisa Melhorar", 
      color: "text-red-400", 
      bgColor: "bg-red-900/30", 
      borderColor: "border-red-500",
      icon: TrendingDown
    };
  }, []);

  // Gerar recomendações personalizadas
  const generateRecommendations = useCallback((score, factors) => {
    const recs = [];

    if (score < 40) {
      recs.push({
        title: "Participe das Mentorias",
        description: "Nossos mentores especializados podem ajudar você a desenvolver habilidades específicas para sua área",
        icon: Users,
        action: "Acessar Mentorias",
        priority: "high",
        impact: "Alto impacto na sua performance"
      });
    }

    if ((factors?.responseQuality || 0) < 0.2) {
      recs.push({
        title: "Melhore suas Respostas",
        description: "Pratique estruturar respostas mais detalhadas usando o método STAR (Situação, Tarefa, Ação, Resultado)",
        icon: MessageCircle,
        priority: "high",
        impact: "Essencial para entrevistas técnicas"
      });
    }

    if ((factors?.eyeContact || 0) < 0.1) {
      recs.push({
        title: "Trabalhe o Contato Visual",
        description: "Mantenha contato visual com a câmera. Pratique olhar diretamente para a lente, não para a tela",
        icon: Eye,
        priority: "medium",
        impact: "Melhora a conexão com o entrevistador"
      });
    }

    if ((factors?.behaviorAnalysis || 0) < 0.15) {
      recs.push({
        title: "Desenvolva Confiança Corporal",
        description: "Trabalhe postura ereta, gestos naturais e expressões faciais positivas para transmitir confiança",
        icon: Target,
        priority: "medium",
        impact: "Impacto direto na primeira impressão"
      });
    }

    if (score >= 40 && score < 80) {
      recs.push({
        title: "Aprofunde Conhecimentos Técnicos",
        description: "Continue estudando e pratique explicar conceitos complexos de forma simples e clara",
        icon: Brain,
        priority: "medium",
        impact: "Diferencial competitivo"
      });
    }

    if (score >= 80) {
      recs.push({
        title: "Excelente Performance!",
        description: "Você demonstrou alta competência. Continue praticando para manter o nível de excelência",
        icon: TrendingUp,
        priority: "low",
        impact: "Manutenção da excelência"
      });
    }

    return recs;
  }, []);

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadInterviewData();
  }, [loadInterviewData]);

  // Recalcular scores quando dados mudarem
  useEffect(() => {
    const { totalScore, factors } = calculateInterviewScore;
    setFinalScore(totalScore);
    setPerformanceLevel(getPerformanceLevel(totalScore));
    setRecommendations(generateRecommendations(totalScore, factors));

    // Animação do score
    let start = 0;
    const duration = 2000;
    const increment = totalScore / (duration / 50);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= totalScore) {
        setAnimateScore(totalScore);
        clearInterval(timer);
      } else {
        setAnimateScore(Math.round(start));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [calculateInterviewScore, getPerformanceLevel, generateRecommendations]);

  // Estatísticas detalhadas - MODIFICADO para refletir scores baixos
  const detailedStats = useMemo(() => {
    const { factors } = calculateInterviewScore;
    
    return [
      {
        label: "Qualidade das Respostas",
        value: Math.round((factors?.responseQuality || 0) * 250),
        maxValue: 100,
        color: "bg-blue-500",
        icon: MessageCircle,
        description: "Profundidade e clareza das respostas"
      },
      {
        label: "Análise Comportamental",
        value: Math.round((factors?.behaviorAnalysis || 0) * 400),
        maxValue: 100,
        color: "bg-green-500",
        icon: Activity,
        description: "Postura e engajamento durante a entrevista"
      },
      {
        label: "Contato Visual",
        value: Math.round((factors?.eyeContact || 0) * 667),
        maxValue: 100,
        color: "bg-purple-500",
        icon: Eye,
        description: "Conexão visual com o entrevistador"
      },
      {
        label: "Engajamento",
        value: Math.round((factors?.engagement || 0) * 1000),
        maxValue: 100,
        color: "bg-yellow-500",  
        icon: Zap,
        description: "Nível de participação e interesse"
      },
      {
        label: "Gestão de Tempo",
        value: Math.round((factors?.timeManagement || 0) * 1000),
        maxValue: 100,
        color: "bg-red-500",
        icon: Timer,
        description: "Eficiência no uso do tempo disponível"
      }
    ];
  }, [calculateInterviewScore]);

  const isLowPerformance = finalScore < 40;
  const isHighPerformance = finalScore >= 80;

  // Renderizar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Carregando Resultado</h2>
          <p className="text-gray-400">Analisando dados da sua entrevista...</p>
          <div className="mt-4 w-64 mx-auto bg-gray-800 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao Carregar Dados</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={retryLoad}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    );
  }

  const PerformanceIcon = performanceLevel?.icon || Activity;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com animação */}
        <div className="text-center mb-8">
          <div className="mb-4 relative">
            <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${
              isHighPerformance ? 'bg-green-400' : 
              isLowPerformance ? 'bg-red-400' : 'bg-blue-400'
            }`}></div>
            <PerformanceIcon className={`w-16 h-16 mx-auto relative z-10 ${
              isHighPerformance ? 'text-green-400' : 
              isLowPerformance ? 'text-red-400' : 'text-blue-400'
            }`} />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Resultado da Entrevista
          </h1>
          <p className="text-gray-300 text-lg">
            Entrevista Técnica - {userSpecialization}
          </p>
          {interviewData && (
            <div className="mt-3 text-sm text-gray-400 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(interviewData.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>ID: {(interviewData.id || interviewId).slice(-8)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Score Principal com gradiente animado */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mb-8 text-center border border-gray-700">
          <div className="mb-8">
            <div className="relative mb-4">
              <div className={`text-7xl font-bold mb-2 bg-gradient-to-r ${
                isHighPerformance ? 'from-green-400 to-emerald-500' :
                isLowPerformance ? 'from-red-400 to-orange-500' : 'from-blue-400 to-purple-500'
              } bg-clip-text text-transparent`}>
                {animateScore}%
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-2xl -z-10 opacity-50"></div>
            </div>
            <div className={`inline-flex items-center px-6 py-3 rounded-full ${performanceLevel?.bgColor || 'bg-gray-700'} ${performanceLevel?.borderColor || 'border-gray-500'} border-2 backdrop-blur-sm`}>
              <PerformanceIcon className={`w-5 h-5 mr-2 ${performanceLevel?.color || 'text-gray-400'}`} />
              <span className={`font-semibold text-lg ${performanceLevel?.color || 'text-gray-400'}`}>
                {performanceLevel?.level || 'Avaliando...'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
           
            
          
            
           
          </div>
        </div>

        {/* Seção específica para baixo desempenho */}
        {isLowPerformance && (
          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white mb-3">
                  🚀 Oportunidade de Crescimento
                </h3>
                <p className="text-gray-300 mb-4 text-lg">
                  Seu desempenho indica que há espaço para desenvolvimento. Nossos mentores especializados 
                  podem ajudar você a alcançar seu potencial máximo e destacar seu perfil no mercado.
                </p>
                
                <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-600/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-white">Impacto na Visibilidade do Perfil</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 p-3 bg-red-900/20 rounded-lg">
                      <EyeOff className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">Sem mentoria: Visibilidade limitada</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-green-900/20 rounded-lg">
                      <Eye className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Com mentoria: Perfil destacado</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onAccessMentoring}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 text-lg shadow-lg hover:shadow-blue-500/25"
                >
                  <Users className="w-5 h-5" />
                  <span>Acessar Mentorias Especializadas</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Seção para alta performance */}
        {isHighPerformance && (
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <Award className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white mb-3">
                  🎉 Excelente Performance!
                </h3>
                <p className="text-gray-300 mb-4 text-lg">
                  Parabéns! Você demonstrou alto nível de competência técnica e comportamental. 
                  Seu perfil está pronto para destacar-se no mercado de trabalho.
                </p>
                
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="font-medium text-white">Perfil Destacado</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Seu desempenho excelente aumenta significativamente sua visibilidade no mercado
                    </p>
                  </div>
                  <div className="bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-white">Oportunidades Premium</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Candidatos com alta performance têm acesso prioritário a vagas especiais
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas Detalhadas */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white flex items-center">
              <BarChart3 className="w-6 h-6 text-blue-400 mr-3" />
              Análise Detalhada de Performance
            </h3>
            <button
              onClick={() => setShowDetailedStats(!showDetailedStats)}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-all bg-blue-900/20 hover:bg-blue-900/40 px-4 py-2 rounded-lg border border-blue-500/30"
            >
              <BarChart3 className="w-5 h-5" />
              <span>{showDetailedStats ? 'Ocultar' : 'Ver'} Métricas</span>
            </button>
          </div>

          {showDetailedStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {detailedStats.map((stat, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${stat.color.replace('bg-', 'bg-').replace('-500', '-900/30')}`}>
                          <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <span className="text-white font-medium">{stat.label}</span>
                          <p className="text-gray-400 text-xs">{stat.description}</p>
                        </div>
                      </div>
                      <span className="text-white font-bold text-lg">{stat.value}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${stat.color} h-3 rounded-full transition-all duration-1000 ease-out relative`}
                        style={{ width: `${Math.min(stat.value, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Gráfico de evolução temporal se houver dados */}
              {behaviorData.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Activity className="w-5 h-5 text-green-400 mr-2" />
                    Evolução Durante a Entrevista
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-sm">Engajamento Médio</span>
                        <span className="text-white font-medium">
                          {Math.round(behaviorData.reduce((acc, b) => acc + ((b?.engagement?.score) || 0), 0) / behaviorData.length * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.round(behaviorData.reduce((acc, b) => acc + ((b?.engagement?.score) || 0), 0) / behaviorData.length * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-sm">Contato Visual Médio</span>
                        <span className="text-white font-medium">
                          {Math.round(behaviorData.reduce((acc, b) => acc + ((b?.eyeContact?.score) || 0), 0) / behaviorData.length * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.round(behaviorData.reduce((acc, b) => acc + ((b?.eyeContact?.score) || 0), 0) / behaviorData.length * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Análise do CV se disponível */}
        {cvAnalysis && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-8 border border-gray-700">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <FileText className="w-6 h-6 text-green-400 mr-3" />
              Análise do Currículo
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-green-900/20 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">Score do CV</h4>
                  <span className="text-3xl font-bold text-green-400">{cvAnalysis.score}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${cvAnalysis.score}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/30">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-400 mr-2" />
                  Pontos Fortes
                </h4>
                <div className="space-y-2">
                  {cvAnalysis.strengths?.slice(0, 3).map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-900/20 rounded-xl p-6 border border-yellow-500/30">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 text-yellow-400 mr-2" />
                  Áreas para Melhorar
                </h4>
                <div className="space-y-2">
                  {cvAnalysis.improvements?.slice(0, 3).map((improvement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recomendações Personalizadas */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-8 border border-gray-700">
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <Target className="w-6 h-6 text-purple-400 mr-3" />
            Próximos Passos Recomendados
          </h3>
          
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`border rounded-xl p-6 transition-all hover:scale-[1.02] ${
                  rec.priority === 'high' 
                    ? 'border-red-500/30 bg-gradient-to-br from-red-900/10 to-red-900/5 hover:border-red-500/50' 
                    : rec.priority === 'medium'
                    ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-900/10 to-yellow-900/5 hover:border-yellow-500/50'
                    : 'border-green-500/30 bg-gradient-to-br from-green-900/10 to-green-900/5 hover:border-green-500/50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${
                    rec.priority === 'high' ? 'bg-red-900/30' :
                    rec.priority === 'medium' ? 'bg-yellow-900/30' : 'bg-green-900/30'
                  }`}>
                    <rec.icon className={`w-6 h-6 ${
                      rec.priority === 'high' ? 'text-red-400' :
                      rec.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-white text-lg">{rec.title}</h4>
                      {rec.priority === 'high' && (
                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                          Alta Prioridade
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-3">{rec.description}</p>
                    {rec.impact && (
                      <div className="flex items-center space-x-2 mb-3">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm font-medium">{rec.impact}</span>
                      </div>
                    )}
                    {rec.action && (
                      <button
                        onClick={onAccessMentoring}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
                      >
                        <span>{rec.action}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de Ação Principais */}
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {!isLowPerformance && (
        <Link
          to="/Home" 
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/25"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Continuar Jornada</span>
        </Link>
      )}

      <Link
        to="/mentorias" // Specify the target path here
        className={`flex-1 transition-all flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold shadow-lg ${
          isLowPerformance
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-blue-500/25'
            : 'border-2 border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span>{isLowPerformance ? 'Acessar Mentorias Agora' : 'Explorar Mentorias'}</span>
      </Link>
      </div>
        {/* Footer Informativo */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="text-center text-gray-400">
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-400" />
                <span className="text-sm">IA Avançada</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-green-400" />
                <span className="text-sm">Análise Comportamental</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Avaliação de Conteúdo</span>
              </div>
            </div>
            <p className="text-sm mb-2">
              Suas respostas foram analisadas usando inteligência artificial avançada para oferecer 
              feedback preciso sobre performance técnica e comportamental.
            </p>
            <p className="text-xs text-gray-500">
              Todos os dados são confidenciais e usados exclusivamente para melhorar sua experiência e desenvolvimento profissional.
            </p>
            {interviewData && (
              <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
                <div className="flex items-center justify-center space-x-4">
                  <span>ID: {(interviewData.id || interviewId).slice(-8)}</span>
                  <span>•</span>
                  <span>Status: {interviewData.status}</span>
                  <span>•</span>
                  <span>Versão: 2.1.0</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}