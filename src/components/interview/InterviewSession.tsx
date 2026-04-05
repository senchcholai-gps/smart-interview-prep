import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { API_URL } from "../../services/api";


interface JobProfile {
  id: string;
  jobRole: string;
  jobDescription: string;
  yearsOfExperience: string;
  techStacks: string[];
  createdAt: string;
}

interface Props {
  profile: JobProfile;
  onEnd: () => void;
}

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
  correctAnswer: string;
  keyPoints: string[];
}

interface Answer {
  questionId: number;
  userAnswer: string;
  rating: number;
  matchedPoints: string[];
  missedPoints: string[];
  correctAnswer: string;
}

interface QuestionSet {
  id: string;
  questions: Question[];
  answered: number[];
}

interface Feedback {
  matched: string[];
  missing: string[];
  rating: number;
  wordCount: number;
  feedback: string;
  modelAnswerLong: string;
}

// Helper function to clean strings
const cleanString = (str: string): string => {
  if (!str) return "";
  return str.replace(/[? ]/g, '').trim();
};

// Helper to extract a balanced JSON string
const extractBalancedJSON = (text: string, isArray: boolean): string => {
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';
  const start = text.indexOf(openBracket);
  if (start === -1) return text;
  
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === openBracket) depth++;
      else if (char === closeBracket) depth--;
      
      if (depth === 0) {
        return text.substring(start, i + 1);
      }
    }
  }
  return text.substring(start);
};

