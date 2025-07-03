import axios from 'axios';

// List of objects that are prohibited in the marketplace
const prohibited_items: string[] = [
    "gun", "rifle", "pistol", "firearm", "weapon", 
    "drugs", "cocaine", "heroin", "marijuana", "cannabis", 
    "illegal substances", "counterfeit", "fake currency", 
    "explosives", "bomb", "human organs", "endangered species",
    "stolen goods", "pornography", "alcohol", "tobacco"
];

// OpenAI API configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

interface AnalysisResult {
    approved: boolean;
    message: string;
    detectedObjects: string[];
}

/**
 * Analyzes an image using OpenAI's GPT-4o Vision API
 * @param imageDataUrl - The data URL of the image to analyze
 * @returns Analysis result with approval status, message, and detected objects
 */
export async function analyzeImage(imageDataUrl: string): Promise<AnalysisResult> {
    try {
        if (!OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.');
        }

        // Prepare the request to OpenAI API
        const response = await axios.post<OpenAIResponse>(
            OPENAI_API_URL,
            {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Analyze this image and identify all objects in it, paying special attention to potentially prohibited items like weapons, drugs, illegal substances, counterfeit goods, explosives, etc. Return the result as a JSON object with the following structure: {"detectedObjects": ["object1", "object2", ...], "description": "brief description of the image"}. Only include the JSON in your response, no other text.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageDataUrl
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 300
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            }
        );

        // Parse the response
        const content = response.data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content in the API response');
        }

        // Extract the JSON from the response
        const jsonMatch = content.match(/\{.*\}/s);
        if (!jsonMatch) {
            throw new Error('Could not extract JSON from the API response');
        }

        const result = JSON.parse(jsonMatch[0]);
        const detectedObjects = result.detectedObjects || [];

        // Check if any of the detected objects are in the prohibited_items list
        const matchedProhibitedItem = detectedObjects.find(
            (obj: string) => prohibited_items.map(item => item.toLowerCase()).includes(obj.toLowerCase())
        );

        const isApproved = !matchedProhibitedItem;
        const objectName = matchedProhibitedItem || 'prohibited item';

        return {
            approved: isApproved,
            message: isApproved
                ? `Image approved: no prohibited items detected`
                : `Image rejected: contains prohibited item "${objectName}"`,
            detectedObjects: detectedObjects.map((obj: string) => `${obj} (detected)`)
        };
    } catch (error) {
        console.error('Error in image analysis:', error);
        if (error instanceof Error) {
            throw new Error(`Error analyzing image: ${error.message}`);
        } else {
            throw new Error(`Error analyzing image: ${String(error)}`);
        }
    }
}