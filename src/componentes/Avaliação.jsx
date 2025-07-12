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
import * as faceapi from 'face-api.js';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


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
        text: `Conte-me sobre sua trajetória em ${userArea}. O que mais te motiva nesta área e como você descobriu sua paixão por ela?`,
        category: "DISC - Dominância",
        timeLimit: 120,
        purpose: "Avaliar motivação intrínseca e perfil comportamental dominante",
        basedOnCV: !!cvContent,
        evaluationCriteria: ["Paixão genuína", "Clareza na comunicação", "Autoconhecimento"]
      },
      {
        id: 2,
        text: "Descreva uma situação onde você teve que liderar um projeto ou tomar uma decisão difícil. Como você abordou o problema e quais foram os resultados?",
        category: "DISC - Dominância/Influência",
        timeLimit: 150,
        purpose: "Avaliar liderança, tomada de decisão e perfil comportamental",
        basedOnCV: !!cvContent,
        evaluationCriteria: ["Capacidade de liderança", "Processo de tomada de decisão", "Orientação para resultados"]
      },
      {
        id: 3,
        text: "Fale sobre uma vez em que você cometeu um erro significativo no trabalho. Como você reagiu e o que aprendeu com essa experiência?",
        category: "Inteligência Emocional",
        timeLimit: 120,
        purpose: "Avaliar maturidade emocional, responsabilidade e capacidade de aprendizado",
        basedOnCV: false,
        evaluationCriteria: ["Autoconsciência", "Responsabilidade", "Capacidade de aprendizado"]
      },
      {
        id: 4,
        text: "Conte-me sobre um conflito que você teve com um colega de trabalho ou cliente. Como você lidou com a situação?",
        category: "Inteligência Emocional",
        timeLimit: 130,
        purpose: "Avaliar habilidades interpessoais e gestão de conflitos",
        basedOnCV: false,
        evaluationCriteria: ["Empatia", "Comunicação assertiva", "Resolução de conflitos"]
      },
      {
        id: 5,
        text: "Descreva uma situação onde você teve que trabalhar sob pressão extrema ou com prazos muito apertados. Como você se organizou?",
        category: "Big Five - Conscienciosidade",
        timeLimit: 120,
        purpose: "Avaliar gestão de estresse e organização",
        basedOnCV: false,
        evaluationCriteria: ["Gestão do tempo", "Resistência ao estresse", "Organização"]
      },
      {
        id: 6,
        text: "Fale sobre uma vez em que você teve que aprender uma nova tecnologia ou habilidade rapidamente. Como você abordou esse desafio?",
        category: "Big Five - Abertura",
        timeLimit: 110,
        purpose: "Avaliar adaptabilidade e aprendizado contínuo",
        basedOnCV: !!cvContent,
        evaluationCriteria: ["Adaptabilidade", "Proatividade", "Estratégias de aprendizado"]
      },
      {
        id: 7,
        text: "Conte-me sobre um projeto em equipe onde houve divergências de opinião. Como você contribuiu para chegar a uma solução?",
        category: "DISC - Estabilidade/Conformidade",
        timeLimit: 140,
        purpose: "Avaliar trabalho em equipe e diplomacia",
        basedOnCV: false,
        evaluationCriteria: ["Colaboração", "Diplomacia", "Orientação para consenso"]
      },
      {
        id: 8,
        text: "Descreva uma situação onde você teve que dar feedback difícil para alguém ou receber críticas. Como você manejou essa situação?",
        category: "Inteligência Emocional",
        timeLimit: 120,
        purpose: "Avaliar comunicação assertiva e maturidade emocional",
        basedOnCV: false,
        evaluationCriteria: ["Comunicação assertiva", "Maturidade emocional", "Capacidade de feedback"]
      },
      {
        id: 9,
        text: "Fale sobre seus valores profissionais. O que é mais importante para você em um ambiente de trabalho?",
        category: "Cultura Organizacional",
        timeLimit: 100,
        purpose: "Avaliar alinhamento cultural e valores pessoais",
        basedOnCV: false,
        evaluationCriteria: ["Clareza de valores", "Alinhamento cultural", "Autenticidade"]
      },
      {
        id: 10,
        text: "Conte-me sobre uma situação onde você teve que ser criativo ou inovador para resolver um problema. Qual foi sua abordagem?",
        category: "Big Five - Abertura",
        timeLimit: 130,
        purpose: "Avaliar criatividade e pensamento inovador",
        basedOnCV: !!cvContent,
        evaluationCriteria: ["Criatividade", "Pensamento crítico", "Inovação"]
      },
      {
        id: 11,
        text: "Descreva como você se vê contribuindo para nossa equipe e empresa. O que você traria de único?",
        category: "Cultura Organizacional",
        timeLimit: 120,
        purpose: "Avaliar fit cultural e proposta de valor",
        basedOnCV: false,
        evaluationCriteria: ["Autoconhecimento", "Proposta de valor", "Fit cultural"]
      },
      {
        id: 12,
        text: "Fale sobre uma meta profissional que você estabeleceu e como trabalhou para alcançá-la. Qual foi o resultado?",
        category: "Big Five - Conscienciosidade",
        timeLimit: 140,
        purpose: "Avaliar orientação para objetivos e persistência",
        basedOnCV: false,
        evaluationCriteria: ["Planejamento", "Persistência", "Orientação para resultados"]
      }
    ];
  };
