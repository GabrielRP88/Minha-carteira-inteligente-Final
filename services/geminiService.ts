
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const getSmartInsights = async (transactions: Transaction[]) => {
  // Guidelines specify process.env.API_KEY is handled externally and is valid.
  if (transactions.length === 0) return null;

  try {
    // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise as seguintes transações financeiras e forneça 3 dicas curtas e motivacionais em português brasileiro sobre como economizar ou gerir melhor o dinheiro. Retorne apenas o JSON.
      Transações: ${JSON.stringify(transactions.map(t => ({ desc: t.description, val: t.amount, type: t.type })))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["tips"]
        }
      }
    });

    // Access .text property directly (not a method)
    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
