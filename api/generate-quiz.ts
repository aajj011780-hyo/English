import { generateQuizWithGemini } from "../server/generateQuiz.ts";

export default async function handler(req: any, res: any) {
  // CORS configuration for Vercel
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. POST 요청만 지원합니다." });
  }

  try {
    const { topic, level, customWords } = req.body || {};
    const quizData = await generateQuizWithGemini(topic, level, customWords);
    return res.status(200).json(quizData);
  } catch (error: any) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({
      error: error?.message || "퀴즈를 생성하는 중 오류가 발생했습니다.",
    });
  }
}