// ===== CORREÇÕES PARA O SISTEMA DE ANÁLISE FACIAL =====

// 1. CARREGAMENTO DOS MODELOS - VERSÃO CORRIGIDA
useEffect(() => {
  const loadFaceApiModels = async () => {
    try {
      console.log("🔄 Iniciando carregamento dos modelos Face-api.js...");
      
      // Verificar se face-api.js está disponível
      if (typeof faceapi === 'undefined') {
        console.error("❌ Face-api.js não foi carregado corretamente");
        setFaceApiLoaded(false);
        return;
      }

      // Carregar modelos com tratamento de erro individual
      const modelPromises = [
        faceapi.nets.tinyFaceDetector.loadFromUri('/models').catch(e => {
          console.error("❌ Erro ao carregar TinyFaceDetector:", e);
          throw e;
        }),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models').catch(e => {
          console.error("❌ Erro ao carregar FaceLandmark68Net:", e);
          throw e;
        }),
        faceapi.nets.faceExpressionNet.loadFromUri('/models').catch(e => {
          console.error("❌ Erro ao carregar FaceExpressionNet:", e);
          throw e;
        })
      ];

      await Promise.all(modelPromises);
      
      setFaceApiLoaded(true);
      console.log("✅ Modelos Face-api.js carregados com sucesso!");
      
      // Verificar se os modelos foram realmente carregados
      const modelsStatus = {
        tinyFaceDetector: faceapi.nets.tinyFaceDetector.isLoaded,
        faceLandmark68Net: faceapi.nets.faceLandmark68Net.isLoaded,
        faceExpressionNet: faceapi.nets.faceExpressionNet.isLoaded
      };
      
      console.log("📊 Status dos modelos:", modelsStatus);
      
      if (!Object.values(modelsStatus).every(status => status)) {
        console.warn("⚠️ Alguns modelos não foram carregados corretamente");
      }
      
    } catch (error) {
      console.error("❌ Erro ao carregar modelos Face-api.js:", error);
      console.log("Continuando sem análise facial...");
      setFaceApiLoaded(false);
    }
  };
  
  loadFaceApiModels();
}, []);

