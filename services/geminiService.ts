
import { GoogleGenAI, Type } from "@google/genai";
import { Habit, HabitLog, AIInsight } from "../types";

export const getHabitInsights = async (habits: Habit[], logs: HabitLog): Promise<AIInsight> => {
  // Fix: Initialize GoogleGenAI with apiKey from process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const habitsList = habits.map(h => h.name).join(", ");
  const recentLogs = Object.entries(logs).slice(-7).map(([date, data]) => {
    const completed = Object.keys(data).filter(id => data[id]).length;
    return `${date}: ${completed}/${habits.length} habits done`;
  }).join("\n");

  const prompt = `
    Habits: ${habitsList}
    Recent performance data:
    ${recentLogs}
  `;

  try {
    // Fix: Using ai.models.generateContent with both model and prompt, and moving persona to systemInstruction
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class productivity coach. Analyze the user's progress, provide 3 concrete suggestions for improvement, and one high-energy motivational quote. Output must be in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { 
              type: Type.STRING,
              description: "A brief summary of the user's recent progress."
            },
            suggestions: { 
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 actionable tips to improve consistency or productivity."
            },
            motivationalQuote: { 
              type: Type.STRING,
              description: "A high-energy quote to inspire the user."
            }
          },
          required: ["analysis", "suggestions", "motivationalQuote"]
        }
      }
    });

    // Fix: Robust extraction of text from response and parsing as JSON
    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("Empty response from AI");
    }
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini AI error:", error);
    // Fallback response in case of API errors
    return {
      analysis: "You're making steady progress. Consistency is key!",
      suggestions: [
        "Try to complete one small task first thing in the morning.", 
        "Track your energy levels throughout the day.", 
        "Celebrate small wins."
      ],
      motivationalQuote: "The only way to do great work is to love what you do. - Steve Jobs"
    };
  }
};
