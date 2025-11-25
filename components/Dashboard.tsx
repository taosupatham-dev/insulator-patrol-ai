import React from 'react';
import { AnalysisHistoryItem, InsulatorCondition } from '../types';
import { PieChart, CheckCircle, Zap, AlertOctagon, HelpCircle, Activity } from 'lucide-react';

interface DashboardProps {
  history: AnalysisHistoryItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  if (history.length === 0) return null;

  const total = history.length;
  const normal = history.filter(h => h.condition === InsulatorCondition.NORMAL).length;
  const flashover = history.filter(h => h.condition === InsulatorCondition.FLASHOVER).length;
  const broken = history.filter(h => h.condition === InsulatorCondition.BROKEN).length;
  const uncertain = history.filter(h => h.condition === InsulatorCondition.UNCERTAIN).length;

  const getPercentage = (count: number) => ((count / total) * 100).toFixed(0);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg shadow-patrol-100 border border-white mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-patrol-100 p-2 rounded-lg">
           <Activity className="w-5 h-5 text-patrol-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">สรุปผลการตรวจสอบ</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        
        {/* Total Card */}
        <div className="col-span-2 bg-gradient-to-r from-patrol-500 to-patrol-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-2 translate-y-2">
                <PieChart className="w-24 h-24" />
            </div>
            <p className="text-patrol-100 text-sm font-medium mb-1">ตรวจแล้วทั้งหมด</p>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{total}</span>
                <span className="text-sm opacity-80">จุด</span>
            </div>
        </div>

        {/* Normal */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-2 -top-2 bg-green-100 w-12 h-12 rounded-full opacity-50"></div>
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">ปกติ</span>
            </div>
            <div className="flex items-end justify-between relative z-10">
                <span className="text-2xl font-bold text-green-800">{normal}</span>
                <span className="text-[10px] text-green-600 font-medium bg-green-100 px-1.5 py-0.5 rounded-md">
                    {getPercentage(normal)}%
                </span>
            </div>
        </div>

        {/* Flashover */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
             <div className="absolute -right-2 -top-2 bg-orange-100 w-12 h-12 rounded-full opacity-50"></div>
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-orange-700">Flashover</span>
            </div>
            <div className="flex items-end justify-between relative z-10">
                <span className="text-2xl font-bold text-orange-800">{flashover}</span>
                 <span className="text-[10px] text-orange-600 font-medium bg-orange-100 px-1.5 py-0.5 rounded-md">
                    {getPercentage(flashover)}%
                </span>
            </div>
        </div>

        {/* Broken */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
             <div className="absolute -right-2 -top-2 bg-red-100 w-12 h-12 rounded-full opacity-50"></div>
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-red-700">แตกหัก</span>
            </div>
            <div className="flex items-end justify-between relative z-10">
                <span className="text-2xl font-bold text-red-800">{broken}</span>
                 <span className="text-[10px] text-red-600 font-medium bg-red-100 px-1.5 py-0.5 rounded-md">
                    {getPercentage(broken)}%
                </span>
            </div>
        </div>

         {/* Uncertain */}
         <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
             <div className="absolute -right-2 -top-2 bg-gray-200 w-12 h-12 rounded-full opacity-50"></div>
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-600">ไม่แน่ใจ</span>
            </div>
            <div className="flex items-end justify-between relative z-10">
                <span className="text-2xl font-bold text-gray-700">{uncertain}</span>
                 <span className="text-[10px] text-gray-500 font-medium bg-gray-200 px-1.5 py-0.5 rounded-md">
                    {getPercentage(uncertain)}%
                </span>
            </div>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
        {normal > 0 && <div style={{ width: `${(normal/total)*100}%` }} className="h-full bg-green-500"></div>}
        {flashover > 0 && <div style={{ width: `${(flashover/total)*100}%` }} className="h-full bg-orange-500"></div>}
        {broken > 0 && <div style={{ width: `${(broken/total)*100}%` }} className="h-full bg-red-500"></div>}
        {uncertain > 0 && <div style={{ width: `${(uncertain/total)*100}%` }} className="h-full bg-gray-400"></div>}
      </div>
       <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium">
          <span>อัตราส่วนความเสียหาย</span>
          <span>{total > 0 ? '100%' : '0%'}</span>
       </div>
    </div>
  );
};
