# Project History & Q&A Log

## 2025-12-26 (Stability Improvements)

### 🐛 Issue: Model Loading Failure

- **증상**: `verify-consistency.js` 실행 시 `Cannot read properties of undefined (reading 'buffer')` 또는 `Module.FS_createPath is not a function` 에러 발생.
- **원인**: MediaPipe Pure Runtime이 CDN에서 에셋(Binary/TFLite files)을 동적으로 로딩할 때, 버전 불일치나 경로 리다이렉션 문제로 인해 파일을 제대로 찾지 못함.
- **결정**: 런타임 엔진 변경.
  - **Before**: `MediaPipe Runtime` (가볍지만 CDN 의존성 취약)
  - **After**: `TensorFlow.js (TFJS) Runtime + WASM Backend`
    - 다소 무거울 수 있으나(≈10MB), npm 패키지 기반으로 관리가 가능하고 브라우저 호환성이 더 뛰어남.

---

## 2025-12-24 (Project Initialization)

### 📝 Summary

- **Initial Setup**: Next.js 기반의 `king-face` 프로젝트 생성 완료.
- **Architecture Decision**:
  - 초기 논의: Serverless Image Hash vs Client-Side Face Analysis.
  - 최종 결정: **Client-Side Feature Hashing**.
- **Implementation**:
  - `face-api.js` 기반 초기 구현 및 `joseon-jobs.ts` 정의.

### 🚀 Major Overhaul (Engine Swap)

- **Engine Swap**: `face-api.js`를 폐기하고 구글의 **`MediaPipe Face Mesh`** (via TensorFlow.js)로 엔진 전격 교체.
  - **이유**: 기존 모델은 '인식' 위주라 얼굴의 미세한 '관상(비율)'을 분석하는 데 한계가 있었음.
  - **개선점**:
    1. **468개 랜드마크**: 68개에서 468개로 정밀도 7배 향상.
    2. **3D 분석**: 얼굴의 깊이(Z축)를 포함한 입체적 비율 분석 가능.
    3. **안정성**: 고개가 돌아가도 3D 좌표로 보정하여 일관된 결과 도출.
    4. **무게**: CDN을 통한 모델 로딩으로 초기 번들 크기 최적화.

### 🐛 Bug Fixes

- **Range Clamping & Clustering Fix**: 정규화 범위 조정 및 황금비(Golden Ratio) 기반의 균등 분포 알고리즘 도입으로 결과 쏠림 현상 해결.
- **Controlled Chaos**: 사진 자체의 픽셀 해시를 노이즈로 섞어, 같은 사람이더라도 사진의 분위기에 따라 약간씩 다른 결과가 나오도록 유도 (하지만 같은 사진은 100% 같은 결과 보장).
- **Cleanup**: `public/models/` 내의 모든 구형 모델 파일 삭제.

### ❓ Q&A Log

**Q. pHash(이미지 해시) 방식 대신 Face API를 쓰는 이유는?**
A. pHash는 사진을 조금만 잘라내거나 필터를 씌워도 결과가 완전히 달라집니다. "관상"을 본다는 컨셉을 살리기 위해서는 사진 자체가 아니라 "얼굴의 구조(눈, 코, 입 비율)"를 분석해야 사용자가 납득할 수 있는 일관된 결과(Determinism)를 제공할 수 있습니다.

**Q. 서버 비용은?**
A. AI 분석이 사용자의 브라우저에서 수행되므로 별도의 GPU 서버나 API 비용이 들지 않습니다 (0원).
