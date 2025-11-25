import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageInput } from './components/ImageInput';
import { AnalysisCard } from './components/AnalysisCard';
import { HistoryList } from './components/HistoryList';
import { Dashboard } from './components/Dashboard';
import { AnalysisResult, AnalysisHistoryItem, LocationData } from './types';
import { analyzeInsulatorImage } from './services/geminiService';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

// --- Cute Robot Mascot Component ---
const PatrolBotLoading: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="relative w-32 h-32 mb-4">
       <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#f0abfc', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#c026d3', stopOpacity:1}} />
          </linearGradient>
        </defs>
        
        {/* Antennas */}
        <line x1="100" y1="50" x2="100" y2="20" stroke="#a21caf" strokeWidth="4" />
        <circle cx="100" cy="20" r="8" fill="#ef4444" className="animate-pulse" />

        {/* Head */}
        <rect x="50" y="50" width="100" height="80" rx="15" fill="white" stroke="#a21caf" strokeWidth="4" />
        
        {/* Face Screen */}
        <rect x="60" y="60" width="80" height="50" rx="10" fill="#2e1065" />

        {/* Eyes */}
        <circle cx="85" cy="85" r="8" fill="#00ff00" className="animate-pulse-fast" />
        <circle cx="115" cy="85" r="8" fill="#00ff00" className="animate-pulse-fast" />

        {/* Body */}
        <path d="M 60 135 L 140 135 L 150 180 L 50 180 Z" fill="url(#robotGrad)" />
        
        {/* Arms with Magnifying Glass */}
        <path d="M 140 150 L 170 140" stroke="#a21caf" strokeWidth="5" strokeLinecap="round" className="animate-wiggle origin-left"/>
        <circle cx="175" cy="135" r="15" stroke="#701a75" strokeWidth="3" fill="rgba(255,255,255,0.3)" className="animate-wiggle" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-patrol-800 animate-pulse">กำลังวิเคราะห์ข้อมูล...</h3>
    <p className="text-patrol-600 text-sm mt-1">น้องบอทกำลังตรวจสอบลูกถ้วยให้อยู่ครับ</p>
  </div>
);

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('patrol_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveToHistory = (newItem: AnalysisHistoryItem) => {
    try {
      // Keep last 50 items for better stats, though list might show fewer
      const updated = [newItem, ...history].slice(0, 50); 
      setHistory(updated);
      localStorage.setItem('patrol_history', JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage quota exceeded or error saving history");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('patrol_history');
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('patrol_history', JSON.stringify(updated));
  };

  const getCurrentLocation = (): Promise<LocationData | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => {
          console.warn("Geolocation error:", err);
          resolve(undefined);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelected = useCallback(async (file: File) => {
    try {
      setError(null);
      setResult(null);
      setIsAnalyzing(true);

      // Create local preview URL
      const objectUrl = URL.createObjectURL(file);
      setSelectedImage(objectUrl);

      // Get Location concurrently
      const locationPromise = getCurrentLocation();

      // Convert and Analyze
      const base64Data = await convertFileToBase64(file);
      
      // Delay slightly to show the cute animation (UX)
      const [analysisResult, location] = await Promise.all([
        analyzeInsulatorImage(base64Data),
        locationPromise,
        new Promise(resolve => setTimeout(resolve, 2000)) // Minimum 2s loading to show character
      ]);
      
      const finalResult: AnalysisResult = {
        ...analysisResult,
        location
      };

      setResult(finalResult);

      // Save to History
      const historyItem: AnalysisHistoryItem = {
        ...finalResult,
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageData: objectUrl 
      };
      
      saveToHistory({
        ...historyItem,
        imageData: `data:image/jpeg;base64,${base64Data}`
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#d946ef'
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [history]);

  const handleHistorySelect = (item: AnalysisHistoryItem) => {
    setSelectedImage(item.imageData);
    setResult(item);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20 bg-patrol-50 font-sans">
      <Header />

      <main className="max-w-3xl mx-auto px-4 pt-6">
        
        {/* Initial State / Image Input */}
        {!selectedImage && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-patrol-200/50 border border-white relative overflow-hidden">
               {/* Decorative background circle */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-patrol-100 rounded-full opacity-50 blur-2xl"></div>
               
              <div className="relative z-10 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">เริ่มการตรวจสอบ</h2>
                <p className="text-gray-500 mb-8">เลือกรูปภาพลูกถ้วยไฟฟ้า หรือถ่ายรูปใหม่เพื่อวิเคราะห์สภาพ</p>
                <ImageInput onImageSelected={handleImageSelected} isLoading={isAnalyzing} />
              </div>
            </div>

            {/* Dashboard Component Added Here */}
            <Dashboard history={history} />
            
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-patrol-100 shadow-sm">
              <h3 className="font-bold text-patrol-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-patrol-600" />
                ข้อแนะนำในการถ่ายภาพ
              </h3>
              <ul className="text-sm text-patrol-800 space-y-2 list-disc list-inside opacity-80 pl-2">
                <li>ถ่ายภาพให้เห็นลูกถ้วยชัดเจน ไม่เบลอ</li>
                <li>ควรให้มีแสงสว่างเพียงพอ</li>
                <li>พยายามให้ลูกถ้วยอยู่กึ่งกลางภาพ</li>
              </ul>
            </div>

            <HistoryList 
              history={history} 
              onClear={clearHistory} 
              onSelect={handleHistorySelect}
              onDelete={deleteHistoryItem}
            />
          </div>
        )}

        {/* Selected Image Preview & Loading State */}
        {selectedImage && (
          <div className="space-y-6 animate-fade-in">
             <button 
                onClick={handleReset}
                className="flex items-center text-sm font-bold text-patrol-700 hover:text-patrol-900 mb-2 bg-white/50 px-3 py-1.5 rounded-full transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> กลับหน้าหลัก
              </button>

            <div className={`relative rounded-3xl overflow-hidden shadow-2xl shadow-patrol-900/10 bg-white aspect-video flex items-center justify-center group border-4 border-white transition-all duration-300 ${isAnalyzing ? 'scale-100' : ''}`}>
              <img 
                src={selectedImage} 
                alt="Selected Insulator" 
                className="w-full h-full object-contain bg-gray-900"
              />
              
              {/* Modern Loading Overlay with Mascot */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-20">
                  <PatrolBotLoading />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-700 p-6 rounded-2xl flex items-start gap-4 border border-red-100 shadow-sm animate-fade-in-up">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">เกิดข้อผิดพลาด</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
                <button 
                  onClick={handleReset}
                  className="text-sm font-bold underline hover:text-red-900 whitespace-nowrap mt-1"
                >
                  ลองใหม่
                </button>
              </div>
            )}

            {/* Result Card */}
            {result && !isAnalyzing && (
              <AnalysisCard result={result} />
            )}

            {/* Action Buttons (Bottom Sticky) */}
            {result && !isAnalyzing && (
               <div className="fixed bottom-8 left-0 right-0 px-4 flex justify-center z-40 pointer-events-none animate-fade-in-up">
                 <button
                  onClick={handleReset}
                  className="pointer-events-auto shadow-2xl shadow-patrol-600/40 bg-gradient-to-r from-patrol-700 to-patrol-900 text-white px-8 py-3.5 rounded-full font-bold text-lg flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 border-2 border-white/20"
                 >
                   <RefreshCw className="w-5 h-5" />
                   ตรวจสอบรายการต่อไป
                 </button>
               </div>
            )}
            
            <div className="h-12"></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;