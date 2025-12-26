# Verify Logic Consistency

이 워크플로우는 `king-face` 프로젝트의 핵심인 얼굴 분석 로직의 **일관성(Consistency)**을 검증합니다.
동일 인물의 여러 사진이 동일한(또는 일관된) 결과를 내는지 Puppeteer 스크립트를 통해 확인합니다.

## 1. 전제 조건 (Prerequisites)

이 워크플로우를 실행하기 전에 다음 조건이 충족되어야 합니다:

1.  **로컬 서버 실행 중**: `npm run dev` 또는 `yarn dev`로 `localhost:3000`에 서버가 떠 있어야 합니다.
2.  **테스트 이미지 존재**: `test-images/` 디렉토리에 테스트용 이미지들이 있어야 합니다.
3.  **Puppeteer 설치**: `npm install` 또는 `yarn`으로 의존성이 설치되어 있어야 합니다.

## 2. 실행 명령 (Execution)

다음 쉘 명령어를 실행하여 검증 스크립트를 구동하십시오.

```bash
node verify-consistency.js
```

## 3. 결과 해석 (Interpretation)

스크립트 실행 후 출력되는 리포트를 확인하십시오:

- **✅ PASS**: 해당 피험자(Subject)의 모든 사진(3장)이 동일한 직업 결과를 반환했습니다.
- **❌ FAIL**: 사진마다 다른 직업이 나왔거나, 에러가 발생했습니다.

**모든 Subject가 PASS를 받아야 로직 수정이 성공한 것으로 간주합니다.**
만약 FAIL이 발생하면, `lib/face-logic.ts`의 정규화 범위나 매칭 알고리즘을 재조정해야 합니다.
