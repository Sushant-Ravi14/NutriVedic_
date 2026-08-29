import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRightsNavigatorPrompt } from "../prompts/rightsNavigatorSystemPrompt.js";
import { getRtiDraftingPrompt } from "../prompts/rtiExtractionSystemPrompt.js";
import { DISCLAIMER_TEXT } from "../constants/disclaimer.js";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateChatResponse = async (message, category, history = []) => {
  try {
    const systemInstruction = getRightsNavigatorPrompt(category);
    
    // We append the system instruction context to the message to ensure strict JSON output.
    const prompt = `${systemInstruction}\n\nUser Message: ${message}\n\nPlease respond STRICTLY with JSON matching the schema above.`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // Strip markdown JSON wrapping if present
    if (responseText.startsWith('\`\`\`json')) {
      responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (responseText.startsWith('\`\`\`')) {
      responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    try {
      const parsedResponse = JSON.parse(responseText);
      // Ensure required keys exist
      return {
        explanation: parsedResponse.explanation || "No explanation provided by AI.",
        actionSteps: Array.isArray(parsedResponse.actionSteps) ? parsedResponse.actionSteps : [],
        recommendedAuthority: parsedResponse.recommendedAuthority || "Consult local authorities.",
        disclaimer: DISCLAIMER_TEXT
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError, "Raw:", responseText);
      // Fallback response shape
      return {
        explanation: "I was unable to process your request correctly. Please try again or rephrase your question.",
        actionSteps: ["Retry the request."],
        recommendedAuthority: "N/A",
        disclaimer: DISCLAIMER_TEXT
      };
    }
  } catch (error) {
    console.error("Gemini API Error (Chat):", error);
    return {
      explanation: "There was an error communicating with the AI service. Please try again later.",
      actionSteps: ["Check your network connection.", "Try again in a few moments."],
      recommendedAuthority: "N/A",
      disclaimer: DISCLAIMER_TEXT
    };
  }
};

export const generateRtiDraft = async (plainQuestion, knownDepartment) => {
  try {
    const systemInstruction = getRtiDraftingPrompt(knownDepartment);
    const prompt = `${systemInstruction}\n\nUser Question: ${plainQuestion}\n\nPlease respond STRICTLY with JSON matching the schema above.`;
    
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    if (responseText.startsWith('\`\`\`json')) {
      responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (responseText.startsWith('\`\`\`')) {
      responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    try {
      const parsedResponse = JSON.parse(responseText);
      return {
        formalQuestion: parsedResponse.formalQuestion || plainQuestion,
        suggestedDepartment: parsedResponse.suggestedDepartment || knownDepartment || "Relevant Government Department",
        suggestedPIOAddress: parsedResponse.suggestedPIOAddress || "Public Information Officer"
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini RTI response:", parseError, "Raw:", responseText);
      return {
        formalQuestion: plainQuestion,
        suggestedDepartment: knownDepartment || "Relevant Government Department",
        suggestedPIOAddress: "Public Information Officer"
      };
    }
  } catch (error) {
    console.error("Gemini API Error (RTI):", error);
    throw new Error("Failed to generate RTI draft.");
  }
};
