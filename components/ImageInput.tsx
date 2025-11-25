import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';

interface ImageInputProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-5">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      
      <button
        onClick={handleCameraClick}
        disabled={isLoading}
        className="group relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-patrol-500 to-patrol-700 text-white rounded-2xl shadow-lg shadow-patrol-500/30 transition-all hover:scale-105 active:scale-95 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm">
          <Camera className="w-8 h-8" />
        </div>
        <span className="font-bold text-lg">ถ่ายภาพ</span>
        <span className="text-xs opacity-80 mt-1 font-medium">Camera</span>
      </button>

      <button
        onClick={handleUploadClick}
        disabled={isLoading}
        className="group flex flex-col items-center justify-center p-6 bg-white text-patrol-900 border-2 border-patrol-100 rounded-2xl shadow-sm hover:border-patrol-300 transition-all hover:scale-105 active:scale-95 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="bg-patrol-50 p-3 rounded-full mb-3 group-hover:bg-patrol-100 transition-colors">
          <Upload className="w-8 h-8 text-patrol-600" />
        </div>
        <span className="font-bold text-lg">อัปโหลด</span>
        <span className="text-xs opacity-60 mt-1 font-medium">Gallery</span>
      </button>
    </div>
  );
};