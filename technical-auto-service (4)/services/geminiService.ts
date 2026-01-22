
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartDiagnosis = async (
  description: string, 
  carBrand: string,
  serviceType: string,
  imageUrl?: string
): Promise<DiagnosisResult | null> => {
  try {
    // Upgraded to gemini-3-pro-preview for complex reasoning task (car diagnosis)
    const modelName = 'gemini-3-pro-preview';
    
    const prompt = `Analyze this car request and provide a diagnosis in JSON format. 
    Car Brand: ${carBrand}
    Service Requested: ${serviceType}
    User Description: ${description}
    
    If an image is provided, consider it in your analysis.
    Output must follow the schema: { "possibleIssue": string, "estimatedCostRange": string, "urgency": "Low" | "Medium" | "High" }
    Please reply in Thai language for the text parts. Be specific to the ${carBrand} brand if possible.`;

    const contents: any = { parts: [{ text: prompt }] };

    if (imageUrl) {
      const base64Data = imageUrl.split(',')[1];
      contents.parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            possibleIssue: { type: Type.STRING },
            estimatedCostRange: { type: Type.STRING },
            urgency: { type: Type.STRING, description: "Must be one of: Low, Medium, High" }
          },
          required: ["possibleIssue", "estimatedCostRange", "urgency"]
        }
      }
    });

    // Directly access the text property as per GenAI SDK guidelines
    const jsonStr = response.text?.trim();
    if (!jsonStr) return null;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    return null;
  }
};
