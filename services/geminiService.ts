
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCharacter, GameIdea, WorldLore, WritingChallenge, ChallengeResult } from "../types";

// Always initialize with an object and use process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are a helpful English teacher for young children (A1-A2 level). 
Your task is to help them write a story using SIMPLE PAST TENSE.
The story must be about a specific animal.

STORY STEPS:
1. Habitat: Where did it live? (e.g., "The lion lived in the forest.")
2. Life: What did it do? (e.g., "He played with friends.")
3. Problem: What happened? (e.g., "One day, he lost his ball.")
4. Help: What did he do? (e.g., "He looked for his ball.")
5. Solution: How was it fixed? (e.g., "He found the ball under a tree.")
6. Ending: How did it end? (e.g., "He was very happy.")

CRITICAL RULES:
- Use only A1-A2 level English. 
- ALWAYS ask for a FULL SENTENCE.
- ALWAYS ask for PAST TENSE (lived, was, went, played).
- DO NOT accept single words (e.g., "Forest" is WRONG).
- Provide feedback in simple English.`;

export const getWritingChallenge = async (level: number, character: string, storyTitle: string): Promise<WritingChallenge> => {
  const storySteps = [
    { type: "Habitat", prompt: "Where did the animal live? Write a full sentence using 'lived' or 'was'." },
    { type: "Daily Life", prompt: "What did the animal do every day? Write a sentence in the past tense." },
    { type: "The Problem", prompt: "Oh no! A problem happened! Write a sentence about the problem in the past." },
    { type: "Action", prompt: "What did the animal do to solve the problem? Write a sentence about the plan." },
    { type: "The Solution", prompt: "Did it work? Write a sentence about how the animal fixed the problem." },
    { type: "The Ending", prompt: "The story is over! Write a final sentence about the animal being happy." }
  ];

  const currentStep = storySteps[(level - 1) % 6];

  const prompt = `Create a challenge for a kid writing a story about a ${character} titled "${storyTitle}".
  PHASE: ${currentStep.type}
  GOAL: ${currentStep.prompt}

  Return JSON with topic, stepDescription, and difficulty.
  IMPORTANT: The stepDescription MUST tell them to use the past tense clearly.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          stepDescription: { type: Type.STRING },
          difficulty: { type: Type.STRING },
        },
        required: ["topic", "stepDescription", "difficulty"]
      }
    }
  });

  // Access the .text property directly, it is not a function
  const text = response.text;
  if (!text) throw new Error("Failed to generate challenge");
  const data = JSON.parse(text.trim());
  return { ...data, exampleSentence: "" } as WritingChallenge;
};

export const validateSentence = async (challenge: WritingChallenge, userSentence: string): Promise<ChallengeResult> => {
  const prompt = `Task: "${challenge.topic}". User Input: "${userSentence}".
  
  VALIDATION RULES:
  1. If input is 1 or 2 words (like "Forest" or "Blue lion"): isCorrect = FALSE. Feedback: "Please write a full sentence!"
  2. If input is NOT in the past tense (no 'was', 'lived', 'found', '-ed'): isCorrect = FALSE. Feedback: "Use past tense (lived, was, etc.)!"
  3. Otherwise: isCorrect = TRUE. Feedback: "Great job! Your story is moving!"

  Return JSON { "isCorrect": boolean, "feedback": "string" }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING },
        },
        required: ["isCorrect", "feedback"]
      }
    }
  });

  // Access .text property directly
  const text = response.text;
  if (!text) throw new Error("Validation failed");
  return JSON.parse(text.trim()) as ChallengeResult;
};

// Use gemini-2.5-flash-image for standard image generation tasks
export const generateIllustration = async (sentence: string, style: string, characterType: string): Promise<string> => {
  const prompt = `Cute cartoon children's book illustration: "${sentence}". Hero: ${characterType}. Style: ${style}. Simple shapes, vibrant colors, magical, no text.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] }
  });

  let base64Image = "";
  // The response might contain both text and image parts; find the inlineData part
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }
  }
  return base64Image ? `data:image/png;base64,${base64Image}` : "";
};

export const generateCoverIllustration = async (title: string, characterType: string): Promise<string> => {
  const prompt = `Stunning children's book cover: "${title}". Hero: ${characterType}. Colorful, magical, professional digital art, no letters or text.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] }
  });

  let base64Image = "";
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }
  }
  return base64Image ? `data:image/png;base64,${base64Image}` : "";
};

// Use gemini-3-pro-preview for complex reasoning tasks and structured data generation
export const generateGameIdea = async (genre: string, theme: string, style: string): Promise<GameIdea> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `JSON game idea with genre: ${genre}, theme: ${theme}, style: ${style}.`,
    config: { 
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          genre: { type: Type.STRING },
          platform: { type: Type.STRING },
          coreLoop: { type: Type.STRING },
          uniqueSellingPoint: { type: Type.STRING },
          storySynopsis: { type: Type.STRING },
        },
        required: ["title", "genre", "platform", "coreLoop", "uniqueSellingPoint", "storySynopsis"]
      }
    }
  });
  return JSON.parse(response.text || "{}") as GameIdea;
};

export const generateCharacterProfile = async (archetype: string, traits: string): Promise<GeneratedCharacter> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `JSON character profile for archetype: ${archetype} and traits: ${traits}.`,
    config: { 
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          backstory: { type: Type.STRING },
          stats: {
            type: Type.OBJECT,
            properties: {
              strength: { type: Type.NUMBER },
              agility: { type: Type.NUMBER },
              intelligence: { type: Type.NUMBER },
              charisma: { type: Type.NUMBER },
            },
            required: ["strength", "agility", "intelligence", "charisma"]
          }
        },
        required: ["name", "role", "backstory", "stats"]
      }
    }
  });
  return JSON.parse(response.text || "{}") as GeneratedCharacter;
};

export const generateWorldLore = async (setting: string, tone: string): Promise<WorldLore> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Upgraded to Pro for complex reasoning and creative generation
    contents: `JSON world lore for setting: ${setting} and tone: ${tone}.`,
    config: { 
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          regionName: { type: Type.STRING },
          climate: { type: Type.STRING },
          factions: { type: Type.ARRAY, items: { type: Type.STRING } },
          history: { type: Type.STRING },
          keyLocations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["regionName", "climate", "factions", "history", "keyLocations"]
      }
    }
  });
  return JSON.parse(response.text || "{}") as WorldLore;
};
export const generateCharacterImage = generateIllustration;