// 2. FUNÇÃO DE ANÁLISE FACIAL MELHORADA
useEffect(() => {
    const loadFaceApiModels = async () => {
      try {
        if (typeof faceapi === 'undefined') {
          console.error("Face-api.js not loaded.");
          setFaceApiLoaded(false);
          return;
        }

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);

        setFaceApiLoaded(true);
        console.log("Face-api.js models loaded successfully.");

      } catch (error) {
        console.error("Error loading Face-api.js models:", error);
        setFaceApiLoaded(false);
      }
    };

    loadFaceApiModels();
  }, []);

  // 2. Start Facial Analysis
  const startFaceAnalysis = () => {
    if (!faceApiLoaded || !videoRef.current) {
      console.log("Face API not loaded or video not available.");
      return;
    }

    stopFaceAnalysis(); // Ensure no multiple intervals are running

    analysisInterval.current = setInterval(async () => {
      try {
        const video = videoRef.current;

        if (!video || video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
          console.log("Video not ready for analysis.");
          return;
        }

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.25
          }))
          .withFaceLandmarks()
          .withFaceExpressions();

        let analysis;

        if (detections && detections.length > 0) {
          const detection = detections[0];
          const expressions = detection.expressions;
          const landmarks = detection.landmarks;
          const faceBox = detection.detection.box;

          const eyeContact = calculateImprovedEyeContact(landmarks, faceBox, video);
          const engagement = calculateEngagement(expressions);

          analysis = {
            timestamp: Date.now(),
            faceDetected: true,
            confidence: Math.round(detection.detection.score * 100) / 100,
            expressions: {
              neutral: Math.round(expressions.neutral * 100) / 100,
              happy: Math.round(expressions.happy * 100) / 100,
              sad: Math.round(expressions.sad * 100) / 100,
              angry: Math.round(expressions.angry * 100) / 100,
              fearful: Math.round(expressions.fearful * 100) / 100,
              disgusted: Math.round(expressions.disgusted * 100) / 100,
              surprised: Math.round(expressions.surprised * 100) / 100,
            },
            eyeContact: {
              score: Math.round(eyeContact.score * 100) / 100,
              looking: eyeContact.looking,
              direction: eyeContact.direction,
              confidence: Math.round(eyeContact.confidence * 100) / 100
            },
            engagement: {
              score: Math.round(engagement * 100) / 100,
              stability: Math.round(calculateStability(expressions) * 100) / 100,
            },
            facePosition: {
              x: Math.round(faceBox.x),
              y: Math.round(faceBox.y),
              width: Math.round(faceBox.width),
              height: Math.round(faceBox.height),
              centered: isFaceCentered(faceBox, video)
            }
          };
        } else {
          analysis = {
            timestamp: Date.now(),
            faceDetected: false,
            confidence: 0,
            expressions: { neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 },
            eyeContact: { score: 0, looking: false, direction: 'none', confidence: 0 },
            engagement: { score: 0, stability: 0 },
            facePosition: null
          };
        }

        setCurrentAnalysis(analysis);
        setBehaviorData((prev) => [...prev.slice(-19), analysis]); // Keep last 20 data points

      } catch (error) {
        console.error("Error during facial analysis:", error);
        setCurrentAnalysis({
          timestamp: Date.now(), faceDetected: false, confidence: 0, expressions: {}, eyeContact: {}, engagement: {}, error: error.message
        });
      }
    }, 1000); // Analyze every 1 second
  };

  // 3. Improved Eye Contact Calculation
  const calculateImprovedEyeContact = (landmarks, faceBox, video) => {
    if (!landmarks || !faceBox || !video) {
      return { score: 0, looking: false, direction: 'unknown', confidence: 0 };
    }

    try {
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const nose = landmarks.getNose();

      if (!leftEye || !rightEye || !nose || leftEye.length === 0 || rightEye.length === 0 || nose.length === 0) {
        return { score: 0, looking: false, direction: 'unknown', confidence: 0 };
      }

      const leftEyeCenter = calculateCenter(leftEye);
      const rightEyeCenter = calculateCenter(rightEye);
      const noseCenter = calculateCenter(nose);

      const faceCenterX = faceBox.x + (faceBox.width / 2);
      const faceCenterY = faceBox.y + (faceBox.height / 2);

      const screenCenterX = video.videoWidth / 2;
      const screenCenterY = video.videoHeight / 2;

      const eyeSymmetry = calculateEyeSymmetry(leftEyeCenter, rightEyeCenter, noseCenter);
      const eyeOpenness = calculateEyeOpenness(leftEye, rightEye);
      const faceDirection = calculateFaceDirection(faceCenterX, faceCenterY, screenCenterX, screenCenterY, faceBox);
      const centerProximity = calculateCenterProximity(faceCenterX, faceCenterY, screenCenterX, screenCenterY, video);

      const eyeContactScore = (
        eyeSymmetry * 0.3 +
        eyeOpenness * 0.25 +
        centerProximity * 0.35 +
        (1 - Math.abs(faceDirection.horizontal)) * 0.1
      );

      const finalScore = Math.max(0, Math.min(1, eyeContactScore));
      const isLooking = finalScore > 0.6; // Threshold for "looking"

      return {
        score: finalScore,
        looking: isLooking,
        direction: faceDirection.description,
        confidence: Math.min(eyeSymmetry + eyeOpenness, 1)
      };

    } catch (error) {
      console.error("Error calculating eye contact:", error);
      return { score: 0, looking: false, direction: 'error', confidence: 0 };
    }
  };

  // 4. Auxiliary Functions for Calculations
  const calculateCenter = (points) => {
    const sum = points.reduce((acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y
    }), { x: 0, y: 0 });

    return {
      x: sum.x / points.length,
      y: sum.y / points.length
    };
  };

  const calculateEyeSymmetry = (leftEyeCenter, rightEyeCenter, noseCenter) => {
    try {
      const leftDistance = Math.abs(leftEyeCenter.x - noseCenter.x);
      const rightDistance = Math.abs(rightEyeCenter.x - noseCenter.x);
      if (leftDistance === 0 && rightDistance === 0) return 1;
      const maxDistance = Math.max(leftDistance, rightDistance);
      const minDistance = Math.min(leftDistance, rightDistance);
      return maxDistance > 0 ? minDistance / maxDistance : 1;
    } catch (error) {
      return 0.5;
    }
  };

  const calculateEyeOpenness = (leftEye, rightEye) => {
    try {
      const leftEAR = calculateEAR(leftEye);
      const rightEAR = calculateEAR(rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2;
      return Math.max(0, Math.min(1, avgEAR * 4)); // Normalize EAR to 0-1
    } catch (error) {
      return 0.7;
    }
  };

  const calculateEAR = (eyePoints) => {
    if (eyePoints.length < 6) return 0;
    const vertical1 = Math.abs(eyePoints[1].y - eyePoints[5].y);
    const vertical2 = Math.abs(eyePoints[2].y - eyePoints[4].y);
    const horizontal = Math.abs(eyePoints[0].x - eyePoints[3].x);
    return horizontal === 0 ? 0 : (vertical1 + vertical2) / (2 * horizontal);
  };

  const calculateFaceDirection = (faceCenterX, faceCenterY, screenCenterX, screenCenterY, faceBox) => {
    const horizontalOffset = (faceCenterX - screenCenterX) / (screenCenterX);
    const verticalOffset = (faceCenterY - screenCenterY) / (screenCenterY);
    let description = 'center';
    if (Math.abs(horizontalOffset) > 0.3) {
      description = horizontalOffset > 0 ? 'right' : 'left';
    }
    if (Math.abs(verticalOffset) > 0.3) {
      description += verticalOffset > 0 ? '_down' : '_up';
    }
    return { horizontal: horizontalOffset, vertical: verticalOffset, description: description };
  };

  const calculateCenterProximity = (faceCenterX, faceCenterY, screenCenterX, screenCenterY, video) => {
    const distance = Math.sqrt(
      Math.pow(faceCenterX - screenCenterX, 2) +
      Math.pow(faceCenterY - screenCenterY, 2)
    );
    const maxDistance = Math.sqrt(
      Math.pow(video.videoWidth / 2, 2) +
      Math.pow(video.videoHeight / 2, 2)
    );
    return Math.max(0, 1 - (distance / maxDistance));
  };

  const isFaceCentered = (faceBox, video) => {
    const faceCenterX = faceBox.x + (faceBox.width / 2);
    const faceCenterY = faceBox.y + (faceBox.height / 2);
    const screenCenterX = video.videoWidth / 2;
    const screenCenterY = video.videoHeight / 2;
    const horizontalThreshold = video.videoWidth * 0.2;
    const verticalThreshold = video.videoHeight * 0.2;
    return Math.abs(faceCenterX - screenCenterX) < horizontalThreshold &&
           Math.abs(faceCenterY - screenCenterY) < verticalThreshold;
  };

  // 5. Improved Engagement Calculation
  const calculateEngagement = (expressions) => {
    if (!expressions || typeof expressions !== 'object') return 0;
    try {
      const positiveEngagement =
        (expressions.happy || 0) * 1.2 +
        (expressions.surprised || 0) * 0.8 +
        (expressions.neutral || 0) * 0.6;

      const negativeEngagement =
        (expressions.sad || 0) * 0.9 +
        (expressions.angry || 0) * 1.0 +
        (expressions.fearful || 0) * 0.8 +
        (expressions.disgusted || 0) * 0.9;

      const rawScore = positiveEngagement - negativeEngagement;
      const normalizedScore = Math.max(0, Math.min(1, (rawScore + 1) / 2));
      return normalizedScore;
    } catch (error) {
      console.error("Error calculating engagement:", error);
      return 0.5;
    }
  };

  // 6. Improved Stability Calculation
  const calculateStability = (expressions) => {
    if (!expressions || typeof expressions !== 'object') return 0;
    try {
      const values = Object.values(expressions).filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
      if (values.length === 0) return 0;
      const sum = values.reduce((a, b) => a + b, 0);
      const maxValue = Math.max(...values);
      if (sum === 0) return 0;
      const dominance = maxValue / sum;
      const mean = sum / values.length;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
      const stability = Math.max(0, 1 - variance);
      return (dominance * 0.6) + (stability * 0.4);
    } catch (error) {
      console.error("Error calculating stability:", error);
      return 0.5;
    }
  };

  // 7. Stop Facial Analysis
  const stopFaceAnalysis = () => {
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
      analysisInterval.current = null;
      console.log("Facial analysis stopped.");
    }
  };

  // Placeholder for getting video stream
  useEffect(() => {
    const startVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    startVideoStream();
  }, []);




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


