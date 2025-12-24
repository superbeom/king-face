"use client";

import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "눈매의 기운을 살피는 중...",
  "이마의 너비로 관운을 읽는 중...",
  "입술의 모양으로 재복을 따지는 중...",
  "코의 높낮이로 명예를 가늠하는 중...",
  "조선 팔도 관상 족보를 뒤지는 중...",
  "하늘의 기운과 땅의 이치를 묻는 중...",
  "그대의 운명을 결정짓는 중...",
];

export default function AnalysisOverlay() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-6 text-center">
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 border-8 border-amber-600/30 rounded-full"></div>
        <div className="absolute inset-0 border-8 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-4xl">🔮</div>
      </div>
      
      <h2 className="text-3xl font-bold text-amber-500 mb-6">잠시만 기다리게...</h2>
      
      <div className="h-10">
        <p className="text-xl text-white font-medium animate-pulse transition-all duration-500">
          {MESSAGES[msgIdx]}
        </p>
      </div>
      
      <div className="mt-12 text-amber-200/50 text-sm">
        관상학적으로 분석 중이니 움직이지 말게나 (농담일세)
      </div>
    </div>
  );
}
