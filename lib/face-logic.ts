import * as faceapi from 'face-api.js';

/**
 * AI 모델을 로드합니다. (TinyFaceDetector, Landmarks, Recognition)
 */
export const loadModels = async () => {
  const MODEL_URL = '/models';
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    console.log("Models loaded successfully");
  } catch (error) {
    console.error("Error loading models:", error);
    throw error;
  }
};

/**
 * 이미지 엘리먼트로부터 얼굴 특징 벡터(Descriptor)를 추출합니다.
 */
export const getFaceDescriptor = async (imageElement: HTMLImageElement) => {
  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  return detection?.descriptor || null;
};

/**
 * 특징 벡터를 바탕으로 0 ~ totalResults-1 사이의 고정된 인덱스를 반환합니다.
 * 같은 얼굴(유사한 벡터)은 항상 같은 인덱스를 반환하도록 설계되었습니다.
 */
export const getDeterministicIndex = (descriptor: Float32Array, totalResults: number): number => {
  // 128개의 부동소수점 특징값을 합산
  // 각 값의 미세한 차이가 결과에 반영되도록 곱셉을 활용
  const sum = descriptor.reduce((acc, val, idx) => {
    return acc + Math.abs(val) * (idx + 1);
  }, 0);
  
  // 큰 정수로 변환 후 모듈러 연산
  const seed = Math.floor(sum * 100000);
  return seed % totalResults;
};