const InterviewSession: React.FC<Props> = ({ profile, onEnd }) => {
  // Clean the profile data on receipt
  const cleanedProfile = {
    ...profile,
    jobRole: cleanString(profile.jobRole),
    jobDescription: cleanString(profile.jobDescription),
    yearsOfExperience: cleanString(profile.yearsOfExperience),
    techStacks: profile.techStacks.map(tech => cleanString(tech))
  };

  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [showNextSetPrompt, setShowNextSetPrompt] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isTranscribing, setIsTranscribing] = useState(false);
  // SpeechRecognition ref — browser-native, no API quota used
  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef<string>("");
  // Guard against React StrictMode double-invoking the load effect
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Request camera AND mic together on session start so browser shows its Allow/Block prompt
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        setMicPermission('granted');
        // Stop the tracks — Webcam component will manage its own stream
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {
        // User denied or hardware unavailable — let them still try via Start Recording
        setMicPermission('denied');
      });
  }, []);

  // Transcript effect no longer needed since we handle chunks explicitly

  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, []);



  const getAskedQuestionsKey = () => `asked_${cleanedProfile.id}`;

  const getAskedQuestions = (): string[] => {
    const history = localStorage.getItem(getAskedQuestionsKey());
    return history ? JSON.parse(history) : [];
  };

  const saveAskedQuestions = (newQuestions: Question[]) => {
    const history = getAskedQuestions();
    const updated = [...history, ...newQuestions.map(q => q.question)];
    if (updated.length > 200) updated.splice(0, updated.length - 200);
    localStorage.setItem(getAskedQuestionsKey(), JSON.stringify(updated));
  };

  const getExperienceLevel = (years: string): string => {
    const numYears = parseInt(years.split('-')[0] || '0');
    if (numYears < 2) return 'fresher';
    if (numYears < 4) return 'junior';
    if (numYears < 7) return 'mid-level';
    return 'senior';
  };

  // ========== DATABASE SAVE FUNCTION ==========
  const saveInterviewToDatabase = async () => {
    try {
      setIsSaving(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user || !user._id) {
        console.log('No user logged in, skipping database save');
        return;
      }

      // Calculate final score if not already set
      const calculatedScore = finalScore || (answers.length > 0
        ? answers.reduce((sum, a) => sum + a.rating, 0) / answers.length
        : 0);

      // Prepare questions with details
      const questionsWithDetails = answers.map(a => {
        let questionText = '';
        // Find which set and question this answer belongs to
        for (const set of questionSets) {
          const q = set.questions.find(q => q.id === a.questionId);
          if (q) {
            questionText = q.question;
            break;
          }
        }
        return {
          question: questionText,
          answer: a.userAnswer,
          rating: a.rating,
          correctAnswer: a.correctAnswer,
          matchedPoints: a.matchedPoints,
          missedPoints: a.missedPoints
        };
      });

      const interviewData = {
        userId: user._id,
        userName: user.name || user.username || 'Unknown',
        email: user.email,
        jobRole: cleanedProfile.jobRole,
        techStack: cleanedProfile.techStacks.join(', '),
        experience: cleanedProfile.yearsOfExperience,
        questions: questionsWithDetails,
        answers: answers.map(a => a.userAnswer),
        score: calculatedScore,
        totalQuestions: answers.length,
        date: new Date().toISOString()
      };

      console.log('📤 Saving interview to database:', interviewData);

      const response = await fetch(`${API_URL}/api/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Interview saved to database:', result);

    } catch (error) {
      console.error('❌ Error saving interview:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Parse quota error to get retry time
  const parseQuotaError = (errorMessage: string): number | null => {
    const retryMatch = errorMessage.match(/retry in ([\d.]+)s/);
    if (retryMatch && retryMatch[1]) {
      return parseFloat(retryMatch[1]);
    }
    return null;
  };

  // GEMINI question generation with proper error handling
  const generateQuestionSet = async (setNumber: number): Promise<Question[]> => {
    const timestamp = Date.now();
    const asked = getAskedQuestions();
    const experienceLevel = getExperienceLevel(cleanedProfile.yearsOfExperience);
    setApiError(null);

    try {


      const prompt = `Generate 5 UNIQUE technical interview questions for a ${cleanedProfile.jobRole} position.
      Candidate's Tech Stack: ${cleanedProfile.techStacks.join(", ")}
      Experience Level: ${experienceLevel} (${cleanedProfile.yearsOfExperience} years)
      Job Description: ${cleanedProfile.jobDescription}

      CRITICAL REQUIREMENTS:
      1. Questions must be SPECIFIC to these technologies: ${cleanedProfile.techStacks.join(", ")}
      2. For fresher (<2 years): Focus on fundamentals, basic concepts, learning journey
      3. For junior (2-4 years): Focus on practical experience, best practices
      4. For mid-level (4-7 years): Focus on architecture, problem-solving
      5. For senior (7+ years): Focus on system design, mentoring, complex scenarios

      PREVIOUSLY ASKED QUESTIONS (ABSOLUTELY AVOID THESE):
      ${asked.slice(-10).map((q, i) => `${i + 1}. ${q}`).join('\n')}

      Return ONLY a valid JSON array with this exact format, no other text:
      [
        {
          "id": 1,
          "question": "Specific question about one of their technologies",
          "category": "Technical",
          "difficulty": "Easy/Medium/Hard",
          "correctAnswer": "Detailed correct answer with examples (150+ words)",
          "keyPoints": ["point1", "point2", "point3", "point4", "point5"]
        }
      ]`;

      console.log(`Sending prompt to backend Gemini API...`);
      const apiResponse = await fetch(`${API_URL}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await apiResponse.json();
      
      if (!apiResponse.ok || data.error) {
        throw new Error(data.error?.message || data.error || "Unknown error from Gemini API");
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Invalid response structure from backend Gemini API");
      console.log("Gemini response received from backend");

      let cleanText = extractBalancedJSON(text, true);

      let questions;
      try {
        questions = JSON.parse(cleanText);
      } catch (parseError: any) {
        console.error("Failed to parse cleaned text:", cleanText);
        throw new Error("Invalid response format from Gemini - " + parseError.message);
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("No questions generated");
      }

      return questions.slice(0, 5).map((q: any, i: number) => ({
        ...q,
        id: parseInt(`${timestamp}${setNumber}${i}`)
      }));

    } catch (error: any) {
      console.error("Gemini API Error:", error);

      // Check for quota error
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        setQuotaExceeded(true);
        const retrySeconds = parseQuotaError(error.message);
        setRetryAfter(retrySeconds);
        throw new Error(`QUOTA_EXCEEDED:${retrySeconds || 60}`);
      }

      setApiError(error instanceof Error ? error.message : "Failed to generate questions");
      throw error;
    }
  };

  // ========== NONSENSE DETECTION FUNCTION ==========
  const isNonsenseAnswer = (answer: string): { isNonsense: boolean; reason: string } => {
    const trimmed = answer.trim();
    const wordCount = trimmed.split(/\s+/).length;
    const noSpaces = trimmed.replace(/\s+/g, '');

    // Check for single character
    if (/^[a-zA-Z0-9]$/.test(trimmed)) {
      return { isNonsense: true, reason: "single_character" };
    }

    // Check for repeated single character (mmmmm, aaaaa)
    if (/^(.)\1+$/.test(noSpaces)) {
      return { isNonsense: true, reason: "repeated_characters" };
    }

    // Check for keyboard mash (asdfgh, qwerty)
    if (/^[asdfghjklqwertyuiopzxcvbnm]+$/.test(noSpaces) && noSpaces.length > 3) {
      return { isNonsense: true, reason: "keyboard_mash" };
    }

    // Check for only symbols (???, !!!, ...)
    if (/^[^a-zA-Z0-9]+$/.test(noSpaces)) {
      return { isNonsense: true, reason: "only_symbols" };
    }

    // Check for "I don't know" patterns
    const dontKnowPatterns = [
      "i don't know", "idk", "no idea", "not sure", "don't understand",
      "what", "huh", "dunno", "no clue", "i dont know"
    ];

    const lowerAnswer = trimmed.toLowerCase();
    for (const pattern of dontKnowPatterns) {
      if (lowerAnswer.includes(pattern)) {
        return { isNonsense: true, reason: "dont_know" };
      }
    }

    // Check for very short answers (less than 3 words)
    if (wordCount < 3 && trimmed.length < 15) {
      return { isNonsense: true, reason: "too_short" };
    }

    // Check for no letters at all (just numbers or symbols)
    if (!/[a-zA-Z]/.test(noSpaces)) {
      return { isNonsense: true, reason: "no_letters" };
    }

    // Check for gibberish (more than 4 repeats of any character)
    if (/(.)\1{4,}/.test(noSpaces)) {
      return { isNonsense: true, reason: "gibberish" };
    }

    return { isNonsense: false, reason: "" };
  };

  // ========== FALLBACK MODEL ANSWER GENERATOR ==========
  const generateFallbackModelAnswer = (question: string, keyPoints: string[], targetLength: number): string => {
    const q = question.toLowerCase();

    // CSS Box Model question
    if (q.includes('box model') || q.includes('css box')) {
      const baseAnswer = `The CSS Box Model consists of four components: content, padding, border, and margin. Content is where text/images appear. Padding creates space inside the element around content. Border surrounds padding. Margin creates space outside the element.`;

      const enhancedAnswer = `The CSS Box Model is fundamental to web layout. It comprises:
- Content: The actual text or media
- Padding: Inner spacing, part of element background
- Border: Visual boundary around padding
- Margin: Outer spacing between elements

By default, width sets content width only (content-box). border-box includes padding/border in width, making layouts more predictable.`;

      return targetLength < 80 ? baseAnswer : enhancedAnswer;
    }

    // HTML semantics question
    if (q.includes('div') && (q.includes('section') || q.includes('article'))) {
      const baseAnswer = `<nav> is the semantic container for navigation links. Inside, use <ul> with <li> for each link containing <a> tags. This structure improves accessibility and SEO.`;

      const enhancedAnswer = `For navigation bars, use semantic HTML5 elements:
- <nav> as the primary container (indicates navigation section)
- <ul> to group related links (logical list structure)
- <li> for each navigation item
- <a> for the actual hyperlinks

This structure helps screen readers announce "navigation" section and lets users skip it. It also improves SEO as search engines understand site structure better.`;

      return targetLength < 100 ? baseAnswer : enhancedAnswer;
    }

    // React questions
    if (q.includes('react') || q.includes('useState')) {
      const baseAnswer = `useState is a React hook that adds state to functional components. It returns an array with the current state value and a setter function to update it.`;

      const enhancedAnswer = `useState is a React hook for managing state in functional components. It returns an array containing the current state value and an updater function. The updater can accept a new value directly or a function that receives previous state. State updates trigger re-renders. Unlike this.setState in classes, useState doesn't merge objects automatically.`;

      return targetLength < 80 ? baseAnswer : enhancedAnswer;
    }

    // Default answer
    return `A good answer should cover: ${keyPoints.slice(0, 3).join(', ')}. For a complete response, also mention ${keyPoints.slice(3).join(', ')}.`;
  };

  // ========== FAIR EVALUATION USING GEMINI WITH CONTROLLED MODEL ANSWER LENGTH ==========
  const compareAnswers = async (userAns: string, correctAns: string, keyPoints: string[], question: string): Promise<Feedback> => {
    try {
      // NONSENSE DETECTION FIRST
      const wordCount = userAns.split(/\s+/).length;
      const nonsenseCheck = isNonsenseAnswer(userAns);

      if (nonsenseCheck.isNonsense) {
        console.log(`Nonsense answer detected: ${nonsenseCheck.reason}`);

        return {
          matched: [],
          missing: keyPoints,
          rating: 1,
          wordCount,
          feedback: "Your answer does not address the question. Please provide a meaningful response.",
          modelAnswerLong: generateFallbackModelAnswer(question, keyPoints, 100)
        };
      }

      // Calculate user answer stats
      const userWordCount = userAns.split(/\s+/).length;

      // Target model answer length: slightly longer than user's (20-40% more)
      let targetLength = Math.min(
        Math.max(
          Math.floor(userWordCount * 1.3), // 30% longer than user's answer
          50 // Minimum 50 words
        ),
        200 // Maximum 200 words
      );

      console.log(`User answer: ${userWordCount} words, Target model: ${targetLength} words`);



      const prompt = `
You are evaluating a technical interview answer. The user's answer is shown below.

QUESTION: ${question}

EXPECTED KEY POINTS:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

USER'S ANSWER:
${userAns}

TASK 1 - EVALUATION:
Check which key points the user covered. Be generous - if they mention a concept even briefly, count it.
Score 1-10 based on coverage and quality.

TASK 2 - GENERATE MODEL ANSWER:
Create a model answer that:
- Is approximately ${targetLength} words long (slightly longer than the user's answer)
- Covers all the key points the user missed
- Provides slightly more detail than the user's answer, but not excessively long
- Is well-structured but concise

Return ONLY a valid JSON object with this exact structure:
{
  "matched": ["key point 1", "key point 3"],
  "missing": ["key point 2", "key point 4"],
  "rating": 8,
  "wordCount": ${wordCount},
  "feedback": "Brief feedback explaining what they did well and what they missed",
  "modelAnswerLong": "Your model answer here (approximately ${targetLength} words)"
}
`;

      console.log(`Evaluating answer with backend Gemini API...`);
      const apiResponse = await fetch(`${API_URL}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await apiResponse.json();
      
      if (!apiResponse.ok || data.error) {
        throw new Error(data.error?.message || data.error || "Unknown error from Gemini API");
      }

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error("Invalid response structure from backend Gemini API");

      // Parse JSON response safely
      let cleanResponse = extractBalancedJSON(responseText, false);

      let evaluation;
      try {
        evaluation = JSON.parse(cleanResponse);
      } catch (e) {
        console.error("Failed to parse evaluation JSON:", cleanResponse);
        // Fallback simple parsing logic if JSON parse fails completely
        throw new Error("Invalid evaluation response from Gemini");
      }

      // Ensure rating is within bounds
      evaluation.rating = Math.min(10, Math.max(1, evaluation.rating));
      evaluation.wordCount = wordCount;

      console.log("Evaluation complete:", evaluation);
      return evaluation;

    } catch (error: any) {
      console.error("Gemini evaluation failed:", error);

      // Check for quota error
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        setQuotaExceeded(true);
        const retrySeconds = parseQuotaError(error.message);
        setRetryAfter(retrySeconds);
        throw new Error(`QUOTA_EXCEEDED:${retrySeconds || 60}`);
      }

      // Fallback evaluation
      const wordCount = userAns.split(/\s+/).length;
      const nonsenseCheck = isNonsenseAnswer(userAns);

      if (nonsenseCheck.isNonsense) {
        return {
          matched: [],
          missing: keyPoints,
          rating: 1,
          wordCount,
          feedback: "Please provide a meaningful answer.",
          modelAnswerLong: generateFallbackModelAnswer(question, keyPoints, 100)
        };
      }

      // Simple keyword matching for fallback
      const userLower = userAns.toLowerCase();
      const matched: string[] = [];
      const missing: string[] = [];

      keyPoints.forEach(point => {
        if (userLower.includes(point.toLowerCase())) {
          matched.push(point);
        } else {
          missing.push(point);
        }
      });

      const matchPercentage = matched.length / keyPoints.length;
      let rating = Math.round(matchPercentage * 10);
      rating = Math.min(10, Math.max(1, rating));

      // Generate appropriate length model answer
      const targetLength = Math.min(Math.max(wordCount + 15, 50), 150);
      const fallbackModelAnswer = generateFallbackModelAnswer(question, keyPoints, targetLength);

      return {
        matched,
        missing,
        rating,
        wordCount,
        feedback: rating >= 8
          ? "Good answer! You covered most key points. Compare with the model answer for additional details."
          : "You've made a good start. Review the model answer to see what you missed.",
        modelAnswerLong: fallbackModelAnswer
      };
    }
  };

  // Load first set — guarded against React StrictMode double-invoke
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const cacheKey = `questions_cache_${cleanedProfile.id}`;

    const loadFirstSet = async () => {
      // Check localStorage cache first to avoid burning API quota
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedQuestions: Question[] = JSON.parse(cached);
          if (Array.isArray(cachedQuestions) && cachedQuestions.length > 0) {
            console.log('📦 Loaded questions from cache — no API call used');
            setQuestionSets([{
              id: `set_1_cached_${Date.now()}`,
              questions: cachedQuestions,
              answered: []
            }]);
            setIsLoading(false);
            return;
          }
        } catch (_) {
          localStorage.removeItem(cacheKey);
        }
      }

      setIsLoading(true);
      setApiError(null);
      setQuotaExceeded(false);
      try {
        const questions = await generateQuestionSet(1);
        setQuestionSets([{
          id: `set_1_${Date.now()}`,
          questions,
          answered: []
        }]);
        saveAskedQuestions(questions);
        // Cache for next visit — avoids re-calling API on refresh/StrictMode
        localStorage.setItem(cacheKey, JSON.stringify(questions));
      } catch (error: any) {
        console.error("Failed to load questions:", error);
        if (!error.message?.includes('QUOTA_EXCEEDED')) {
          setApiError(error.message || "Failed to load questions");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadFirstSet();
  }, [cleanedProfile.id]);

  const generateNextSet = async () => {
    setIsGenerating(true);
    setApiError(null);
    try {
      const nextSetNumber = questionSets.length + 1;
      const questions = await generateQuestionSet(nextSetNumber);
      const newSet = {
        id: `set_${nextSetNumber}_${Date.now()}`,
        questions,
        answered: []
      };
      setQuestionSets(prev => [...prev, newSet]);
      setCurrentSetIndex(questionSets.length);
      setCurrentQuestionIndex(0);
      setShowNextSetPrompt(false);
      saveAskedQuestions(questions);
    } catch (error: any) {
      console.error("Error generating next set:", error);
      if (error.message?.includes('QUOTA_EXCEEDED')) {
        // Quota error is already handled
      } else {
        setApiError(error.message || "Failed to generate next set");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const startRecording = async () => {
    if (!isMicEnabled) {
      alert("Please turn on your microphone using the toggle button first.");
      return;
    }

    // Use browser-native SpeechRecognition — zero Gemini quota cost
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Your browser does not support voice recognition. Please type your answer instead.");
      setIsSpeechSupported(false);
      return;
    }

    try {
      // Request mic permission explicitly so we can update state
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied. Please allow microphone access in your browser settings.");
      setMicPermission('denied');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    interimTranscriptRef.current = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      if (final) {
        setUserAnswer(prev => (prev ? prev + " " + final.trim() : final.trim()));
      }
      interimTranscriptRef.current = interim;
    };

    recognition.onerror = (event: any) => {
      console.error("SpeechRecognition error:", event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please allow microphone permissions.");
        setMicPermission('denied');
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      // Flush any remaining interim text
      if (interimTranscriptRef.current.trim()) {
        setUserAnswer(prev =>
          (prev ? prev + " " + interimTranscriptRef.current.trim() : interimTranscriptRef.current.trim())
        );
        interimTranscriptRef.current = "";
      }
    };

    recognition.start();
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert("Please provide an answer");
      return;
    }

    if (isRecording) stopRecording();

    const currentSet = questionSets[currentSetIndex];
    const currentQ = currentSet.questions[currentQuestionIndex];

    setIsEvaluating(true);

    try {
      const comparison = await compareAnswers(
        userAnswer,
        currentQ.correctAnswer,
        currentQ.keyPoints,
        currentQ.question
      );

      setCurrentFeedback(comparison);
      setShowFeedback(true);

      setAnswers([...answers, {
        questionId: currentQ.id,
        userAnswer,
        rating: comparison.rating,
        matchedPoints: comparison.matched,
        missedPoints: comparison.missing,
        correctAnswer: currentQ.correctAnswer
      }]);

      const updated = [...questionSets];
      updated[currentSetIndex].answered.push(currentQuestionIndex);
      setQuestionSets(updated);
    } catch (error: any) {
      console.error("Error evaluating answer:", error);
      if (error.message?.includes('QUOTA_EXCEEDED')) {
        // Quota error is already handled
      } else {
        alert("Failed to evaluate answer. Please try again.");
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    const currentSet = questionSets[currentSetIndex];
    if (currentQuestionIndex < currentSet.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
      setShowFeedback(false);
    } else {
      setShowNextSetPrompt(true);
    }
  };

  const handleEnd = async () => {
    if (answers.length === 0) {
      setFinalScore(0);
    } else {
      const total = answers.reduce((sum, a) => sum + a.rating, 0) / answers.length;
      setFinalScore(total);
    }

    await saveInterviewToDatabase();
    setShowSummary(true);
  };

  // Function to generate overall feedback based on final score
  const getOverallFeedback = (score: number, totalQuestions: number) => {
    if (totalQuestions === 0) {
      return {
        message: "📝 No answers provided. Please complete the interview to receive feedback.",
        recommendation: "Try answering at least one question to get personalized feedback."
      };
    }
    
    if (score >= 9) {
      return {
        message: "🌟 Outstanding Performance! 🌟",
        feedback: "You have demonstrated exceptional knowledge and communication skills. Your answers were comprehensive, well-structured, and covered key concepts thoroughly.",
        recommendation: "You're ready for senior-level interviews! Keep practicing with advanced topics and system design questions.",
        color: "text-green-700"
      };
    } else if (score >= 8) {
      return {
        message: "🎉 Excellent Performance! 🎉",
        feedback: "Great job! You have a strong command of the subject matter. Your answers were clear, accurate, and well-organized.",
        recommendation: "Focus on adding more real-world examples and diving deeper into complex scenarios.",
        color: "text-green-600"
      };
    } else if (score >= 7) {
      return {
        message: "👍 Good Performance! 👍",
        feedback: "Well done! You have a solid understanding of the concepts. Most of your answers were accurate and well-explained.",
        recommendation: "Practice elaborating on key points and providing more detailed examples.",
        color: "text-blue-600"
      };
    } else if (score >= 6) {
      return {
        message: "📈 Good Effort! 📈",
        feedback: "You're on the right track! You showed understanding of the main concepts but could add more depth.",
        recommendation: "Review the model answers to see how you can expand on your responses.",
        color: "text-yellow-600"
      };
    } else if (score >= 5) {
      return {
        message: "📚 Making Progress! 📚",
        feedback: "You have a basic understanding but need to work on providing more complete answers.",
        recommendation: "Focus on covering all key points in your responses. Use the STAR method for behavioral questions.",
        color: "text-yellow-600"
      };
    } else if (score >= 3) {
      return {
        message: "⚠️ Needs Improvement ⚠️",
        feedback: "Your answers show potential but lack depth and detail. Don't worry — practice makes perfect!",
        recommendation: "Start with fundamentals, watch tutorials, and practice answering questions aloud.",
        color: "text-orange-600"
      };
    } else {
      return {
        message: "🔴 Beginner Level 🔴",
        feedback: "This is your first step! Your answers need more development, but every expert was once a beginner.",
        recommendation: "Start with basic concepts, review the model answers, and practice regularly. Consistency is key!",
        color: "text-red-600"
      };
    }
  };

  // Quota exceeded error screen
  if (quotaExceeded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-7xl mb-4 animate-bounce">⏳</div>
          <h2 className="text-3xl font-bold text-orange-600 mb-4">Gemini API Quota Exceeded</h2>
          <div className="bg-orange-100 p-4 rounded-lg mb-6">
            <p className="text-gray-700 mb-2">
              You've reached the free tier limit for Gemini API.
            </p>
            {retryAfter && (
              <p className="text-sm font-semibold text-orange-700">
                Please wait {Math.ceil(retryAfter)} seconds before trying again.
              </p>
            )}
          </div>
          <div className="space-y-3">
            <a
              href="https://ai.google.dev/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              View Gemini Pricing
            </a>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={onEnd}
              className="w-full px-6 py-3 text-gray-500 hover:text-gray-700"
            >
              Return to Dashboard
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Quota resets daily. Check Google AI Studio for usage details.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">Generating questions with Gemini AI...</h2>
          <p className="text-gray-600">For {cleanedProfile.jobRole} with {cleanedProfile.techStacks.join(", ")}</p>
        </div>
      </div>
    );
  }

  if (apiError && !quotaExceeded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{apiError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!questionSets.length || !questionSets[currentSetIndex]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No questions available</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const currentSet = questionSets[currentSetIndex];
  const currentQ = currentSet.questions[currentQuestionIndex];
  const totalAnswered = answers.length;
  const experienceLevel = getExperienceLevel(cleanedProfile.yearsOfExperience);
  
  // Get overall feedback based on final score
  const overallFeedback = getOverallFeedback(finalScore, answers.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{cleanedProfile.jobRole || "Data Analyst"}</h1>
              <p className="text-gray-600">{cleanedProfile.yearsOfExperience || "0-1 years"} years • {experienceLevel || "fresher"}</p>
              <p className="text-sm text-gray-500 mt-1">
                Set {currentSetIndex + 1} • Q{currentQuestionIndex + 1}/{currentSet?.questions.length || 5} • {totalAnswered} answered
                {isSaving && <span className="ml-2 text-green-600">(Saving...)</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCamEnabled(!isCamEnabled)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
                title={isCamEnabled ? "Camera On" : "Camera Off"}
              >
                {isCamEnabled ? <span className="text-2xl">📹</span> : <span className="text-2xl">🚫</span>}
              </button>
              <button
                onClick={() => setIsMicEnabled(!isMicEnabled)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
                title={isMicEnabled ? "Microphone On" : "Microphone Off"}
              >
                {isMicEnabled ? <span className="text-2xl">🎤</span> : <span className="text-2xl">🚫</span>}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {cleanedProfile.techStacks && cleanedProfile.techStacks.length > 0 ? (
              cleanedProfile.techStacks.map((tech, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tech}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">MongoDB</span>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Webcam & Progress */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl overflow-hidden mb-4 relative">
              {isCamEnabled ? (
                <Webcam
                  audio={false}
                  muted={true}
                  ref={webcamRef}
                  className="w-full"
                />
              ) : (
                <div className="h-48 bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400">Camera off</span>
                </div>
              )}
              {isRecording && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  REC {formatTime(recordingTime)}
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-semibold mb-3">Progress</h3>
              <div className="space-y-3">
                {questionSets.map((set, idx) => (
                  <div key={set.id}>
                    <p className="text-sm font-medium text-gray-600 mb-1">Set {idx + 1}</p>
                    <div className="flex gap-1 flex-wrap">
                      {set.questions.map((_, qIdx) => (
                        <div
                          key={qIdx}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${set.answered.includes(qIdx)
                              ? 'bg-green-500 text-white'
                              : idx === currentSetIndex && qIdx === currentQuestionIndex
                                ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                          {qIdx + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleEnd}
                className="w-full mt-4 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200"
              >
                End Interview
              </button>
            </div>
          </div>

          {/* Right Column - Question & Answer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold">Question {currentQuestionIndex + 1}</h2>
                  <p className="text-sm text-gray-500">{currentQ.category}</p>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {currentQ.difficulty}
                </span>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-4">
                <p className="text-lg">{currentQ.question}</p>
              </div>

              <div className="space-y-3">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={5}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder={isRecording ? "Recording..." : "Type or click Start Recording"}
                  disabled={isRecording}
                />
                {isRecording && (
                  <div className="bg-red-50 p-3 rounded-lg flex items-center gap-2 text-red-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span>Recording... ({formatTime(recordingTime)})</span>
                  </div>
                )}
                {isTranscribing && (
                  <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2 text-blue-700">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing voice... (please wait)</span>
                  </div>
                )}

                <div className="flex gap-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={isEvaluating || isTranscribing}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {isTranscribing ? 'Transcribing...' : 'Start Recording'}
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
                    >
                      Stop ({formatTime(recordingTime)})
                    </button>
                  )}
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || isEvaluating || isTranscribing || isRecording}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isEvaluating ? 'Evaluating...' : 'Submit'}
                  </button>
                </div>
                {isEvaluating && (
                  <div className="text-center text-sm text-blue-600">
                    AI is evaluating your answer...
                  </div>
                )}
              </div>

              {/* Feedback */}
              {showFeedback && currentFeedback && (
                <div className="mt-6 p-6 border-2 border-blue-200 rounded-xl bg-blue-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Answer Analysis</h3>
                    <div className="text-center">
                      <span className="text-4xl font-bold text-blue-600">{currentFeedback.rating}</span>
                      <span className="text-gray-500">/10</span>
                      <p className="text-sm text-gray-500">{currentFeedback.wordCount} words</p>
                    </div>
                  </div>

                  <p className="text-gray-700 bg-white p-3 rounded-lg mb-4">
                    {currentFeedback.feedback}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-800 mb-2">Your Answer</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {userAnswer}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-2">Model Answer</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {currentFeedback.modelAnswerLong}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">You covered ({currentFeedback.matched.length}/{currentQ.keyPoints.length})</h4>
                      <ul className="space-y-1">
                        {currentFeedback.matched.map((item: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700">✓ {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">You missed ({currentFeedback.missing.length}/{currentQ.keyPoints.length})</h4>
                      <ul className="space-y-1">
                        {currentFeedback.missing.map((item: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700">✗ {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={isEvaluating}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                  >
                    {currentQuestionIndex < currentSet.questions.length - 1 ? 'Next Question →' : 'Complete Set'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Set Prompt */}
        {showNextSetPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4">Great Job!</h2>
              <p className="text-gray-600 mb-6">
                You've completed Set {currentSetIndex + 1}. Ready for Set {questionSets.length + 1}?
              </p>
              <div className="space-y-3">
                <button
                  onClick={generateNextSet}
                  disabled={isGenerating}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Yes, more questions!'}
                </button>
                <button
                  onClick={handleEnd}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Modal - WITH OVERALL FEEDBACK */}
        {showSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold mb-4 text-center">Interview Complete! 🎉</h2>
              
              {/* Final Score */}
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-600 mb-2">{finalScore.toFixed(1)}</div>
                <p className="text-xl text-gray-600">out of 10</p>
                <p className="text-gray-500 mt-2">
                  {answers.length} questions across {questionSets.length} sets
                </p>
              </div>

              {/* ========== OVERALL PERFORMANCE FEEDBACK ========== */}
              <div className={`bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border-l-4 ${overallFeedback.color === 'text-green-700' ? 'border-green-500' : overallFeedback.color === 'text-green-600' ? 'border-green-500' : overallFeedback.color === 'text-blue-600' ? 'border-blue-500' : overallFeedback.color === 'text-yellow-600' ? 'border-yellow-500' : overallFeedback.color === 'text-orange-600' ? 'border-orange-500' : 'border-red-500'}`}>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span>📊</span> Overall Performance Feedback
                </h3>
                <div className="space-y-3">
                  <p className={`text-2xl font-bold ${overallFeedback.color}`}>{overallFeedback.message}</p>
                  <p className="text-gray-700">{overallFeedback.feedback}</p>
                  <div className="bg-white p-4 rounded-lg mt-3">
                    <p className="font-semibold text-gray-800 mb-2">💡 Recommendations:</p>
                    <p className="text-gray-700">{overallFeedback.recommendation}</p>
                  </div>
                </div>
              </div>

              {/* Question-wise Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span>📝</span> Question-wise Breakdown
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {answers.map((answer, idx) => {
                    let questionText = '';
                    for (const set of questionSets) {
                      const q = set.questions.find(q => q.id === answer.questionId);
                      if (q) {
                        questionText = q.question;
                        break;
                      }
                    }
                    return (
                      <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-600">Q{idx + 1}:</p>
                            <p className="text-sm text-gray-800 line-clamp-2">{questionText.substring(0, 100)}...</p>
                          </div>
                          <div className="text-right ml-4">
                            <span className={`font-bold ${
                              answer.rating >= 7 ? 'text-green-600' :
                              answer.rating >= 4 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {answer.rating}
                            </span>
                            <span className="text-gray-500 text-sm">/10</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onEnd}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => {
                    setShowSummary(false);
                    setShowNextSetPrompt(true);
                  }}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                >
                  Practice More
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSession;