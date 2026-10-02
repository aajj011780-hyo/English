import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  BookOpen,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  ArrowRight,
  Check,
  BrainCircuit,
  Loader2,
  X,
  Share2,
  Info
} from 'lucide-react';
import { QuizData, QuizLevel } from './types/quiz.ts';

const PRESET_TOPICS = [
  { id: 'daily', label: '일상 회화 & 카페', desc: '자주 쓰이는 생생한 일상 표현' },
  { id: 'business', label: '비즈니스 & 이메일', desc: '직장/업무에 유용한 비즈니스 표현' },
  { id: 'toeic', label: '토익/수능 빈출 어휘', desc: '시험에 자주 출제되는 핵심 어휘' },
  { id: 'travel', label: '여행 & 공항/호텔', desc: '해외여행 필수 영어 단어 및 표현' },
  { id: 'tech', label: '테크 & IT 트렌드', desc: '기술과 트렌드를 다루는 실무 어휘' },
];

const LEVELS: QuizLevel[] = [
  '초급 (기초/일상)',
  '중급 (수능/토익)',
  '고급 (비즈니스/학술)',
];

export default function App() {
  // State for quiz configuration
  const [selectedTopic, setSelectedTopic] = useState('일상 회화 & 카페');
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomTopicActive, setIsCustomTopicActive] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel>('중급 (수능/토익)');
  const [customWords, setCustomWords] = useState('');

  // Quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('AI 단어 모델 연결 중...');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Show Toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // English pronunciation using SpeechSynthesis
  const speakEnglish = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('이 브라우저는 음성 재생을 지원하지 않습니다.', 'info');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    const finalTopic = isCustomTopicActive && customTopic.trim() ? customTopic.trim() : selectedTopic;
    if (!finalTopic) {
      showToast('주제를 선택하거나 입력해주세요.', 'error');
      return;
    }

    setIsLoading(true);
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers({});
    setIsAnswerSubmitted(false);
    setIsQuizCompleted(false);

    // Multi-stage loading text for smooth UX
    const timer1 = setTimeout(() => setLoadingStepText('주제에 어울리는 최적의 핵심 단어 선별 중...'), 800);
    const timer2 = setTimeout(() => setLoadingStepText('Gemini AI가 실전문맥 퀴즈 3문항과 예문 생성 중...'), 2000);
    const timer3 = setTimeout(() => setLoadingStepText('발음 기호 및 상세 해설 최종 검증 중...'), 3500);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: finalTopic,
          level: selectedLevel,
          customWords: customWords.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '퀴즈를 불러오는 데 실패했습니다.');
      }

      const data: QuizData = await response.json();
      if (!data || !data.questions || data.questions.length === 0) {
        throw new Error('생성된 퀴즈 형식이 올바르지 않습니다.');
      }

      setQuizData(data);
      showToast('🎉 나만의 맞춤형 퀴즈 3문제가 완성되었습니다!', 'success');
    } catch (error: any) {
      console.error('Quiz creation failed:', error);
      showToast(error.message || '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsLoading(false);
      setLoadingStepText('AI 단어 모델 연결 중...');
    }
  };

  // Select Option
  const handleSelectOption = (optionIndex: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(optionIndex);
  };

  // Submit Answer for Current Question
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      showToast('보기를 하나 선택해주세요.', 'info');
      return;
    }
    setIsAnswerSubmitted(true);
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer,
    }));
  };

  // Next Question or Finish
  const handleNextQuestion = () => {
    if (!quizData) return;
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      showToast('퀴즈를 모두 완료했습니다! 결과를 확인하세요.', 'success');
    }
  };

  // Retry same quiz
  const handleRetrySameQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers({});
    setIsAnswerSubmitted(false);
    setIsQuizCompleted(false);
    showToast('현재 퀴즈를 처음부터 다시 시작합니다.', 'info');
  };

  // Reset to create fresh quiz
  const handleResetQuiz = () => {
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers({});
    setIsAnswerSubmitted(false);
    setIsQuizCompleted(false);
  };

  // Calculate score
  const calculateScore = () => {
    if (!quizData) return 0;
    let correctCount = 0;
    quizData.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });
    return correctCount;
  };

  const currentQuestion = quizData?.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col justify-between selection:bg-zinc-800 selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] pointer-events-auto"
          >
            <div
              className={`px-4 py-3 rounded-lg shadow-lg border text-sm flex items-center justify-between gap-3 ${
                toastType === 'success'
                  ? 'bg-zinc-900 text-white border-zinc-800'
                  : toastType === 'error'
                  ? 'bg-zinc-900 text-red-200 border-red-800'
                  : 'bg-white text-zinc-900 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {toastType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {toastType === 'error' && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                {toastType === 'info' && <Info className="w-4 h-4 text-zinc-500 shrink-0" />}
                <p className="font-medium leading-tight">{toastMessage}</p>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-zinc-400 hover:text-white p-1 rounded transition"
                aria-label="닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleResetQuiz}>
            <div className="w-8 h-8 rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter">
              VQ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-zinc-900">VocaQuiz</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">실시간 맞춤형 영어 단어 퀴즈 생성기</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quizData && (
              <button
                onClick={handleResetQuiz}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                새 퀴즈 만들기
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        {/* VIEW 1: Quiz Configuration Form */}
        {!quizData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Title Section */}
            <div className="text-center space-y-2 mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
                Gemini AI 어휘 학습 엔진
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
                나만의 영어 단어 퀴즈 만들기
              </h1>
              <p className="text-sm text-zinc-500 max-w-lg mx-auto">
                원하는 주제와 난이도를 정하면, Gemini AI가 실전 예문과 상세 해설이 담긴 객관식 3문제를 즉시 생성합니다.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              {/* 1. Topic Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  1단계 : 퀴즈 주제 선택
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_TOPICS.map(item => {
                    const isSelected = !isCustomTopicActive && selectedTopic === item.label;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedTopic(item.label);
                          setIsCustomTopicActive(false);
                        }}
                        className={`text-left p-3.5 rounded-lg border transition duration-150 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                            : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/60'
                        }`}
                      >
                        <span className="font-semibold text-sm">{item.label}</span>
                        <span
                          className={`text-xs mt-1 ${
                            isSelected ? 'text-zinc-300' : 'text-zinc-500'
                          }`}
                        >
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}

                  {/* Custom Topic Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsCustomTopicActive(true)}
                    className={`text-left p-3.5 rounded-lg border transition duration-150 flex flex-col justify-between sm:col-span-2 ${
                      isCustomTopicActive
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                        : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/60'
                    }`}
                  >
                    <span className="font-semibold text-sm flex items-center justify-between">
                      <span>✏️ 직접 입력하기</span>
                      {isCustomTopicActive && <Check className="w-4 h-4 text-zinc-300" />}
                    </span>
                    <span
                      className={`text-xs mt-1 ${
                        isCustomTopicActive ? 'text-zinc-300' : 'text-zinc-500'
                      }`}
                    >
                      내가 배우고 싶은 자유로운 상황이나 테마를 입력하세요
                    </span>
                  </button>
                </div>

                {/* Custom Topic Input */}
                {isCustomTopicActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-1"
                  >
                    <input
                      type="text"
                      placeholder="예: 실리콘밸리 스타트업 미팅, 병원 진료 예약, 호텔 체크인"
                      value={customTopic}
                      onChange={e => setCustomTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                      maxLength={60}
                    />
                  </motion.div>
                )}
              </div>

              {/* 2. Level Selection */}
              <div className="space-y-3 pt-2 border-t border-zinc-100">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  2단계 : 난이도 선택
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LEVELS.map(lvl => {
                    const isSelected = selectedLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedLevel(lvl)}
                        className={`py-2.5 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                          isSelected
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Optional Specific Words */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                    3단계 : 특정 단어 포함 (선택 사항)
                  </label>
                  <span className="text-[11px] text-zinc-400">생략 시 AI가 자동 추천</span>
                </div>
                <input
                  type="text"
                  placeholder="예: resilience, ubiquitous, nuance (쉼표로 구분)"
                  value={customWords}
                  onChange={e => setCustomWords(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleGenerateQuiz}
                  disabled={isLoading}
                  className="w-full py-3.5 px-5 bg-zinc-900 text-white rounded-lg font-semibold text-sm hover:bg-zinc-800 active:scale-[0.99] transition duration-150 shadow flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                      <span>처리 중...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4" />
                      <span>3문제 퀴즈 실시간 생성하기</span>
                    </>
                  )}
                </button>
              </div>

              {/* Loading Status Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-center space-y-2"
                >
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-zinc-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900" />
                    <span>{loadingStepText}</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-1 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-zinc-900 h-full"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Feature Highlights Minimal Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center text-xs text-zinc-500">
              <div className="p-3 bg-white rounded-lg border border-zinc-200/80">
                <span className="font-semibold text-zinc-800 block mb-0.5">실시간 AI 단어 분석</span>
                외우고 싶은 상황에 맞춘 실전 어휘
              </div>
              <div className="p-3 bg-white rounded-lg border border-zinc-200/80">
                <span className="font-semibold text-zinc-800 block mb-0.5">상세 해설 & 실생활 예문</span>
                정답뿐만 아니라 문맥 활용법까지 습득
              </div>
              <div className="p-3 bg-white rounded-lg border border-zinc-200/80">
                <span className="font-semibold text-zinc-800 block mb-0.5">발음 듣기 & 복습 카드</span>
                원어민 발음 재생과 최종 스코어 요약
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: Quiz Question Solving */}
        {quizData && !isQuizCompleted && currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Top Bar: Topic Badge & Progress */}
            <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                  {quizData.topic}
                </span>
                <span>• {quizData.level}</span>
              </div>
              <div className="font-semibold text-zinc-800">
                문제 {currentQuestionIndex + 1} / {quizData.questions.length}
              </div>
            </div>

            {/* Question Progress Bar */}
            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-zinc-900 h-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Word & Phonetic Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {currentQuestion.partOfSpeech}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {currentQuestion.phonetic}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                    {currentQuestion.word}
                  </h2>
                </div>

                {/* Pronunciation Audio Button */}
                <button
                  type="button"
                  onClick={() => speakEnglish(currentQuestion.word)}
                  title="원어민 발음 듣기"
                  className="w-10 h-10 rounded-full border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 flex items-center justify-center text-zinc-700 transition"
                  aria-label="원어민 발음 듣기"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Question Prompt */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">문제</p>
                <p className="text-base sm:text-lg font-medium text-zinc-900 leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* 4 Multiple-Choice Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQuestion.correctAnswerIndex;
                  const showResultState = isAnswerSubmitted;

                  let cardStyle = 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50/70';

                  if (showResultState) {
                    if (isCorrect) {
                      cardStyle = 'bg-zinc-900 text-white border-zinc-900';
                    } else if (isSelected && !isCorrect) {
                      cardStyle = 'bg-zinc-100 text-zinc-400 border-zinc-300 line-through';
                    } else {
                      cardStyle = 'bg-white text-zinc-400 border-zinc-100 opacity-60';
                    }
                  } else if (isSelected) {
                    cardStyle = 'bg-zinc-900 text-white border-zinc-900';
                  }

                  const labels = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-lg border font-medium text-sm transition-all duration-150 flex items-center justify-between ${cardStyle} cursor-pointer disabled:cursor-default`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border ${
                            isSelected || (showResultState && isCorrect)
                              ? 'bg-zinc-800 text-white border-zinc-700'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {labels[idx]}
                        </span>
                        <span className="text-sm">{option}</span>
                      </div>

                      {showResultState && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {showResultState && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Button: Submit or Next */}
              <div className="pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full py-3 px-4 bg-zinc-900 text-white rounded-lg font-semibold text-sm hover:bg-zinc-800 transition shadow disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    정답 확인하기
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="w-full py-3 px-4 bg-zinc-900 text-white rounded-lg font-semibold text-sm hover:bg-zinc-800 transition shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {currentQuestionIndex < quizData.questions.length - 1
                        ? '다음 문제 풀기'
                        : '최종 결과 확인하기'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Detailed Explanation Accordion (Visible after submission) */}
              <AnimatePresence>
                {isAnswerSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-zinc-200 space-y-4 text-sm"
                  >
                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          단어 뜻 & 핵심 해설
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
                          {currentQuestion.meaning}
                        </span>
                      </div>
                      <p className="text-zinc-700 leading-relaxed text-xs sm:text-sm">
                        {currentQuestion.explanation}
                      </p>

                      {/* Example sentence */}
                      <div className="pt-2 border-t border-zinc-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            실전 예문
                          </span>
                          <button
                            type="button"
                            onClick={() => speakEnglish(currentQuestion.exampleSentence)}
                            className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>예문 듣기</span>
                          </button>
                        </div>
                        <p className="font-medium text-zinc-900 text-xs sm:text-sm italic">
                          "{currentQuestion.exampleSentence}"
                        </p>
                        <p className="text-zinc-500 text-xs">
                          {currentQuestion.exampleTranslation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: Final Quiz Result & Word Review Summary */}
        {quizData && isQuizCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Score Card */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-300 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-zinc-900" />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  퀴즈 완료
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
                  총 {quizData.questions.length}문제 중 {calculateScore()}문제 정답!
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  {calculateScore() === quizData.questions.length
                    ? '완벽합니다! 오늘 배운 모든 단어를 완벽히 마스터하셨습니다.'
                    : '훌륭한 학습이었습니다! 아래 단어 카드를 통해 오답을 복습해보세요.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetrySameQuiz}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-zinc-300 text-zinc-800 text-xs font-semibold hover:bg-zinc-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  현재 퀴즈 다시 풀기
                </button>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  새로운 단어 퀴즈 생성
                </button>
              </div>
            </div>

            {/* Word Review Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                오늘의 단어 3선 완벽 복습
              </h3>

              <div className="space-y-3">
                {quizData.questions.map((q, idx) => {
                  const isUserCorrect = userAnswers[idx] === q.correctAnswerIndex;
                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-xl border border-zinc-200 p-5 space-y-3 text-sm shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-zinc-900">{q.word}</span>
                            <span className="text-xs text-zinc-400 font-mono">{q.phonetic}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                              {q.partOfSpeech}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-zinc-700 mt-1">뜻: {q.meaning}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => speakEnglish(q.word)}
                            className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition"
                            title="발음 듣기"
                            aria-label="발음 듣기"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-semibold ${
                              isUserCorrect
                                ? 'bg-zinc-900 text-white'
                                : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                            }`}
                          >
                            {isUserCorrect ? '정답' : '오답'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-zinc-50 rounded-lg p-3 text-xs space-y-1 border border-zinc-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-zinc-400">예문</span>
                          <button
                            type="button"
                            onClick={() => speakEnglish(q.exampleSentence)}
                            className="text-[10px] text-zinc-500 hover:text-zinc-900 flex items-center gap-0.5"
                          >
                            <Volume2 className="w-3 h-3" />
                            듣기
                          </button>
                        </div>
                        <p className="font-medium text-zinc-800 italic">"{q.exampleSentence}"</p>
                        <p className="text-zinc-500">{q.exampleTranslation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-6 mt-12">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} VocaQuiz • Powered by Google Gemini AI</p>
          <div className="flex items-center gap-4">
            <span>미니멀 모노톤 단어 퀴즈</span>
            <span>•</span>
            <span>데이터베이스 불필요</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
