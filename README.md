# VocaQuiz - AI 영어 단어 퀴즈 생성기 📚

Google Gemini AI가 실시간으로 생성하는 나만의 맞춤형 영어 단어 3문제 객관식 퀴즈 웹앱입니다.
데이터베이스 없이 순수 AI 문답으로 작동하며, 미니멀한 모노톤 디자인과 원어민 음성 발음 기능을 제공합니다.

---

## 🚀 빠른 시작 (로컬 실행 방법)

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트 경로에 `.env` 파일을 생성하고 발급받은 Google Gemini API 키를 입력합니다.
```env
GEMINI_API_KEY="여러분의_GEMINI_API_키"
```
> 💡 Gemini API 키는 [Google AI Studio](https://aistudio.google.com/app/apikey)에서 무료로 발급받을 수 있습니다.

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

---

## 🌐 Vercel 무료 배포 가이드 (GitHub 연동)

이 프로젝트는 서버리스(Serverless) 함수 구조를 갖추고 있어 Vercel에 무료로 원클릭 배포할 수 있습니다.

### 1단계: GitHub 저장소에 코드 업로드
1. GitHub에서 새로운 저장소(New Repository)를 만듭니다.
2. 현재 프로젝트 코드를 GitHub 저장소에 푸시(Push)합니다.

### 2단계: Vercel에서 프로젝트 가져오기
1. [Vercel](https://vercel.com)에 로그인한 후 **"Add New... > Project"** 버튼을 누릅니다.
2. 방금 올린 GitHub 저장소를 선택(Import)합니다.
3. Framework Preset은 **Vite**로 자동 감지됩니다.

### 3단계: 환경 변수(Environment Variables) 등록 (★필수★)
Vercel 대시보드의 **"Environment Variables"** 설정 섹션에 아래와 같이 입력합니다.

- **Key (이름)**: `GEMINI_API_KEY`
- **Value (값)**: `AI Studio에서 발급받은 Gemini API 키` (예: `AIzaSy...`)

입력 후 **"Add"**를 클릭합니다.

### 4단계: 배포 완료 (Deploy)
- 하단의 **"Deploy"** 버튼을 누르면 약 1분 이내에 무료 웹 주소(예: `https://your-app.vercel.app`)로 배포가 완료됩니다!

---

## 📁 주요 파일 구조

```
├── api/
│   └── generate-quiz.ts       # Vercel 배포용 서버리스 API 엔드포인트
├── server/
│   └── generateQuiz.ts        # Gemini AI 호출 및 퀴즈 생성 로직
├── src/
│   ├── types/
│   │   └── quiz.ts            # 퀴즈 데이터 타입 정의
│   ├── App.tsx                # 메인 UI (미니멀 모노톤 디자인, 퀴즈 풀이)
│   ├── index.css              # Tailwind CSS 스타일
│   └── main.tsx               # React 진입점
├── server.ts                  # 로컬 개발 및 Express 서버
├── vercel.json                # Vercel 배포 라우팅 설정
└── package.json               # 프로젝트 설정 및 라이브러리 목록
```

---

## 🎨 주요 특징
- **미니멀 모노톤 디자인**: 군더더기 없는 화이트/그레이/블랙의 세련된 UI
- **실시간 로딩 애니메이션 & 토스트 알림**: 버튼 클릭 시 진행 상태를 부드럽게 표시
- **원어민 발음 듣기**: 브라우저 Web Speech API를 활용하여 퀴즈 단어 및 예문 음성 듣기
- **상세한 해설과 실전 예문**: 정답/오답 확인 후 문맥 속 활용법까지 완벽 복습
- **안전한 보안**: 브라우저에 API 키가 노출되지 않도록 서버사이드에서 안전하게 처리
