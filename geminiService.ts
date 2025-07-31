
import { GoogleGenAI, Type } from "@google/genai";
import type { Summary, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const summarySchema = {
    type: Type.OBJECT,
    properties: {
        tldr: {
            type: Type.STRING,
            description: "A very short, one or two sentence summary of the entire document."
        },
        bullets: {
            type: Type.ARRAY,
            items: { 
                type: Type.STRING,
                description: "A key point or finding from the document."
            },
            description: "A bulleted list of the most important points, findings, or takeaways from the document. Maximum 5-7 points."
        },
        entities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The named entity (e.g., person, organization, location, date)." },
                    type: { type: Type.STRING, description: "The type of the entity (e.g., PERSON, ORG, LOC, DATE)." },
                    context: { type: Type.STRING, description: "A brief sentence from the text showing the context where the entity was found."}
                },
                required: ["name", "type", "context"]
            },
            description: "A list of key named entities found in the document."
        }
    },
    required: ["tldr", "bullets", "entities"]
};

export const generateSummary = async (documentText: string): Promise<Summary> => {
    const prompt = `Please analyze the following document and provide a structured summary. Extract the key information as requested in the JSON schema.

Document:
---
${documentText}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: summarySchema,
            }
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        // Basic validation
        if (!parsedJson.tldr || !Array.isArray(parsedJson.bullets) || !Array.isArray(parsedJson.entities)) {
            throw new Error("Invalid summary format received from API.");
        }

        return parsedJson as Summary;
    } catch (error) {
        console.error("Error in generateSummary:", error);
        throw new Error("Failed to generate summary from the document.");
    }
};

export async function* answerQuestionStream(
    documentText: string,
    question: string,
    chatHistory: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
    
    // The Gemini API expects a specific chat history format.
    const historyForApi = chatHistory.map(message => ({
        role: message.role,
        parts: [{ text: message.content }],
    }));

    // Combine history with the new question
    const contents = [
        ...historyForApi,
        { role: 'user', parts: [{ text: question }] }
    ];

    try {
        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: contents, // The full conversation history plus the new question
            config: {
                 systemInstruction: `You are an expert Q&A assistant. Your task is to answer questions based *only* on the content of a document provided by the user. Do not use any external knowledge. If the information to answer a question is not present in the document, you must state that you cannot find the answer in the provided text. Be concise and helpful.

The document content is as follows:
---
${documentText}
---`
            }
        });

        for await (const chunk of responseStream) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Error in answerQuestionStream:", error);
        throw new Error("Failed to get a streaming answer from the AI assistant.");
    }
}
