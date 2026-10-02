import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { generateQuizWithGemini } from './server/generateQuiz.ts';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// 퀴즈 생성 API 엔드포인트
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, level, customWords } = req.body || {};
    const quizData = await generateQuizWithGemini(topic, level, customWords);
    res.json(quizData);
  } catch (error: any) {
    console.error('Quiz Generation Error:', error);
    res.status(500).json({
      error: error?.message || '퀴즈 생성 도중 오류가 발생했습니다.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
