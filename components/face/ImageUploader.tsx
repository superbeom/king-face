"use client";

import React, { useRef, useState } from 'react';

interface Props {
  onImageUpload: (image: HTMLImageElement, previewUrl: string) => void;
  isLoading: boolean;
}

export default function ImageUploader({ onImageUpload, isLoading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("이미지 파일만 올려주시게!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      img.onload = () => onImageUpload(img, result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center p-10 border-4 border-dashed rounded-2xl transition-all duration-300 ${
        dragActive ? "border-amber-900 bg-amber-200" : "border-amber-600 bg-amber-50"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="text-6xl mb-4">📸</div>
      <h2 className="text-2xl font-bold text-amber-900 mb-2">그대의 용안을 보여주시게</h2>
      <p className="text-amber-700 mb-6 text-center">
        정면 사진일수록 관상이 정확히 나온다네.<br/>
        파일을 여기로 끌어다 놓아도 된다네.
      </p>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="px-8 py-4 bg-amber-800 text-white font-bold rounded-full shadow-lg hover:bg-amber-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "분석 중..." : "용안 사진 선택"}
      </button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="mt-8 flex items-center gap-2 text-amber-800 text-sm bg-white/50 px-4 py-2 rounded-full">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        사진은 서버에 저장되지 않으니 걱정 말게나.
      </div>
    </div>
  );
}
