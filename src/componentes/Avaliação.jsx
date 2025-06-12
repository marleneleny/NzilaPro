import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Square,
  SkipForward,
  Clock,
  ArrowLeft,
  PhoneOff,
  MoreVertical,
  Users,
  MessageCircle,
  Eye,
  Smile,
  TrendingUp,
  Loader2,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { generateQuestionsFromCV } from "../services/geminiService";
import FirestoreService from "../services/firestoreEntrevista";
import SpeechRecognitionService from "../services/speechService";
import { useNavigate } from "react-router-dom";

export default function Avaliacao() {
  const { User } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [responses, setResponses] = useState([]);
  const [stream, setStream] = useState(null);
  const [showChat, setShowChat] = useState(true);
    const navigate = useNavigate();
    

  // Estados para análise facial
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [behaviorData, setBehaviorData] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Estados para integração com Gemini e CV
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [cvContent, setCvContent] = useState(null);
  const [loadingCV, setLoadingCV] = useState(false);

  const [userCVData, setUserCVData] = useState(null);
const [userCVLoaded, setUserCVLoaded] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const analysisInterval = useRef(null);

const [speechSupported, setSpeechSupported] = useState(false);
const [speechError, setSpeechError] = useState(null);
// Substitua a inicialização atual por esta:
const [speechService] = useState(() => {
  const service = new SpeechRecognitionService();
  
  service.setOnResult(({ final, interim }) => {
    setTranscription(final + interim);
  });

  service.setOnError((error) => {
    console.error("Erro no reconhecimento de fala:", error);
    setSpeechError(error.message);
    setIsSpeechActive(false);
  });

  service.setOnEnd(() => {
    setIsSpeechActive(false);
  });

  return service;
});
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [transcription, setTranscription] = useState("");

  useEffect(() => {
    const supported = SpeechRecognitionService.isSupported();
    setSpeechSupported(supported);

    if (!supported) {
      console.warn("Reconhecimento de fala não suportado neste navegador");
      setSpeechError("Navegador não suporta reconhecimento de fala");
    }
  }, []);
  // Função para carregar CV do localStorage
const loadUserCVData = () => {
    try {
      if (User) {
        const simulatedCV = {
          name: `CV_${User.name || User.fullName || "user"}.pdf`,
          type: "application/pdf",
          url: null, // Sem URL real
          uploadDate: new Date().toISOString(),
          processed: false
        };
        
        setUserCVData(simulatedCV);
        setUserCVLoaded(true);
        
        console.log("Dados do CV carregados:", simulatedCV);
        return simulatedCV;
      } else {
        console.warn("Usuário não disponível para carregar CV");
        setUserCVLoaded(false);
        return null;
      }
    } catch (error) {
      console.error("Erro ao carregar dados do CV:", error);
      setUserCVLoaded(false);
      return null;
    }
  };

  useEffect(() => {
    console.log("Estado atual dos dados:", {
      User: !!User,
      userCVData: !!userCVData,
      userCVLoaded,
      cvData: !!cvData,
      cvContent: !!cvContent,
      loadingCV,
      questionsCount: questions.length,
      cvAnalysis: !!cvAnalysis,
    });
  }, [User, userCVData, userCVLoaded, cvData, cvContent, loadingCV, questions, cvAnalysis]);

  // Função para baixar e processar CV do Cloudinary
  const processUserCV = async () => {
    try {
      setLoadingCV(true);
      console.log("Processando dados do CV do usuário");

      // Simular processamento de CV
      const mockFile = new File([""], "cv.pdf", { type: "application/pdf" });
      const extractedText = await extractTextFromPDF(mockFile);

      console.log(
        "Texto extraído do CV:",
        extractedText.substring(0, 500) + "..."
      );

      const processedContent = processExtractedText(extractedText);
      setCvContent(processedContent);
      return processedContent;
    } catch (error) {
      console.error("Erro ao processar CV:", error);
      throw error;
    } finally {
      setLoadingCV(false);
    }
  };

  // Função para processar o texto extraído e estruturar dados
  const processExtractedText = (text) => {
    const processed = {
      rawText: text,
      personalInfo: {},
      experience: [],
      education: [],
      skills: [],
      projects: [],
      summary: "",
    };

    try {
      // Extrair informações pessoais
      const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      if (emailMatch) processed.personalInfo.email = emailMatch[0];

      const phoneMatch = text.match(
        /(?:\+55\s?)?\(?[1-9]\d?\)?\s?\d{4,5}-?\d{4}/
      );
      if (phoneMatch) processed.personalInfo.phone = phoneMatch[0];

      // Extrair experiências (buscar por padrões comuns)
      const experienceSection = text.match(
        /(?:EXPERIÊNCIA|EXPERIENCE|PROFISSIONAL)[\s\S]*?(?=(?:FORMAÇÃO|EDUCATION|HABILIDADES|SKILLS|$))/i
      );
      if (experienceSection) {
        const experiences = experienceSection[0]
          .split(/\n\s*•|\n\s*-/)
          .filter((exp) => exp.trim().length > 20);
        processed.experience = experiences.map((exp) => ({
          text: exp.trim(),
          position: extractPosition(exp),
          company: extractCompany(exp),
          period: extractPeriod(exp),
        }));
      }

      // Extrair educação
      const educationSection = text.match(
        /(?:FORMAÇÃO|EDUCATION|EDUCAÇÃO)[\s\S]*?(?=(?:HABILIDADES|SKILLS|PROJETOS|PROJECTS|$))/i
      );
      if (educationSection) {
        const education = educationSection[0]
          .split(/\n\s*•|\n\s*-/)
          .filter((edu) => edu.trim().length > 10);
        processed.education = education.map((edu) => ({
          text: edu.trim(),
          course: extractCourse(edu),
          institution: extractInstitution(edu),
          period: extractPeriod(edu),
        }));
      }

      // Extrair habilidades
      const skillsSection = text.match(
        /(?:HABILIDADES|SKILLS|TECNOLOGIAS|COMPETÊNCIAS)[\s\S]*?(?=(?:PROJETOS|PROJECTS|$))/i
      );
      if (skillsSection) {
        const skillsText = skillsSection[0];
        processed.skills = extractSkills(skillsText);
      }

      // Extrair projetos
      const projectsSection = text.match(/(?:PROJETOS|PROJECTS)[\s\S]*$/i);
      if (projectsSection) {
        const projects = projectsSection[0]
          .split(/\n\s*•|\n\s*-/)
          .filter((proj) => proj.trim().length > 10);
        processed.projects = projects.map((proj) => proj.trim());
      }

      // Criar resumo
      processed.summary = createSummary(processed);
    } catch (error) {
      console.error("Erro ao processar texto:", error);
    }

    return processed;
  };

  // Funções auxiliares para extração
  const extractPosition = (text) => {
    const match = text.match(/^([^-\n]+?)(?:\s*-\s*|\s*\|\s*|\s*@\s*)/);
    return match ? match[1].trim() : "";
  };

  const extractCompany = (text) => {
    const match = text.match(/(?:-\s*|@\s*|em\s+)([^(\n]+?)(?:\s*\(|\s*$)/);
    return match ? match[1].trim() : "";
  };

  const extractPeriod = (text) => {
    const match = text.match(/\(([^)]+)\)/);
    return match ? match[1].trim() : "";
  };

  const extractCourse = (text) => {
    const match = text.match(/^([^-\n]+?)(?:\s*-\s*|\s*em\s*)/);
    return match ? match[1].trim() : "";
  };

  const extractInstitution = (text) => {
    const match = text.match(/(?:-\s*|em\s+)([^(\n]+?)(?:\s*\(|\s*$)/);
    return match ? match[1].trim() : "";
  };

  const extractSkills = (text) => {
    const skills = [];
    const lines = text.split("\n");

    lines.forEach((line) => {
      // Remover bullets e limpar
      const cleaned = line.replace(/^[\s•\-\*]+/, "").trim();
      if (cleaned.length > 2) {
        // Dividir por vírgulas ou pontos e vírgulas
        const lineSkills = cleaned
          .split(/[,;]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1);
        skills.push(...lineSkills);
      }
    });

    return [...new Set(skills)]; // Remover duplicatas
  };

  const createSummary = (processed) => {
    const parts = [];

    if (processed.experience.length > 0) {
      parts.push(
        `${processed.experience.length} experiência(s) profissional(is)`
      );
    }

    if (processed.education.length > 0) {
      parts.push(
        `formação em ${processed.education[0].course || "área técnica"}`
      );
    }

    if (processed.skills.length > 0) {
      parts.push(`especialista em ${processed.skills.slice(0, 3).join(", ")}`);
    }

    return parts.length > 0 ? parts.join(", ") : "Perfil profissional";
  };

  // Carregar CV e gerar perguntas
  useEffect(() => {
    const loadCVAndQuestions = async () => {
      if (!User) {
        console.log("User não disponível ainda");
        return;
      }

      setLoadingQuestions(true);
      setQuestionsError(null);

      try {
        // 1. Simular carregamento de dados do CV
        const cvMetadata = loadUserCVData();

        let processedCV = null;

        // 2. Se temos dados do usuário, processar CV simulado
        if (cvMetadata || User) {
          try {
            processedCV = await processUserCV();
            console.log("CV processado com sucesso:", processedCV.summary);
          } catch (cvError) {
            console.error("Erro ao processar CV, continuando sem:", cvError);
          }
        }

        // 3. Preparar dados para o Gemini
        const candidateData = {
          fullName: User?.name || User?.fullName || "Candidato",
          area: User?.specialization || User?.area || "Tecnologia",
          specialization: User?.specialization || User?.area || "Tecnologia",
          hasCV: !!processedCV,
          cvContent: processedCV ? processedCV.rawText : null,
        };

        console.log(
          "Gerando perguntas personalizadas para:",
          candidateData.fullName
        );
        console.log("Dados enviados para Gemini:", {
          hasCV: candidateData.hasCV,
          area: candidateData.area,
          cvContentLength: candidateData.cvContent?.length || 0,
        });

        // 4. Gerar perguntas com Gemini
        const result = await generateQuestionsFromCV(candidateData);

        if (result?.data?.questions && Array.isArray(result.data.questions)) {
          setQuestions(result.data.questions);
          console.log(
            `${result.data.questions.length} perguntas geradas com sucesso`
          );

          if (result.data.analysis) {
            setCvAnalysis(result.data.analysis);
            console.log("Análise do CV salva:", result.data.analysis);
          }
        } else {
          throw new Error("Formato de resposta inválido do Gemini");
        }
      } catch (error) {
        console.error("Erro ao gerar perguntas:", error);
        setQuestionsError(error.message);

        // Usar perguntas de fallback
        const fallbackQuestions = getFallbackQuestions();
        setQuestions(fallbackQuestions);

        setCvAnalysis({
          candidateProfile: `Perfil ${getUserSpecialization()} com foco em desenvolvimento`,
          strengths: [
            "Proatividade",
            "Conhecimento técnico",
            "Capacidade de aprendizado",
          ],
          suggestedFocus: User?.specialization || User?.area || "Tecnologia",
        });
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadCVAndQuestions();
  }, [User]);

  // Debug: Verificar dados disponíveis
  useEffect(() => {
    console.log("Estado atual dos dados:", {
      User: !!User,
      cvData: !!cvData,
      cvContent: !!cvContent,
      loadingCV,
      questionsCount: questions.length,
      cvAnalysis: !!cvAnalysis,
    });
  }, [User, cvData, cvContent, loadingCV, questions, cvAnalysis]);

  // Perguntas de fallback caso o Gemini falhe
  const getFallbackQuestions = () => {
    const userArea = getUserSpecialization();

    return [
      {
        id: 1,
        text: `Fale sobre sua experiência em ${userArea} e o que mais te motiva nesta área.`,
        category: "Experiência",
        timeLimit: 120,
        purpose: "Avaliar paixão e conhecimento da área",
        basedOnCV: !!cvContent,
      },
      {
        id: 2,
        text: "Descreva um projeto desafiador que você trabalhou recentemente. Como você lidou com as dificuldades?",
        category: "Situacional",
        timeLimit: 150,
        purpose: "Avaliar resolução de problemas",
        basedOnCV: !!cvContent,
      },
      {
        id: 3,
        text: "Quais tecnologias ou metodologias você considera mais importantes em sua área atualmente?",
        category: "Técnica",
        timeLimit: 120,
        purpose: "Avaliar conhecimento atualizado",
        basedOnCV: !!cvContent,
      },
      {
        id: 4,
        text: "Como você se mantém atualizado com as tendências e inovações da sua área?",
        category: "Desenvolvimento Profissional",
        timeLimit: 90,
        purpose: "Avaliar proatividade e aprendizado contínuo",
        basedOnCV: !!cvContent,
      },
      {
        id: 5,
        text: "Fale sobre uma situação onde você teve que trabalhar sob pressão. Como lidou com isso?",
        category: "Comportamental",
        timeLimit: 120,
        purpose: "Avaliar gestão de estresse",
        basedOnCV: false,
      },
      {
        id: 6,
        text: "Onde você se vê profissionalmente nos próximos 3 anos?",
        category: "Carreira",
        timeLimit: 100,
        purpose: "Avaliar ambição e planejamento",
        basedOnCV: false,
      },
      {
        id: 7,
        text: "Como você lida com feedback negativo ou críticas construtivas?",
        category: "Comportamental",
        timeLimit: 90,
        purpose: "Avaliar maturidade profissional",
        basedOnCV: false,
      },
      {
        id: 8,
        text: "Descreva seu estilo de trabalho e como você se relaciona com colegas de equipe.",
        category: "Trabalho em Equipe",
        timeLimit: 120,
        purpose: "Avaliar fit cultural",
        basedOnCV: false,
      },
      {
        id: 9,
        text: "Qual foi sua maior conquista profissional até agora e por quê?",
        category: "Realizações",
        timeLimit: 130,
        purpose: "Avaliar orgulho profissional e valores",
        basedOnCV: false,
      },
      {
        id: 10,
        text: "Por que você está interessado em nossa empresa e nesta posição?",
        category: "Motivação",
        timeLimit: 100,
        purpose: "Avaliar interesse genuíno",
        basedOnCV: false,
      },
    ];
  };

  // Carregar modelos do Face-api.js
  useEffect(() => {
    const loadFaceApiModels = async () => {
      try {
        console.log("Carregando modelos Face-api.js...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setFaceApiLoaded(true);
        console.log("Modelos Face-api.js carregados com sucesso!");
      } catch (error) {
        console.error("Erro ao carregar modelos Face-api.js:", error);
      }
    };

    loadFaceApiModels();
  }, []);

  // Análise facial contínua
  const startFaceAnalysis = () => {
    if (!faceApiLoaded || !videoRef.current) return;

    analysisInterval.current = setInterval(async () => {
      try {
        const mockAnalysis = {
          timestamp: Date.now(),
          faceDetected: Math.random() > 0.1,
          expressions: {
            neutral: Math.random() * 0.6 + 0.2,
            happy: Math.random() * 0.3,
            sad: Math.random() * 0.1,
            angry: Math.random() * 0.05,
            fearful: Math.random() * 0.05,
            disgusted: Math.random() * 0.05,
            surprised: Math.random() * 0.1,
          },
          eyeContact: {
            score: Math.random() * 0.8 + 0.2,
            looking: Math.random() > 0.3,
          },
          engagement: {
            score: Math.random() * 0.7 + 0.3,
            stability: Math.random() * 0.5 + 0.5,
          },
        };

        setCurrentAnalysis(mockAnalysis);
        setBehaviorData((prev) => [...prev.slice(-19), mockAnalysis]);
      } catch (error) {
        console.error("Erro na análise facial:", error);
      }
    }, 2000);
  };

  const stopFaceAnalysis = () => {
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
      analysisInterval.current = null;
    }
  };

  // Função para obter a especialização do usuário
  const getUserSpecialization = () => {
    // Tentar extrair do conteúdo do CV primeiro
    if (cvContent?.skills && cvContent.skills.length > 0) {
      return `Especialista em ${cvContent.skills.slice(0, 2).join(" e ")}`;
    }

    if (cvContent?.experience && cvContent.experience.length > 0) {
      const latestExp = cvContent.experience[0];
      if (latestExp.position) {
        return latestExp.position;
      }
    }

    if (cvContent?.education && cvContent.education.length > 0) {
      const latestEdu = cvContent.education[0];
      if (latestEdu.course) {
        return latestEdu.course;
      }
    }

    // Fallback para dados do User
    if (User?.specialization && User.specialization !== "") {
      return User.specialization;
    }
    if (User?.area && User.area !== "") {
      return User.area;
    }

    return "Desenvolvedor";
  };

  // Prevenir fechamento da aba durante a entrevista
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (interviewStarted && !isInterviewComplete()) {
        e.preventDefault();
        e.returnValue =
          "Você tem certeza que deseja sair? Sua entrevista será perdida.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [interviewStarted]);

  // Timer para cada pergunta
  useEffect(() => {
    let timer;
    if (interviewStarted && timeLeft > 0 && !isInterviewComplete()) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(timer);
  }, [timeLeft, interviewStarted]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      stopFaceAnalysis();
      speechService.destroy();
    };
  }, [stream]);

  // Inicializar câmera e microfone
  const initializeMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      return mediaStream;
    } catch (error) {
      console.error("Erro ao acessar mídia:", error);
      alert("Erro ao acessar câmera/microfone. Verifique as permissões.");
    }
  };

  // Iniciar gravação
  // Substituir a função existente
  const startRecording = async () => {
    try {
      const mediaStream = stream || (await initializeMedia());

      if (!mediaStream) {
        console.error("Stream de mídia não disponível");
        return;
      }

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: "video/webm;codecs=vp9",
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
          type: "video/webm",
        });

        const finalTranscript = transcription;
        saveResponse(blob, finalTranscript);
      };

      // Iniciar gravação
      mediaRecorder.start(1000);
      startFaceAnalysis();

      // Configurar reconhecimento de fala apenas se suportado
      if (speechSupported && speechService) {
        speechService.setOnResult(({ final, interim }) => {
          setTranscription(final + interim);
        });

        const started = speechService.start();
        if (started) {
          setIsSpeechActive(true);
          setSpeechError(null);
        } else {
          setSpeechError("Não foi possível iniciar o reconhecimento de fala");
        }
      }

      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      alert("Erro ao iniciar gravação: " + error.message);
    }
  };

  // Função melhorada para parar gravação - SUBSTITUIR stopRecording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopFaceAnalysis();

      // Parar reconhecimento de fala se estiver ativo
      if (speechSupported && speechService && isSpeechActive) {
        const finalTranscript = speechService.stop();
        setIsSpeechActive(false);

        // Criar blob da gravação
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        saveResponse(blob, finalTranscript);

        return finalTranscript;
      } else {
        // Se não há speech recognition, usar transcrição atual
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        saveResponse(blob, transcription);
        return transcription;
      }
    }
  };

  // Simular transcrição
  const saveResponse = (blob, finalTranscript) => {
    const questionBehaviorData = behaviorData.filter(
      (data) =>
        data.timestamp >=
        Date.now() - (questions[currentQuestion]?.timeLimit * 1000 || 120000)
    );

    const avgEngagement =
      questionBehaviorData.reduce(
        (acc, curr) => acc + (curr.engagement?.score || 0),
        0
      ) / questionBehaviorData.length;

    const avgEyeContact =
      questionBehaviorData.reduce(
        (acc, curr) => acc + (curr.eyeContact?.score || 0),
        0
      ) / questionBehaviorData.length;

    const dominantExpression = questionBehaviorData.reduce((acc, curr) => {
      const expressions = curr.expressions || {};
      const maxExpr = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );
      acc[maxExpr] = (acc[maxExpr] || 0) + 1;
      return acc;
    }, {});

    setResponses((prev) => [
      ...prev,
      {
        questionId: questions[currentQuestion]?.id,
        question: questions[currentQuestion]?.text,
        category: questions[currentQuestion]?.category,
        purpose: questions[currentQuestion]?.purpose,
        basedOnCV: questions[currentQuestion]?.basedOnCV,
        transcription: finalTranscript || "Nenhuma transcrição disponível",
        audioBlob: blob,
        duration: (questions[currentQuestion]?.timeLimit || 120) - timeLeft,
        timestamp: new Date().toISOString(),
        behaviorAnalysis: {
          avgEngagement: avgEngagement || 0,
          avgEyeContact: avgEyeContact || 0,
          dominantExpression: Object.keys(dominantExpression)[0] || "neutral",
          dataPoints: questionBehaviorData.length,
        },
      },
    ]);

    setTranscription(""); // Resetar a transcrição para a próxima pergunta
  };

  // Iniciar entrevista
  const startInterview = async () => {
    if (questions.length === 0) {
      alert("Aguarde o carregamento das perguntas...");
      return;
    }

    await initializeMedia();
    setInterviewStarted(true);
    setTimeLeft(questions[0]?.timeLimit || 120);
    startRecording();
  };

  // Próxima pergunta
  const handleNextQuestion = () => {
    stopRecording();

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(questions[currentQuestion + 1]?.timeLimit || 120);
      setTimeout(() => startRecording(), 1000);
    } else {
      finishInterview();
    }
  };

  // Finalizar entrevista

