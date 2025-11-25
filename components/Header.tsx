import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-patrol-800 via-patrol-700 to-patrol-900 text-white p-4 sticky top-0 z-50 shadow-lg shadow-patrol-900/10 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
          <ShieldCheck className="w-8 h-8 text-patrol-200" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight tracking-tight">Patrol Assistant</h1>
          <p className="text-xs text-patrol-100 opacity-90 font-medium">ระบบวิเคราะห์ลูกถ้วยไฟฟ้าอัจฉริยะ</p>
        </div>
      </div>
    </header>
  );
};