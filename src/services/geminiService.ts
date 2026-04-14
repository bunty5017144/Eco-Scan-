import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeWaste(itemDescription: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an environmental expert. Analyze the following item and determine if it is Recyclable, Compostable, or Trash. 
    Item: ${itemDescription}. 
    Provide:
    1. Category (Recyclable/Compostable/Trash)
    2. Specific disposal instructions.
    3. An interesting eco-fact about this material.
    Format the response in clean Markdown.`,
  });

  const response = await model;
  return response.text;
}

export async function generateEcoComposeCode(screenName: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate Jetpack Compose code for an Android screen named "${screenName}" for an eco-friendly recycling app. 
    The UI should be modern, use Material 3 components, and include placeholders for camera or list functionality.`,
  });

  const response = await model;
  return response.text;
}
