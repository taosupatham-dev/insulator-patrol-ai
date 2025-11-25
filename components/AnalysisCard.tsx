import React, { useState } from 'react';
import { AnalysisResult, InsulatorCondition } from '../types';
import { CheckCircle, Zap, HelpCircle, AlertOctagon, MapPin, Copy, Check } from 'lucide-react';
import Swal from 'sweetalert2';

interface AnalysisCardProps {
  result: AnalysisResult;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const getStatusConfig = (condition: InsulatorCondition) => {
    switch (condition) {
      case InsulatorCondition.NORMAL:
        return {
          color: 'bg-green-50 text-green-800 border-green-200',
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          label: 'ปกติ (Normal)',
          headerBg: 'bg-gradient-to-r from-green-500 to-green-600',
          accent: 'bg-green-100 text-green-700'
        };
      case InsulatorCondition.FLASHOVER:
        return {
          color: 'bg-orange-50 text-orange-800 border-orange-200',
          icon: <Zap className="w-8 h-8 text-orange-600" />,
          label: 'เกิด Flashover',
          headerBg: 'bg-gradient-to-r from-orange-500 to-orange-600',
          accent: 'bg-orange-100 text-orange-700'
        };
      case InsulatorCondition.BROKEN:
        return {
          color: 'bg-red-50 text-red-800 border-red-200',
          icon: <AlertOctagon className="w-8 h-8 text-red-600" />,
          label: 'แตกหัก/ชำรุด (Broken)',
          headerBg: 'bg-gradient-to-r from-red-600 to-red-700',
          accent: 'bg-red-100 text-red-700'
        };
      default:
        return {
          color: 'bg-gray-50 text-gray-800 border-gray-200',
          icon: <HelpCircle className="w-8 h-8 text-gray-600" />,
          label: 'ไม่แน่ใจ (Uncertain)',
          headerBg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          accent: 'bg-gray-200 text-gray-700'
        };
    }
  };

  const config = getStatusConfig(result.condition);

  const handleCopyReport = () => {
    const lines = [
      `📋 **รายงานผลการตรวจสอบลูกถ้วย**`,
      `สถานะ: ${config.label}`,
      `ความมั่นใจ: ${result.confidence}%`,
      `-------------------`,
      `📍 พิกัด: ${result.location ? `${result.location.latitude.toFixed(6)}, ${result.location.longitude.toFixed(6)}` : 'ไม่ระบุ'}`,
      `📝 รายละเอียด: ${result.description}`,
      `🛠️ คำแนะนำ: ${result.recommendation}`
    ];
    
    if (result.location) {
        lines.push(`🗺️ Maps: https://maps.google.com/?q=${result.location.latitude},${result.location.longitude}`);
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    
    // Show SweetAlert2 Toast
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });

    Toast.fire({
      icon: 'success',
      title: 'คัดลอกรายงานแล้ว'
    });

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-patrol-200/50 overflow-hidden border border-white mt-6 animate-fade-in-up">
      <div className={`${config.headerBg} p-5 flex items-center justify-between text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10 opacity-30 pattern-grid"></div>
        <h2 className="text-xl font-bold relative z-10">ผลการวิเคราะห์</h2>
        <span className="bg-white/25 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md border border-white/20 relative z-10">
          มั่นใจ {result.confidence}%
        </span>
      </div>
      
      <div className="p-6">
        <div className={`flex items-center gap-4 p-5 rounded-2xl border ${config.color} mb-6`}>
          <div className="bg-white p-3 rounded-full shadow-sm">
            {config.icon}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-70 font-bold mb-0.5">สถานะ (Condition)</p>
            <p className="text-2xl font-bold">{config.label}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Location Section */}
          <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600 mt-1">
                <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-bold text-blue-900 mb-1">ตำแหน่งที่ตรวจสอบ (GPS)</h4>
                {result.location ? (
                    <>
                        <p className="text-sm text-blue-800 font-mono bg-blue-100/50 px-2 py-1 rounded inline-block">
                            {result.location.latitude.toFixed(6)}, {result.location.longitude.toFixed(6)}
                        </p>
                        <div className="mt-2">
                            <a 
                                href={`https://maps.google.com/?q=${result.location.latitude},${result.location.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors"
                            >
                                เปิดใน Google Maps
                            </a>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-gray-500 italic">ไม่พบข้อมูลพิกัด</p>
                )}
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold mb-2 flex items-center gap-2 text-lg">
              <span className="w-1.5 h-6 bg-patrol-500 rounded-full"></span>
              รายละเอียด
            </h3>
            <p className="text-gray-700 leading-relaxed pl-4 border-l-2 border-gray-100 text-base">
                {result.description}
            </p>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold mb-2 flex items-center gap-2 text-lg">
              <span className="w-1.5 h-6 bg-patrol-500 rounded-full"></span>
              คำแนะนำ
            </h3>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-gray-700 font-medium leading-relaxed">{result.recommendation}</p>
            </div>
          </div>
          
          <button
            onClick={handleCopyReport}
            className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-base ${
                copied 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-white border-gray-100 text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
            }`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span>{copied ? 'คัดลอกเรียบร้อย' : 'คัดลอกรายงานส่งต่อ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};