const startRecording = async () => {
  try {
    console.log('🎬 Iniciando gravação...');
    
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
      console.log('🎬 MediaRecorder parou automaticamente');
      const blob = new Blob(recordedChunks.current, {
        type: "video/webm",
      });
      
      const finalTranscript = transcription || "Nenhuma transcrição capturada";
      console.log('💾 Salvando resposta com transcrição:', finalTranscript);
      
      saveResponse(blob, finalTranscript);
    };

    mediaRecorder.start(1000);
    setIsRecording(true);

    // ⭐ CHAMADA DA ANÁLISE FACIAL REAL - ADICIONE ESTA LINHA
    startFaceAnalysis();

    // Iniciar reconhecimento de fala se suportado
    if (speechSupported && speechService) {
      try {
        speechService.start();
        setIsSpeechActive(true);
      } catch (error) {
        console.error('Erro ao iniciar reconhecimento de fala:', error);
        setSpeechError(error.message);
      }
    }

  } catch (error) {
    console.error('Erro durante a gravação:', error);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setSpeechError(`Erro na gravação: ${error.message}`);
  }
};

  // Função melhorada para parar gravação - SUBSTITUIR stopRecording
// Substituir a função stopRecording existente
const stopRecording = () => {
  console.log('🛑 Parando gravação...', { isRecording, isSpeechActive });
  
  if (mediaRecorderRef.current && isRecording) {
    // Parar gravação de vídeo
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    
    // Parar análise facial
    stopFaceAnalysis();

    let finalTranscript = "";

    // Parar reconhecimento de fala se estiver ativo
    if (speechSupported && speechService && isSpeechActive) {
      try {
        finalTranscript = speechService.stop() || "";
        setIsSpeechActive(false);
        console.log('🎤 Transcrição final do speech service:', finalTranscript);
      } catch (error) {
        console.error('Erro ao parar speech service:', error);
        finalTranscript = transcription || "";
      }
    } else {
      // Se não há speech recognition, usar transcrição atual
      finalTranscript = transcription || "";
      console.log('📝 Usando transcrição atual:', finalTranscript);
    }

    // Criar blob manualmente para parada manual
    const blob = new Blob(recordedChunks.current, { type: "video/webm" });
    
    // Salvar resposta manualmente (para paradas manuais)
    console.log('💾 Salvando resposta manual com transcrição:', finalTranscript);
    saveResponse(blob, finalTranscript);

    return finalTranscript;
  }
};

  // Simular transcrição
