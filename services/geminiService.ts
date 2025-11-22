import { GoogleGenAI, Type } from "@google/genai";
import { GemeniSystemResponse } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client safely
const getClient = () => {
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSystemFromGoal = async (goal: string): Promise<GemeniSystemResponse | null> => {
  const ai = getClient();
  if (!ai) return null;

  const prompt = `
    You are an expert in habit formation and behavioral psychology, following the principles of BJ Fogg (Tiny Habits), James Clear (Atomic Habits), and Peter Gollwitzer (Implementation Intentions).
    
    The user has a goal: "${goal}".
    
    Create a "System" for this goal. 
    Rules:
    1. Micro-action: Must be < 2 minutes or extremely small (e.g., "put on shoes" not "run 5 miles").
    2. Cue: Must use "After I [existing habit], I will..." format.
    3. Environment: A specific change to the physical space to reduce friction.
    4. Reward: An immediate tiny celebration.
    
    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            microAction: { type: Type.STRING, description: "The tiny, <2 min behavior to start with." },
            cue: { type: Type.STRING, description: "The specific implementation intention trigger." },
            environment: { type: Type.STRING, description: "How to prep the space." },
            reward: { type: Type.STRING, description: "The immediate tiny celebration." },
            advice: { type: Type.STRING, description: "One sentence of expert advice based on the specific goal." }
          },
          required: ["microAction", "cue", "environment", "reward", "advice"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GemeniSystemResponse;
    }
    return null;
  } catch (error) {
    console.error("Gemini generation error:", error);
    return null;
  }
};