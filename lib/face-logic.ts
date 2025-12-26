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
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let detector: any = null;

/**
 * AI 모델을 로드합니다. (MediaPipe Face Mesh)
 */
export const loadModels = async () => {
  try {
    if (!window.faceLandmarksDetection) {
      console.warn("Waiting for faceLandmarksDetection script to load...");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!window.faceLandmarksDetection) {
      throw new Error("Face Landmarks Detection script not loaded.");
    }

    const model =
      window.faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig = {
      runtime: "mediapipe",
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
      refineLandmarks: true,
    };

    detector = await window.faceLandmarksDetection.createDetector(
      model,
      detectorConfig
    );
    console.log("MediaPipe Face Mesh detector loaded successfully (via CDN)");
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
  // Return high precision normalized value
  return Math.max(0, Math.min(1, normalized));
};

/**
 * [최종 하이브리드 로직: 페르소나 매칭 + Stable Hash Anchoring]
 * 얼굴 비율을 통해 후보군을 좁히고,
 * 미세한 수치 변화로 결과가 갈릴 때 'Stable Hash'가 결과를 한쪽으로 고정(Anchoring)합니다.
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

  // 2. Stable Hash 생성 (Very Coarse Quantization)
  // 0.2 단위로 묶어서(5단계), 큰 틀에서의 얼굴 형에 따라 고유 해시 생성
  // 미세한 표정 변화나 각도 차이로 인한 수치 변화를 무시함.
  const stableHash = features.reduce((acc, val, idx) => {
    const quantized = Math.floor(val * 5); // 0, 1, 2, 3, 4, 5
    return acc + quantized * Math.pow(6, idx);
  }, 0);

  // 3. 가장 가까운 페르소나 찾기 (Euclidean Distance)
  let minDistance = Number.MAX_VALUE;
  let closestIndex = 0;

  // 가중치 (안정적인 골격 위주)
  const weights = [1.5, 1.0, 0.5, 2.0, 2.5];

  JOB_PERSONAS_LIST.forEach((persona, index) => {
    if (index >= totalResults) return;

    let distSq = 0;
    for (let j = 0; j < 5; j++) {
      const diff = (features[j] - persona[j]) * weights[j];
      distSq += diff * diff;
    }

    /**
     * 4. Strong Anchoring with Stable Hash
     * - Coarse Hash를 통해 결정된 '영역'에 따라 강력한 Bias(0.15)를 줌.
     * - 이는 비율이 조금 달라도 같은 영역(Bucket)에 있다면 동일한 결과를 보장하려는 의도.
     */
    const noise = Math.sin(stableHash + index) * 0.15;
    const score = distSq + noise;

    if (score < minDistance) {
      minDistance = score;
      closestIndex = index;
    }
  });

  return closestIndex;
};

// 헬퍼: JOSEON_JOBS에서 페르소나 리스트 추출
const JOSEON_PERSONAS_LIST = JOSEON_JOBS.map((job) => job.persona);
const JOB_PERSONAS_LIST = JOSEON_PERSONAS_LIST;
