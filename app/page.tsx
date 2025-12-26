"use client";

import React, { useState, useEffect } from 'react';
import ImageUploader from '@/components/face/ImageUploader';
import AnalysisOverlay from '@/components/face/AnalysisOverlay';
import ResultCard from '@/components/face/ResultCard';
import { loadModels, getFaceData, getDeterministicIndex } from '@/lib/face-logic';
import { JOSEON_JOBS, JoseonJob } from '@/constants/joseon-jobs';

export default function Home() {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [resultJob, setResultJob] = useState<JoseonJob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // 컴포넌트 마운트 시 AI 모델 로드
  useEffect(() => {
    const init = async () => {
      try {
        await loadModels();
        setModelsLoaded(true);
      } catch (error) {
        console.error("AI 모델 로딩 실패:", error);
        // CDN 스크립트가 아직 로드되지 않았을 수 있으므로 조용히 넘어감 (사용자 인터랙션 시 재시도됨)
      }
    };
    init();
  }, []);

  const handleImageUpload = async (image: HTMLImageElement, url: string) => {
    setPreviewUrl(url);
    setStep('analyzing');

    try {
      // 실제 분석과 '분석하는 척' 하는 연출 시간을 합쳐 최소 3초 보장
      const [faceData] = await Promise.all([
        getFaceData(image),
        new Promise(resolve => setTimeout(resolve, 3000)) 
      ]);

      if (faceData) {
        // 결정론적 비율 분석으로 결과 도출 (순수 기하학적 거리 기반)
        const index = getDeterministicIndex(faceData, JOSEON_JOBS.length);
        setResultJob(JOSEON_JOBS[index]);
        setStep('result');
      } else {
        alert("이런! 그대의 용안을 찾을 수 없구려. 정면 사진으로 다시 시도해주시게.");
        setStep('upload');
      }
    } catch (error) {
      console.error("분석 중 오류 발생:", error);
      alert("분석 중에 문제가 생겼구려. 잠시 후 다시 시도해주시게.");
      setStep('upload');
    }
  };

  return (
    <main className="min-h-screen bg-[#f3e5ab] selection:bg-amber-900 selection:text-white flex flex-col items-center justify-center p-6 sm:p-12 font-serif">
      {/* 장식용 패턴 (배경 효과) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }}></div>

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-1000">
          <div className="inline-block px-4 py-1 border-2 border-amber-900 text-amber-900 text-sm font-bold mb-4 rounded-md">
            조선 팔도 최고의 관상소
          </div>
          <h1 className="text-6xl sm:text-7xl font-black text-amber-900 mb-6 drop-shadow-sm tracking-tighter">
            내가 왕이 될 상인가!
          </h1>
          <p className="text-xl text-amber-800 font-medium leading-relaxed">
            그대의 용안(顔) 속에 숨겨진<br className="sm:hidden"/> 조선시대 진짜 신분을 찾아드리리다.
          </p>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="w-full">
          {step === 'upload' && (
            <div className="animate-in fade-in zoom-in duration-500">
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                isLoading={!modelsLoaded} 
              />
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="bg-white/40 p-4 rounded-xl text-center">
                  <span className="text-2xl block mb-2">🔒</span>
                  <p className="text-xs text-amber-900">사진은 저장되지 않고<br/>브라우저에서만 처리됨</p>
                </div>
                <div className="bg-white/40 p-4 rounded-xl text-center">
                  <span className="text-2xl block mb-2">⚖️</span>
                  <p className="text-xs text-amber-900">같은 얼굴이면 항상<br/>같은 결과가 나옴</p>
                </div>
              </div>
            </div>
          )}

          {step === 'analyzing' && <AnalysisOverlay />}

          {step === 'result' && resultJob && (
            <ResultCard 
              job={resultJob} 
              previewUrl={previewUrl}
              onReset={() => setStep('upload')} 
            />
          )}
        </div>

        {/* 푸터 */}
        <footer className="mt-20 text-center">
          <p className="text-amber-900/50 text-sm tracking-widest uppercase">
            Since 1453 • 관상학 연구소
          </p>
          <div className="mt-4 flex justify-center gap-4 opacity-30">
            <div className="w-8 h-px bg-amber-900"></div>
            <div className="w-2 h-2 rotate-45 border border-amber-900"></div>
            <div className="w-8 h-px bg-amber-900"></div>
          </div>
        </footer>
      </div>
    </main>
  );
}
