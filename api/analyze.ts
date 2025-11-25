import { GoogleGenAI, Type } from "@google/genai";
import { InsulatorCondition } from "../types";

// Vercel Serverless Function Config
export const config = {
  maxDuration: 60, // Allow up to 60 seconds for AI processing
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { image } = await request.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image data is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Gemini on the server side where process.env is available
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error: API Key missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `
      Analyze this image of an electrical insulator strictly as an expert electrical patrol officer.
      
      Determine if the insulator is:
      1. Normal (อยู่ในสภาพปกติ)
      2. Flashover (มีรอยไหม้ หรือร่องรอย Flashover)
      3. Broken (แตกหัก บิ่น หรือเสียหายทางกายภาพ)
      
      If the image is not an insulator or is too blurry to tell, classify as 'Uncertain'.
      
      Provide a confidence score (0-100), a description in Thai language explaining visual evidence, and a maintenance recommendation in Thai.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: image // Receives base64 string from frontend
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: {
              type: Type.STRING,
              enum: [
                InsulatorCondition.NORMAL,
                InsulatorCondition.FLASHOVER,
                InsulatorCondition.BROKEN,
                InsulatorCondition.UNCERTAIN
              ],
              description: "The condition status of the insulator."
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score between 0 and 100."
            },
            description: {
              type: Type.STRING,
              description: "Detailed analysis of visual findings in Thai language."
            },
            recommendation: {
              type: Type.STRING,
              description: "Actionable maintenance recommendation in Thai language."
            }
          },
          required: ["condition", "confidence", "description", "recommendation"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to analyze image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}