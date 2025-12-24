# Project Context & Rules: King Face (내가 왕이 될 상인가!)

**최종 수정일**: 2025-12-24

## 1. 프로젝트 개요 (Project Overview)

- **서비스명**: 내가 왕이 될 상인가! (King Face)
- **목적**: 사용자의 얼굴 사진을 분석하여 조선시대 직업(20종) 중 하나를 매칭해주는 엔터테인먼트 서비스.
- **핵심 가치**:
  - **단순함**: 복잡한 절차 없이 사진 한 장으로 결과 확인.
  - **결정성 (Determinism)**: 동일한 사람이 찍은 사진은 (각도/조명이 달라도) 항상 동일한 직업이 나와야 함.
  - **공유**: 결과 페이지가 바이럴되기 쉬운 구조 (밈, 공유하기).
  - **프라이버시**: 서버 저장 없이 브라우저 내에서 모든 분석 처리.

## 2. 시스템 아키텍처 (System Architecture)

```mermaid
graph TD
    User[User Device / Browser] -->|1. Visit| Vercel[Next.js App (Vercel)]
    Vercel -->|2. Load Static Assets| CDN[Public Models / Images]

    subgraph Client-Side [Browser Memory]
        User -->|3. Upload Photo| FaceAPI[face-api.js]
        FaceAPI -->|4. Detect & Embed| Vector[128D Face Vector]
        Vector -->|5. Hash & Modulo| Logic[Deterministic Mapper]
        Logic -->|6. Result Job ID| UI[Result Card]
    end

    UI -->|7. Share| SNS[Kakao / Link Copy]
```

## 3. 기술 스택 (Tech Stack)

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS.
- **AI Engine**: `face-api.js` (TensorFlow.js 기반, 브라우저 구동).
  - 사용 모델: `tiny_face_detector` (경량 얼굴 감지), `face_landmark_68` (특징점 추출).
- **Deployment**: Vercel (Frontend Hosting).
- **Storage**: 없음 (Stateless Architecture).

## 4. 디렉토리 구조 (Directory Structure)

```
king-face/
├── app/                 # Next.js App Router Pages
│   ├── page.tsx         # 메인 페이지 (SPA)
│   ├── layout.tsx       # 레이아웃 및 메타데이터
│   └── globals.css      # 전역 스타일
├── components/          # React 컴포넌트
│   └── face/            # 도메인별 컴포넌트 그룹
│       ├── ImageUploader.tsx
│       ├── AnalysisOverlay.tsx
│       └── ResultCard.tsx
├── lib/                 # 핵심 로직
│   └── face-logic.ts    # AI 모델 로드, 특징 추출, 해싱 알고리즘
├── constants/           # 상수 데이터
│   └── joseon-jobs.ts   # 20가지 직업 데이터 (JSON)
├── public/              # 정적 파일
│   └── models/          # face-api.js 모델 바이너리 파일
├── .agent/workflows/    # AI 에이전트 워크플로우
│   └── restore_context.md
├── project_context.md   # 본 문서
├── project_history.md   # 프로젝트 변경 이력
├── future_todos.md      # 기술 부채 및 아이디어
└── ...설정 파일들
```

## 5. 코딩 컨벤션 (Coding Conventions)

### General

- **언어**: TypeScript 엄수. `any` 사용 지양.
- **절대 경로**: `@/` alias 사용 (예: `import { ... } from '@/lib/face-logic'`).

### Frontend

- **컴포넌트**: `components/` 하위에 도메인별(예: `face/`)로 디렉토리를 나누어 관리.
- **스타일링**: Tailwind CSS 유틸리티 클래스 사용. 색상은 `amber` 계열(조선시대 테마)을 메인으로 사용.
- **상수 관리**: 텍스트나 설정값은 컴포넌트 내 하드코딩하지 않고 `constants/` 폴더에서 관리.
- **비동기 처리**: AI 모델 로딩 등 시간이 걸리는 작업은 `async/await` 및 로딩 상태(`isLoading`)를 반드시 처리.

### AI Logic

- **결정론적 해싱 (Deterministic Hashing)**:
  - `Input`: Face Descriptor (Float32Array)
  - `Process`: 벡터 요소의 가중 합산(Weighted Sum) -> 정수 Seed 변환
  - `Output`: `Seed % 20` (직업 ID)
  - **원칙**: 같은 얼굴은 언제나 같은 결과가 나와야 함.

## 6. 워크플로우 가이드라인 (Workflow Guidelines)

1.  **세션 시작 (Initialization)**:
    - 작업 시작 시 반드시 ` @restore_context` 명령어를 실행하여 컨텍스트를 동기화합니다.
2.  **이력 기록 (`project_history.md`)**:
    - 주요 의사결정, 질문, 구조 변경 사항은 파일 상단에 역순으로 기록합니다.
3.  **할 일 관리 (`future_todos.md`)**:
    - 당장 급하지 않은 개선 사항(예: 모바일 성능 최적화, 공유 이미지 생성 등)은 이곳에 기록하여 관리합니다.
    - 코드 내 `TODO` 주석과 동기화합니다.
4.  **문서 동기화**:
    - 기능 구현이 완료되면 `walkthrough.md`에 구현 내역을 버전별로 기록합니다.
    - `task.md`의 체크리스트를 업데이트합니다.
5.  **Git 규칙**:
    - `git_convention.md`에 따라 커밋 메시지를 작성합니다 (`feat`, `fix` 등).

## 7. 주요 제약 사항 & 이슈

- **브라우저 메모리**: 고화질 이미지(4K 이상) 업로드 시 모바일 기기(iOS Safari 등)에서 메모리 부족으로 인한 크래시 가능성 존재.
- **모델 로딩 속도**: 초기 접속 시 모델 파일(약 5~10MB) 다운로드가 필요하므로 로딩 UX가 중요함.
