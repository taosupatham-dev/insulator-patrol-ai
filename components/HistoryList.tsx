import React from 'react';
import { AnalysisHistoryItem, InsulatorCondition } from '../types';
import { Clock, MapPin, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface HistoryListProps {
  history: AnalysisHistoryItem[];
  onClear: () => void;
  onSelect: (item: AnalysisHistoryItem) => void;
  onDelete: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onClear, onSelect, onDelete }) => {
  if (history.length === 0) return null;

  const getStatusColor = (condition: InsulatorCondition) => {
    switch (condition) {
      case InsulatorCondition.NORMAL: return 'text-green-700 bg-green-100 border-green-200';
      case InsulatorCondition.FLASHOVER: return 'text-orange-700 bg-orange-100 border-orange-200';
      case InsulatorCondition.BROKEN: return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const handleClearConfirm = () => {
    Swal.fire({
      title: 'ลบประวัติทั้งหมด?',
      text: "คุณต้องการลบข้อมูลประวัติการตรวจสอบทั้งหมดหรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onClear();
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });
        Toast.fire({
            icon: 'success',
            title: 'ลบประวัติเรียบร้อย'
        });
      }
    });
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop bubbling to prevent selecting the item

    Swal.fire({
      title: 'ลบรายการนี้?',
      text: "คุณต้องการลบผลการตรวจสอบนี้ใช่ไหม",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
       customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(id);
      }
    });
  };

  return (
    <div className="mt-8 mb-12 animate-fade-in">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <div className="bg-patrol-100 p-1.5 rounded-lg">
             <Clock className="w-4 h-4 text-patrol-600" />
          </div>
          ประวัติล่าสุด
        </h3>
        <button 
          onClick={handleClearConfirm}
          className="text-xs font-semibold text-red-500 flex items-center gap-1.5 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> ล้างประวัติ
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-patrol-200 transition-all cursor-pointer flex gap-3 items-start pr-12"
          >
            {/* Delete Button - Absolute Position */}
            <button
                onClick={(e) => handleDeleteItem(item.id, e)}
                className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10"
                title="ลบรายการนี้"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-inner">
              <img 
                src={item.imageData} 
                alt="Thumbnail" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            
            <div className="flex-1 min-w-0 py-1">
              <div className="flex justify-between items-start gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.condition)}`}>
                  {item.condition}
                </span>
                <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {new Date(item.timestamp).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              
              <p className="text-sm font-medium text-gray-700 line-clamp-2 break-words leading-snug mb-2">
                {item.description}
              </p>
              
              {item.location && (
                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-patrol-400" />
                  <span className="truncate">{item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};