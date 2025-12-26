---
description: AI 모델 로딩 및 일관성 검증 작업을 재개하는 방법
---

# AI 모델 로딩 및 일관성 검증 재개 워크플로우

// turbo-all

## 1. 현재 상태 요약 (2025-12-26 기준)
- **해결된 블로커**: AI 모델 로딩 실패 (CDN 경로 및 Runtime 설정 최적화 완료).
- **현재 설정**: `app/layout.tsx`에서 CDN 스크립트 로드 + `lib/face-logic.ts`에서 `WASM` 백엔드 강제 활성화 및 `mediapipe` 런타임 사용.
- **남은 과제**: 특정 인물(Subject A, B)에 대한 결과 불일치 문제 해결.

## 2. 작업 재개 단계

### 1단계: 로컬 개발 서버 실행
```bash
npm run dev
```

### 2단계: 로직 일관성 검증 실행
현재 설정이 제대로 작동하는지 확인하기 위해 Puppeteer 스크립트를 실행합니다.
```bash
node verify-consistency.js
```

### 3단계: 결과 분석 및 로직 수정
검증 결과에서 `FAIL`이 발생하는 경우 `lib/face-logic.ts`의 `getDeterministicIndex` 함수 내의 정규화(normalize) 범위나 가중치(weights), 혹은 앵커링(Anchoring) 로직을 조정합니다.

- **체크포인트**: `PAGE LOG: TFJS Backend set to: wasm` 로그가 출력되는지 확인하십시오. WASM이 활성화되어야 결과가 더 안정적입니다.

## 3. 주요 관련 파일
- [face-logic.ts](file:///Users/jamesbond/Documents/lunio-studio/king-face/lib/face-logic.ts): AI 로직 핵심
- [layout.tsx](file:///Users/jamesbond/Documents/lunio-studio/king-face/app/layout.tsx): CDN 스크립트 설정
- [verify-consistency.js](file:///Users/jamesbond/Documents/lunio-studio/king-face/verify-consistency.js): 검증 자동화 스크립트
