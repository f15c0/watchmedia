import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateContent(prompt: string): Promise<string> {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

export async function analyzeSentiment(text: string): Promise<{ sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"; score: number }> {
  const prompt = `Analyze the sentiment of the following text. Respond ONLY with a JSON object like: {"sentiment": "POSITIVE"|"NEGATIVE"|"NEUTRAL", "score": <number between -1 and 1>}

Text: "${text}"`;

  const result = await geminiModel.generateContent(prompt);
  const raw = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(raw);
}
