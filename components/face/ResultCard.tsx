"use client";

import React from 'react';
import { JoseonJob } from '@/constants/joseon-jobs';

interface Props {
  job: JoseonJob;
  onReset: () => void;
  previewUrl: string;
}

export default function ResultCard({ job, onReset, previewUrl }: Props) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '내가 왕이 될 상인가!',
        text: `나의 조선시대 직업은 [${job.title}]이라네! 그대의 관상은 어떠한가?`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었다네! 팔도강산에 널리 퍼뜨려주시게.");
    }
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
      <div className="relative group max-w-md w-full bg-[#fdf5e6] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[6px] border-amber-900">
        {/* 상단 이미지 영역 */}
        <div className="relative h-72 overflow-hidden">
          <img 
            src={previewUrl} 
            alt="User face" 
            className="w-full h-full object-cover grayscale-[0.3] sepia-[0.2]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900 via-transparent to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
            <div className="inline-block px-4 py-1 bg-amber-600 text-white text-xs font-bold rounded-full mb-2">
              하늘이 정해준 운명
            </div>
            <h3 className="text-white text-4xl font-black tracking-widest drop-shadow-lg">
              {job.title}
            </h3>
          </div>
        </div>

        {/* 하단 상세 설명 영역 */}
        <div className="p-8 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-amber-900 rounded-full flex items-center justify-center border-4 border-[#fdf5e6] shadow-xl">
            <span className="text-2xl">📜</span>
          </div>

          <p className="mt-4 text-amber-800 font-bold italic text-lg mb-6">
            "{job.motto}"
          </p>
          
          <div className="space-y-4 text-amber-950 leading-relaxed mb-8">
            <p className="font-medium text-lg">
              {job.description}
            </p>
            <div className="p-4 bg-amber-100/50 rounded-2xl border border-amber-200">
              <span className="block text-xs font-bold text-amber-800 uppercase tracking-tighter mb-1">
                [ 용안의 특징 ]
              </span>
              <p className="text-sm italic text-amber-900">
                {job.trait}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleShare}
              className="w-full py-4 bg-amber-900 text-white rounded-2xl font-bold shadow-lg hover:bg-amber-800 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>🚩</span> 팔도강산에 소문내기
            </button>
            <button 
              onClick={onReset}
              className="w-full py-4 border-2 border-amber-900 text-amber-900 rounded-2xl font-bold hover:bg-amber-100 active:scale-95 transition-all"
            >
              다시 관상 보기
            </button>
          </div>
        </div>

        {/* 장식용 코너 무늬 */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-900/20"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-900/20"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-900/20"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-900/20"></div>
      </div>
      
      <p className="mt-8 text-amber-900/60 text-xs italic">
        * 본 결과는 재미로 보는 것이니 너무 연연하지 말게나.
      </p>
    </div>
  );
}
