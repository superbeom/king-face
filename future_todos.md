# Future Todos & Technical Debt

## Technical Improvements

- [ ] **Model Optimization**: 현재 `tiny_face_detector`를 사용 중이나, 모바일 구형 기기에서 더 빠른 속도를 위해 WASM 백엔드 가속 검토 필요.
- [ ] **Image Resizing**: 사용자가 4K 이상의 고화질 이미지를 올릴 경우 브라우저 메모리 이슈가 발생할 수 있음. 업로드 직후 Canvas에서 리사이징(예: 1024px)하는 로직 추가 필요.
- [ ] **Retry Logic**: 모델 로딩 실패 시 재시도 버튼 추가.

## Feature Ideas

- [ ] **Camera Integration**: 파일 업로드 대신 웹캠/전면카메라로 바로 찍어서 분석하는 기능.
- [ ] **Result Image Gen**: 결과 카드 자체를 이미지(PNG)로 다운로드할 수 있는 기능 (`html2canvas` 활용).
- [ ] **Statistics**: 어떤 직업이 가장 많이 나왔는지(익명) 통계 보여주기 (이 경우 Supabase 등 DB 필요).
- [ ] **Multi-face Support**: 여러 명이 찍힌 사진에서 누구의 관상을 볼지 선택하는 기능.

## UX/UI

- [ ] **Sound Effect**: 결과가 나올 때 징 소리나 팡파레 효과음 추가.
- [ ] **Share Image**: 카카오톡 공유 시 결과별로 다른 썸네일이 나오도록 OG Tag 동적 생성 (Next.js `generateMetadata` 활용).
