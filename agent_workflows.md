# Agent Workflows Guide

이 문서는 `king-face` 프로젝트에서 개발 효율성과 일관성을 유지하기 위해 사용하는 **AI 에이전트 워크플로우**의 사용법을 설명합니다.

모든 워크플로우 파일은 `.agent/workflows/` 디렉토리에 위치하며, 채팅창에서 `@`를 통해 해당 파일을 호출하여 실행합니다.

---

## 1. 컨텍스트 복원 (`@restore_context`)

**파일 경로**: `.agent/workflows/restore_context.md`

### 💡 목적

- IDE를 새로 켜거나 새로운 채팅 세션을 시작할 때, 프로젝트의 방대한 컨텍스트(규칙, 히스토리, 할 일 등)를 AI에게 빠르게 주입합니다.
- AI가 "개발자 페르소나"와 "프로젝트 규칙"을 장착하도록 강제합니다.

### 🚀 사용법

채팅창에 아래 명령어를 입력하세요:

```bash
@.agent/workflows/restore_context.md
```

### 📋 실행되는 작업

1. `project_context.md`, `project_history.md`, `task.md` 등 핵심 문서 7종을 읽습니다.
2. 현재 프로젝트의 진행 상태와 최근 이슈를 요약하여 보고합니다.
3. **"질문은 History에 기록, 할 일은 Future Todos에 기록"**하는 행동 강령을 활성화합니다.

---

## 2. 커밋 메시지 자동 생성 (`@generate_commit`)

**파일 경로**: `.agent/workflows/generate_commit.md`

### 💡 목적

- `git_convention.md`에 정의된 복잡한 커밋 메시지 규칙(Problem-Solution-Effect)을 고민할 필요 없이 자동으로 작성합니다.
- 터미널에서 바로 실행 가능한 스크립트 파일(`commit_msg.sh`)을 만들어줍니다.

### 🚀 사용법

1. 변경 사항을 Staging Area에 올립니다:
   ```bash
   git add .
   ```
2. 채팅창에 아래 명령어를 입력하세요:
   ```bash
   @.agent/workflows/generate_commit.md
   ```

### 📋 실행되는 작업

1. `git diff --cached`를 분석하여 변경 내용을 파악합니다.
2. 컨벤션에 맞춰 영문/한글 커밋 메시지를 작성합니다.
3. `commit_msg.sh` 파일을 생성합니다.
4. 사용자는 터미널에서 `./commit_msg.sh`만 입력하면 커밋이 완료됩니다.

---

## 3. 로직 일관성 검증 (`@verify_logic`)

**파일 경로**: `.agent/workflows/verify_logic.md`

### 💡 목적

- 얼굴 분석 로직(`face-logic.ts`) 수정 후, 동일 인물의 사진들이 일관된 결과(같은 직업)를 내는지 자동으로 검증합니다.
- 사람이 일일이 사진을 업로드하며 테스트하는 번거로움을 제거합니다.

### 🚀 사용법

1. 로컬 서버(`localhost:3000`)가 켜져 있는지 확인합니다.
2. 채팅창에 아래 명령어를 입력하세요:
   ```bash
   @.agent/workflows/verify_logic.md
   ```

### 📋 실행되는 작업

1. `node test/verify-consistency.js` 스크립트를 실행합니다.
2. `test/images/` 폴더의 이미지를 자동으로 업로드하고 분석 결과를 수집합니다.
3. 각 인물(Subject)별로 결과가 일치하는지(PASS/FAIL) 리포트를 출력합니다.

---

## 💡 팁 (Tips)

- 워크플로우 파일은 단순한 마크다운 문서이므로, 프로젝트 규칙이 바뀌면 내용을 직접 수정하여 AI의 행동을 교정할 수 있습니다.
- 새로운 반복 작업이 생기면 이 폴더에 새로운 `.md` 파일을 만들어 나만의 워크플로우를 추가해보세요.
