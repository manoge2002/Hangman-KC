
import { GoogleGenAI, Type } from "@google/genai";
import { GameWord } from "../types";
import { FALLBACK_WORDS } from "../constants";

// Correctly initialize GoogleGenAI with process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getNewWord = async (): Promise<GameWord> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generiere ein zufälliges, interessantes deutsches Wort für das Spiel Hangman. Das Wort sollte zwischen 6 und 12 Buchstaben lang sein. Gib mir das Wort, einen kurzen Hinweis und eine Kategorie zurück.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING, description: "Das Wort in Großbuchstaben" },
            hint: { type: Type.STRING, description: "Ein kurzer, hilfreicher Hinweis" },
            category: { type: Type.STRING, description: "Die Kategorie des Wortes" }
          },
          required: ["word", "hint", "category"]
        }
      }
    });

    // Access the text property directly from the response
    const result = JSON.parse(response.text || '{}');
    if (result.word) {
      return {
        word: result.word.toUpperCase().replace(/\s/g, ''),
        hint: result.hint,
        category: result.category
      };
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Gemini API error, using fallback:", error);
    const randomIndex = Math.floor(Math.random() * FALLBACK_WORDS.length);
    return FALLBACK_WORDS[randomIndex];
  }
};
