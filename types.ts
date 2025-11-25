export enum InsulatorCondition {
  NORMAL = 'Normal',
  FLASHOVER = 'Flashover',
  BROKEN = 'Broken',
  UNCERTAIN = 'Uncertain'
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface AnalysisResult {
  condition: InsulatorCondition;
  confidence: number;
  description: string;
  recommendation: string;
  location?: LocationData;
}

export interface AnalysisHistoryItem extends AnalysisResult {
  id: string;
  timestamp: number;
  imageData: string; // Base64 for thumbnail
}