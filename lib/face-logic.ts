"use client";

import { JOSEON_JOBS } from "@/constants/joseon-jobs";

// 로컬 인터페이스 정의
export interface Keypoint {
  x: number;
  y: number;
  z?: number;
  name?: string;
}

export interface KeypointFace {
  keypoints: Keypoint[];
}

// 전역 객체 타입 정의 (CDN 스크립트로 로드됨)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    faceLandmarksDetection: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tf: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let detector: any = null;

/**
 * AI 모델을 로드합니다. (MediaPipe Runtime)
 */
export const loadModels = async () => {
  if (detector) return; // 이미 초기화되었다면 종료
  try {
    // 1. Wait for Global Scripts
    let attempts = 0;
    while ((!window.tf || !window.faceLandmarksDetection) && attempts < 10) {
      console.warn(`Waiting for TFJS scripts... attempt ${attempts + 1}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!window.tf || !window.faceLandmarksDetection) {
      console.error("Window state:", {
        tf: !!window.tf,
        faceLandmarksDetection: !!window.faceLandmarksDetection
      });
      throw new Error("TensorFlow.js scripts not loaded or failed after 10s.");
    }

    // 2. Configure Backend
    // MediaPipe 런타임 사용 시 자체 WASM을 사용하므로 TFJS WASM 백엔드 수동 설정은 제외 (충돌 방지)
    await window.tf.ready();
    console.log("TFJS Ready. Current backend:", window.tf.getBackend());

    // 3. Create Detector
    const model = window.faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig = {
      runtime: "mediapipe",
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/",
      refineLandmarks: false,
      maxFaces: 1,
    };

    detector = await window.faceLandmarksDetection.createDetector(
      model,
      detectorConfig
    );
    console.log("Face Mesh detector loaded successfully (MediaPipe Runtime)");
  } catch (error: any) {
    console.error("Error loading models:", error.message || error);
    throw error;
  }
};

/**
 * 이미지 엘리먼트로부터 얼굴 특징 벡터를 추출합니다.
 */
export const getFaceData = async (imageElement: HTMLImageElement) => {
  if (!detector) await loadModels();

  const faces = await detector.estimateFaces(imageElement, {
    flipHorizontal: false,
    staticImageMode: true,
  });

  return faces.length > 0 ? (faces[0] as unknown as KeypointFace) : null;
};

/**
 * 이미지의 픽셀 데이터를 기반으로 결정론적 해시를 생성합니다.
 */
export const getImageHash = (image: HTMLImageElement): number => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  const size = 32;
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(image, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size).data;
  let hash = 0;

  for (let i = 0; i < imageData.length; i += 4) {
    const char = imageData[i] + imageData[i + 1] + imageData[i + 2];
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  return Math.abs(hash);
};

const normalize = (value: number, min: number, max: number): number => {
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(1, normalized));
};

/**
 * [최종 하이브리드 로직: 페르소나 매칭 + Stable Hash Anchoring]
 */
export const getDeterministicIndex = (
  face: KeypointFace,
  totalResults: number
): number => {
  const keypoints = face.keypoints;

  const getDist = (idx1: number, idx2: number) => {
    const p1 = keypoints[idx1];
    const p2 = keypoints[idx2];
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow((p1.z || 0) - (p2.z || 0), 2)
    );
  };

  const faceWidth = getDist(234, 454);
  const faceHeight = getDist(168, 152);

  // 1. 특징 추출 (고정밀)
  const features = [
    normalize(getDist(33, 263) / faceWidth, 0.5, 0.85),
    normalize(getDist(64, 294) / faceWidth, 0.2, 0.36),
    normalize(getDist(61, 291) / faceWidth, 0.25, 0.55),
    normalize(getDist(172, 397) / faceWidth, 0.65, 0.95),
    normalize(faceHeight / faceWidth, 0.75, 1.0),
  ];

  // 2. 모든 직업과의 거리 계산 (Bias 제거 후 순수 기하학적 안정성 확인)
  let minDistance = Number.MAX_VALUE;
  let closestIndex = 0;

  /**
   * 가중치 조정 (Extreme Skeletal Weights)
   * - 눈(0.5), 코(0.3), 입(0.2) 등 표정이나 각도에 민감한 부위의 가중치 대폭 축소.
   * - 턱 너비(4.0), 얼굴 종횡비(5.0) 등 골격 중심의 지표에 압도적인 가중치 부여.
   * - 동일 인물의 골격은 변하지 않으므로 일관성이 극대화됨.
   */
  const weights = [0.5, 0.3, 0.2, 4.0, 5.0];

  JOB_PERSONAS_LIST.forEach((persona, index) => {
    if (index >= totalResults) return;

    let distSq = 0;
    for (let j = 0; j < 5; j++) {
      const diff = (features[j] - persona[j]) * weights[j];
      distSq += diff * diff;
    }

    if (distSq < minDistance) {
      minDistance = distSq;
      closestIndex = index;
    }
  });

  return closestIndex;
};

// 헬퍼: JOSEON_JOBS에서 페르소나 리스트 추출
const JOSEON_PERSONAS_LIST = JOSEON_JOBS.map((job) => job.persona);
const JOB_PERSONAS_LIST = JOSEON_PERSONAS_LIST;
