import { AnalysisResult } from "../types";

export const analyzeInsulatorImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    // Call the Vercel Serverless Function
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server error during analysis');
    }

    const result = await response.json();
    return result as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("ไม่สามารถวิเคราะห์ภาพได้ กรุณาลองใหม่อีกครั้ง");
  }
};