# Project History & Q&A Log

## 2025-12-24 (Project Initialization)

### 📝 Summary

- **Initial Setup**: Next.js 기반의 `king-face` 프로젝트 생성 완료.
- **Architecture Decision**:
  - 초기 논의: Serverless Image Hash vs Client-Side Face Analysis.
  - 최종 결정: **Client-Side Feature Hashing**.
    - 이유: 이미지 파일 해시(pHash)는 크롭/조명 변화에 취약하여 "관상" 서비스의 몰입도를 해침. 얼굴 특징점(Descriptor)을 추출하여 해싱하는 방식이 "동일 인물 = 동일 결과"를 보장하면서도 훨씬 정확함.
- **Implementation**:
  - `face-api.js` 설치 및 모델(`tiny_face_detector` 등) 다운로드 완료.
  - 20가지 조선시대 직업 데이터(`joseon-jobs.ts`) 정의.
  - 핵심 로직(`face-logic.ts`) 및 UI(`ImageUploader`, `ResultCard`, `AnalysisOverlay`) 구현 완료.

### ❓ Q&A Log

**Q. pHash(이미지 해시) 방식 대신 Face API를 쓰는 이유는?**
A. pHash는 사진을 조금만 잘라내거나 필터를 씌워도 결과가 완전히 달라집니다. "관상"을 본다는 컨셉을 살리기 위해서는 사진 자체가 아니라 "얼굴의 구조(눈, 코, 입 비율)"를 분석해야 사용자가 납득할 수 있는 일관된 결과(Determinism)를 제공할 수 있습니다.

**Q. 서버 비용은?**
A. AI 분석이 사용자의 브라우저에서 수행되므로 별도의 GPU 서버나 API 비용이 들지 않습니다 (0원).

---
