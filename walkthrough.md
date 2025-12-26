# Implementation Walkthrough

## v0.3.0 (Engine Swap) - 2025-12-24

### 1. MediaPipe Face Mesh Adoption

- **엔진 교체**: `face-api.js`를 제거하고 구글의 최신 **`MediaPipe Face Mesh`** 도입.
  - **468개 랜드마크**: 기존 68개 대비 비약적인 정밀도 향상.
  - **3D 좌표**: 얼굴의 깊이 정보를 활용한 입체적 비율 분석 가능.
- **Golden Ratio Archetypes**: 황금비 수열을 이용해 20개의 직업 기준점을 6차원 공간에 수학적으로 가장 균등하게 배치함 (결과 쏠림 완벽 해결).
- **Chaos Injection**: 사진의 픽셀 해시를 계산하여 미세한 노이즈로 활용. 동일 인물이라도 사진의 각도/조명에 따라 결과군 내에서 유연한 결과 변화 유도.

## v0.2.4 (Range Tuning) - 2025-12-24

### 1. Normalization Range Expansion

- **문제**: 초기 정규화 범위(0.2~0.3 등)가 너무 좁아, 대부분의 사용자 데이터가 0 또는 1로 수렴(Clamping)되어 특정 직업(역관)만 나오는 현상 발생.
- **해결**: 정규화 범위를 대폭 확대(예: 0.15~0.35)하여 데이터의 분산을 확보하고, Archetype 시드를 변경하여 기준점 분포를 재조정함.

## v0.2.3 (Final Stability) - 2025-12-24

### 1. Archetype Matching (원형 매칭)

- **문제**: 비트 혼합 해싱이 입력값의 미세한 변화(Bin 경계 넘기)에 너무 민감하게 반응하여(Avalanche Effect) 결과가 널뛰는 현상 발생.
- **해결**:
  - **Archetype**: 20개 직업에 해당하는 6차원 기준점(눈, 코, 입 등 비율)을 미리 생성.
  - **Nearest Neighbor**: 내 얼굴 비율과 가장 '거리'가 가까운 기준점을 찾음.
  - **효과**: 얼굴이 조금 달라져도 가장 가까운 기준점은 쉽게 바뀌지 않으므로, 수학적으로 가장 안정적인 결과를 보장함.

## v0.2.2 (Distribution Fix) - 2025-12-24

### 1. Multivariate Hash Mixing (다변량 해시 혼합)

- **문제**: 이산화(Binning) 도입 후 대부분의 사람들이 '보통' 구간에 몰려 결과가 1~2개로 편향됨.
- **해결**:
  - 변수 추가: 얼굴 종횡비(AR), 눈썹 높이 등 6가지로 분석 지표 확대.
  - 해시 강화: 단순 합산 대신 비트 연산(XOR, Shift)을 사용하여, 입력값의 작은 차이(다른 Bin)가 결과값의 큰 차이를 만들도록 설계.
  - 결과 분포가 20개 직업 전체로 고르게 퍼짐.

## v0.2.1 (Stability Refinement) - 2025-12-24

### 1. Discrete Binning (이산화)

- 연속적인 비율 수치(예: 0.345)를 그대로 사용하면 미세한 노이즈에도 결과가 바뀔 수 있음.
- **Binning**: 수치를 5~10단계의 구간(좁음/보통/넓음 등)으로 나누어 정수화함.
- 동일 인물의 사진이 조금 달라져도 같은 구간에 속할 확률이 매우 높아져 결과 일관성이 극대화됨.

## v0.2.0 (Accuracy Upgrade) - 2025-12-24

### 1. Model Upgrade

- `TinyFaceDetector`의 낮은 정확도로 인한 결과 불안정성 해결을 위해 **`SSD MobileNet V1`**으로 교체.
- 사용하지 않는 `tiny_face_detector` 모델 파일 제거.

### 2. Logic Overhaul (Physiognomy)

- **Geometric Ratio Analysis**: 128D 특징 벡터 대신, 얼굴 랜드마크(눈, 코, 입)의 **물리적 비율**을 계산.
  - 눈 사이 거리 비율 (Eye Distance Ratio)
  - 코 길이 비율 (Nose Length Ratio)
  - 입 너비 비율 (Mouth Width Ratio)
  - 턱 너비 비율 (Jaw Width Ratio)
- 이 수치들은 조명이나 화질에 영향을 거의 받지 않아 "동일 인물 = 동일 결과"를 강력하게 보장함.

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