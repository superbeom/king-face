# Project Tasks

## ✅ Completed (Phase 1 ~ 5)

- [x] Next.js 프로젝트 (`king-face`) 생성 및 설정
- [x] **AI Engine Upgrade**: `MediaPipe Face Mesh` 도입 (WASM 런타임)
- [x] 조선시대 직업 데이터 20종 정의 (`joseon-jobs.ts`) 및 페르소나 매칭 로직 구현
- [x] **Logic Stability Polishing**: 
  - 15종의 테스트 이미지(`test-images/`)를 통한 일관성 검증 완료
  - 페르소나 최단 거리 매칭 + 이미지 해시 앵커링 하이브리드 로직 적용
- [x] **UI**: 이미지 업로더, 로딩 오버레이, 결과 카드 컴포넌트 구현
- [x] **Page**: 메인 페이지 통합 및 상태 관리 구현
- [x] **Workflows**: AI 에이전트용 작업 자동화 워크플로우 구축 (`@restore_context`, `@generate_commit`, `@verify_logic`)

## 🚧 In Progress / To Do (Phase 6: Deployment)

- [ ] **Stabilization (Priority)**:
  - [ ] AI Backend Migration: `MediaPipe Runtime` -> `TFJS + WASM` (Loading Issue 해결)
  - [ ] 결과 일관성 검증 재수행 (`verify-consistency.js`)
- [ ] **SEO & Meta**: `layout.tsx`에 Open Graph 태그(카톡 공유 미리보기 이미지/제목) 설정
- [ ] **Mobile Optimization**: 실제 모바일 기기에서 터치 인터랙션 확인
- [ ] **Error Handling**: 얼굴 인식 실패 시 조선시대풍 예외 처리 UI 보강

## 🚀 Deployment

- [ ] Vercel 배포 설정
- [ ] 실제 도메인 연결 (Optional)
