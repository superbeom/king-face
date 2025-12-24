# Implementation Walkthrough

## v0.1.0 (MVP Implementation) - 2025-12-24

### 1. Setup & Configuration

- `npx create-next-app`으로 프로젝트 스캐폴딩.
- `face-api.js` 설치.
- `public/models/` 디렉토리에 GitHub에서 `tiny_face_detector` 및 랜드마크 모델 파일들을 `curl`로 다운로드함.

### 2. Core Logic (`lib/face-logic.ts`)

- **Model Loading**: `loadModels()` 함수로 `tinyFaceDetector`, `faceLandmark68Net`, `faceRecognitionNet` 로드.
- **Feature Extraction**: `getFaceDescriptor()`로 128개의 Float32Array 특징 벡터 추출.
- **Hashing**: `getDeterministicIndex()` 함수에서 특징 벡터의 각 요소를 가중 합산(Weighted Sum)하여 정수 Seed를 만들고, `% 20` 연산으로 결과 인덱스 고정.

### 3. Data Structure (`constants/joseon-jobs.ts`)

- `JoseonJob` 인터페이스 정의.
- 왕, 영의정, 백정, 망나니 등 20개의 직업 데이터(제목, 설명, 특징, 멘트) 하드코딩.

### 4. UI Components (`components/face/`)

- **ImageUploader**: Drag & Drop 및 파일 선택 기능. `FileReader`로 이미지를 DataURL로 변환하여 미리보기 제공.
- **AnalysisOverlay**: `setInterval`을 사용해 "관상 보는 중..." 텍스트가 롤링되는 로딩 화면 구현.
- **ResultCard**: 결과 직업 표시. `navigator.share` API를 사용한 공유 기능 구현. CSS Filter(`grayscale`, `sepia`)로 고풍스러운 이미지 효과 적용.

### 5. Main Page (`app/page.tsx`)

- 상태 관리(`step`: upload -> analyzing -> result)를 통해 SPA(Single Page Application) 경험 제공.
- AI 로딩 완료 전 업로드 방지 (`modelsLoaded` 플래그).
