import { GoogleGenAI, Type } from "@google/genai";

export async function generateQuizWithGemini(topic: string, level: string, customWords?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일 또는 Vercel 환경 변수 설정을 확인해주세요.");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const prompt = `다음 조건에 맞춰 실용적이고 흥미로운 영어 단어 객관식 퀴즈 3문제를 생성해줘:
- 주제/분야: ${topic || "일상 회화 및 필수 어휘"}
- 학습 난이도: ${level || "중급 (수능/토익)"}
${customWords ? `- 사용자가 학습하고 싶은 단어/키워드 힌트: ${customWords}` : ""}

[문제 구성 지침]
1. 총 3문제(id: 1, 2, 3)를 생성하세요.
2. 각 문제는 4개의 객관식 보기(options)를 포함하며, 그 중 정확히 하나만 정답이어야 합니다.
3. question에는 단어의 문맥 속 빈칸 채우기 또는 정확한 의미를 묻는 유익한 질문을 넣으세요.
4. correctAnswerIndex는 0부터 3 사이의 정수 인덱스입니다.
5. 학습 효과를 높이기 위해 발음 기호(phonetic), 품사(partOfSpeech), 한국어 의미(meaning), 친절한 정답 해설(explanation), 실생활 예문(exampleSentence)과 그 한국어 번역(exampleTranslation)을 반드시 포함하세요.`;

  const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: "당신은 한국인을 위한 친절하고 전문적인 영어 교육 AI 멘토입니다. 실용적이고 유익한 영어 단어 객관식 퀴즈 3문제를 지정된 JSON 스키마 규격에 맞춰 정확히 작성하세요.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING, description: "퀴즈 주제 또는 분야" },
              level: { type: Type.STRING, description: "학습 난이도" },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER, description: "문제 번호 (1, 2, 3)" },
                    word: { type: Type.STRING, description: "핵심 영어 단어" },
                    phonetic: { type: Type.STRING, description: "발음 기호 (예: [kəmˈpæʃ.ən])" },
                    partOfSpeech: { type: Type.STRING, description: "품사 (명사, 동사, 형용사 등)" },
                    question: { type: Type.STRING, description: "문제 문장 또는 질문" },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "4개의 객관식 보기"
                    },
                    correctAnswerIndex: { type: Type.INTEGER, description: "정답 인덱스 (0, 1, 2, 3)" },
                    meaning: { type: Type.STRING, description: "단어의 한국어 의미" },
                    explanation: { type: Type.STRING, description: "정답 해설 및 오답 해설" },
                    exampleSentence: { type: Type.STRING, description: "실생활 예문 문장" },
                    exampleTranslation: { type: Type.STRING, description: "예문의 한국어 해석" }
                  },
                  required: [
                    "id",
                    "word",
                    "phonetic",
                    "partOfSpeech",
                    "question",
                    "options",
                    "correctAnswerIndex",
                    "meaning",
                    "explanation",
                    "exampleSentence",
                    "exampleTranslation"
                  ]
                }
              }
            },
            required: ["topic", "level", "questions"]
          }
        }
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${modelName} failed, trying next:`, err?.message || err);
      // Brief pause before trying next
      await new Promise(res => setTimeout(res, 500));
    }
  }

  // Handle friendly message for high demand or general error
  if (lastError?.message?.includes("503") || lastError?.message?.includes("high demand")) {
    throw new Error("현재 Gemini AI 서비스 요청이 집중되어 일시적으로 지연되고 있습니다. 잠시 후 [퀴즈 생성하기]를 다시 눌러주세요.");
  }

  throw new Error(lastError?.message || "퀴즈를 생성하지 못했습니다. 다시 시도해주세요.");
}