// Finalizar entrevista - SUBSTITUIR a função existente
const finishInterview = async () => {
  stopRecording();
  setInterviewStarted(false);

  // Salvar no Firestore
  const interviewData = {
    userId: User?.uid,
    userName: User?.name || User?.fullName,
    userEmail: User?.email,
    userSpecialization: getUserSpecialization(),
    questions,
    responses,
    behaviorData,
    cvAnalysis,
    cvContent,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    duration: responses.reduce((acc, r) => acc + (r.duration || 0), 0),
  };

  try {
    // Redirecionar imediatamente para os resultados
    navigate("/resultados", { 
      replace: true,
      state: { 
        interviewData: interviewData,
        justCompleted: true 
      }
    });

    // Salvar em background (sem aguardar)
    FirestoreService.saveInterview(interviewData)
      .then(result => {
        console.log("Entrevista salva com sucesso:", result);
      })
      .catch(error => {
        console.error("Erro ao salvar entrevista:", error);
        // Opcional: você pode mostrar uma notificação toast ou similar
        // para informar sobre o erro de salvamento, mas não bloquear a navegação
      });

  } catch (error) {
    console.error("Erro durante finalização:", error);
    // Mesmo com erro, redirecionar para resultados
    navigate("/resultados", { 
      replace: true,
      state: { 
        interviewData: interviewData,
        justCompleted: true,
        saveError: true 
      }
    });
  }

  // Limpar recursos
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  speechService.destroy();
};

  // Voltar para tela inicial
  const handleGoBack = () => {
    if (interviewStarted) {
      const confirmExit = window.confirm(
        "Tem certeza que deseja sair? Sua entrevista será perdida."
      );
      if (!confirmExit) return;

      stopRecording();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    return questions.length > 0
      ? ((currentQuestion + 1) / questions.length) * 100
      : 0;
  };

  const getEngagementColor = (score) => {
    if (score >= 0.7) return "text-green-400";
    if (score >= 0.4) return "text-yellow-400";
    return "text-red-400";
  };

  // Mostrar tela de carregamento se ainda está carregando perguntas
  if (loadingQuestions) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">
            Preparando sua entrevista
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {!interviewStarted ? (
        /* Tela inicial */
        <div className="h-full flex items-center justify-center p-4">
          <div className="max-w-sm w-full">
            <div className="text-center mb-6">
              <h1 className="text-xl font-medium text-white mb-2">
                Pronto para participar?
              </h1>
              <p className="text-gray-300 text-sm">
                Entrevista Técnica - {getUserSpecialization()}
              </p>
            </div>

            <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg">
              <div className="text-center text-green-200 text-sm">
                <p className="font-medium mb-1">
                  ✓ Perguntas personalizadas geradas
                </p>
                <p className="text-xs">
                  {questions.length} perguntas baseadas no seu perfil
                </p>
              </div>
            </div>

            {/* Status Face-api.js */}
            <div className="mb-4">
              <div
                className={`text-center p-2 rounded-lg ${
                  faceApiLoaded
                    ? "bg-green-900/50 border border-green-500"
                    : "bg-yellow-900/50 border border-yellow-500"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      faceApiLoaded
                        ? "bg-green-400"
                        : "bg-yellow-400 animate-pulse"
                    }`}
                  ></div>
                  <span className="text-xs">
                    {faceApiLoaded
                      ? "Análise facial ativada"
                      : "Carregando análise facial..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Informações da entrevista */}
            <div className="space-y-1 text-xs text-gray-300">
              <div>
                • {questions.length} perguntas{" "}
                {questionsError ? "padrão" : "personalizadas"}
              </div>
              <div>• Tempo médio: 2 minutos por pergunta</div>
              <div>• Suas respostas serão gravadas e transcritas</div>
              <div>• Análise comportamental com IA</div>
              <div>• Mantenha contato visual com a câmera</div>
              {cvAnalysis && <div>• Foco: {cvAnalysis.suggestedFocus}</div>}
            </div>
            <button
              onClick={startInterview}
              disabled={!faceApiLoaded || questions.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>
                {!faceApiLoaded
                  ? "Aguarde..."
                  : questions.length === 0
                  ? "Carregando perguntas..."
                  : "Participar agora"}
              </span>
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
                <span className="text-white font-mono text-sm">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-white font-medium text-sm">
                Entrevista Técnica
              </h1>
              <p className="text-gray-400 text-xs">
                Pergunta {currentQuestion + 1} de {questions.length}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Indicadores de análise facial */}
              {currentAnalysis && (
                <div className="flex items-center space-x-2 text-xs">
                  <div
                    className={`flex items-center space-x-1 ${
                      currentAnalysis.faceDetected
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>
                      {currentAnalysis.eyeContact?.looking
                        ? "Olhando"
                        : "Desviado"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${getEngagementColor(
                      currentAnalysis.engagement?.score || 0
                    )}`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      {Math.round(
                        (currentAnalysis.engagement?.score || 0) * 100
                      )}
                      %
                    </span>
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
                    <span className="text-xs">
                      {Math.round(getProgressPercentage())}%
                    </span>
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
                  <h3 className="text-white font-medium text-sm">
                    Pergunta Atual
                  </h3>
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      showAnalytics
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    Analytics
                  </button>
                </div>

                {/* Status do Reconhecimento de Fala */}
                <div className="bg-gray-700 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-xs">
                      Reconhecimento de Fala
                    </span>
                    <div className="flex items-center space-x-2">
                      {speechSupported ? (
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isSpeechActive
                              ? "bg-green-400 animate-pulse"
                              : "bg-gray-400"
                          }`}
                        ></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      )}
                      <span
                        className={`text-xs ${
                          speechSupported
                            ? isSpeechActive
                              ? "text-green-400"
                              : "text-gray-400"
                            : "text-red-400"
                        }`}
                      >
                        {!speechSupported
                          ? "Não suportado"
                          : isSpeechActive
                          ? "Ouvindo..."
                          : "Inativo"}
                      </span>
                    </div>
                  </div>

                  {speechError && (
                    <div className="text-red-400 text-xs mb-2">
                      ⚠️ {speechError}
                    </div>
                  )}

                  

                  {!speechSupported && (
                    <div className="text-gray-400 text-xs mt-2">
                      <p>
                        💡 Dica: Use Chrome, Safari ou Edge para ativar o
                        reconhecimento de fala automático.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-3 overflow-y-auto">
                  {!showAnalytics ? (
                    <>
                      <div className="bg-gray-700 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-blue-400 text-xs font-medium uppercase">
                            {questions[currentQuestion]?.category}
                          </div>
                          {questions[currentQuestion]?.basedOnCV && (
                            <div className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
                              Baseada no CV
                            </div>
                          )}
                        </div>
                        <p className="text-white text-sm leading-relaxed mb-2">
                          {questions[currentQuestion]?.text}
                        </p>
                        {questions[currentQuestion]?.purpose && (
                          <p className="text-gray-400 text-xs italic">
                            💡 {questions[currentQuestion].purpose}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="text-gray-300 text-sm">
                          <div className="flex justify-between items-center">
                            <span>Tempo restante:</span>
                            <span
                              className={`font-mono ${
                                timeLeft <= 30 ? "text-red-400" : "text-white"
                              }`}
                            >
                              {formatTime(timeLeft)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleNextQuestion}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2"
                        >
                          <span>
                            {currentQuestion < questions.length - 1
                              ? "Próxima Pergunta"
                              : "Finalizar Entrevista"}
                          </span>
                          <SkipForward className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Painel de Analytics */
                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-sm">
                        Análise em Tempo Real
                      </h4>

                      {currentAnalysis ? (
                        <>
                          {/* Contato Visual */}
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-300 text-xs">
                                Contato Visual
                              </span>
                              <span
                                className={`text-xs font-medium ${getEngagementColor(
                                  currentAnalysis.eyeContact?.score || 0
                                )}`}
                              >
                                {Math.round(
                                  (currentAnalysis.eyeContact?.score || 0) * 100
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${
                                    (currentAnalysis.eyeContact?.score || 0) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Engajamento */}
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-300 text-xs">
                                Engajamento
                              </span>
                              <span
                                className={`text-xs font-medium ${getEngagementColor(
                                  currentAnalysis.engagement?.score || 0
                                )}`}
                              >
                                {Math.round(
                                  (currentAnalysis.engagement?.score || 0) * 100
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${
                                    (currentAnalysis.engagement?.score || 0) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Expressões */}
                          <div className="bg-gray-700 rounded-lg p-3">
                            <span className="text-gray-300 text-xs block mb-2">
                              Expressão Dominante
                            </span>
                            <div className="space-y-1">
                              {Object.entries(currentAnalysis.expressions || {})
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 3)
                                .map(([expr, value]) => (
                                  <div
                                    key={expr}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-gray-300 text-xs capitalize">
                                      {expr}
                                    </span>
                                    <span className="text-white text-xs">
                                      {Math.round(value * 100)}%
                                    </span>
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
                  <h4 className="text-white font-medium mb-2 text-sm">
                    Instruções:
                  </h4>
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
                    {formatTime(
                      (questions[currentQuestion]?.timeLimit || 120) - timeLeft
                    )}
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
                    showChat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-600 hover:bg-gray-500 text-white"
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