// Substituir a função saveResponse existente
const saveResponse = (blob, finalTranscript) => {
  console.log('💾 Executando saveResponse...', {
    hasBlob: !!blob,
    transcription: finalTranscript,
    currentQuestion: currentQuestion,
    questionText: questions[currentQuestion]?.text
  });

  const questionBehaviorData = behaviorData.filter(
    (data) =>
      data.timestamp >=
      Date.now() - (questions[currentQuestion]?.timeLimit * 1000 || 120000)
  );

  const avgEngagement =
    questionBehaviorData.length > 0
      ? questionBehaviorData.reduce(
          (acc, curr) => acc + (curr.engagement?.score || 0),
          0
        ) / questionBehaviorData.length
      : 0;

  const avgEyeContact =
    questionBehaviorData.length > 0
      ? questionBehaviorData.reduce(
          (acc, curr) => acc + (curr.eyeContact?.score || 0),
          0
        ) / questionBehaviorData.length
      : 0;

  const dominantExpression = questionBehaviorData.reduce((acc, curr) => {
    const expressions = curr.expressions || {};
    const expressionKeys = Object.keys(expressions);
    if (expressionKeys.length > 0) {
      const maxExpr = expressionKeys.reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );
      acc[maxExpr] = (acc[maxExpr] || 0) + 1;
    }
    return acc;
  }, {});

  // Garantir que temos uma transcrição válida
  const validTranscription = finalTranscript && finalTranscript.trim() !== "" 
    ? finalTranscript.trim() 
    : transcription && transcription.trim() !== ""
    ? transcription.trim()
    : "Resposta de áudio capturada sem transcrição de texto";

  console.log('💬 Salvando resposta com transcrição validada:', validTranscription);

  const newResponse = {
    questionId: questions[currentQuestion]?.id,
    question: questions[currentQuestion]?.text,
    category: questions[currentQuestion]?.category,
    purpose: questions[currentQuestion]?.purpose,
    basedOnCV: questions[currentQuestion]?.basedOnCV,
    transcription: validTranscription, // TRANSCRIÇÃO DA RESPOSTA DO USUÁRIO
    audioBlob: blob, // BLOB DO ÁUDIO/VÍDEO
    duration: (questions[currentQuestion]?.timeLimit || 120) - timeLeft,
    timestamp: new Date().toISOString(),
    behaviorAnalysis: {
      avgEngagement: Number(avgEngagement.toFixed(2)) || 0,
      avgEyeContact: Number(avgEyeContact.toFixed(2)) || 0,
      dominantExpression: Object.keys(dominantExpression)[0] || "neutral",
      dataPoints: questionBehaviorData.length,
    },
  };

  setResponses((prev) => {
    const updatedResponses = [...prev, newResponse];
    console.log('📝 Resposta adicionada. Total de respostas:', updatedResponses.length);
    return updatedResponses;
  });

  // Resetar a transcrição para a próxima pergunta
  setTranscription("");
  console.log('✅ saveResponse concluído');
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
  // Primeiro para a gravação atual (que já chama saveResponse)
  stopRecording();

  // Limpa a transcrição imediatamente
  setTranscription("");

  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion((prev) => prev + 1);
    setTimeLeft(questions[currentQuestion + 1]?.timeLimit || 120);
    
    // Inicia nova gravação após um pequeno delay
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
