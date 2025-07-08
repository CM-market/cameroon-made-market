import Anthropic from '@anthropic-ai/sdk';

// List of objects that are prohibited in the marketplace
const prohibited_items: string[] = [
    "gun", "rifle", "pistol", "firearm", "weapon",
    "drugs", "cocaine", "heroin", "marijuana", "cannabis",
    "illegal substances", "counterfeit", "fake currency",
    "explosives", "bomb", "human organs", "endangered species",
    "stolen goods", "pornography", "alcohol", "tobacco"
];

// Anthropic API configuration
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

interface AnalysisResult {
    approved: boolean;
    message: string;
    detectedObjects: string[];
    category?: string;
    description?: string;
    tags?: string[];
}

/**
 * Analyzes an image using Anthropic's Claude Vision API
 * @param imageDataUrl - The data URL of the image to analyze
 * @returns Analysis result with approval status, message, and detected objects
 */
export async function analyzeImage(imageDataUrl: string): Promise<AnalysisResult> {
    try {
        if (!ANTHROPIC_API_KEY) {
            throw new Error('Anthropic API key is not configured. Please set VITE_ANTHROPIC_API_KEY in your environment variables.');
        }

        // Extract base64 data and media type from data URL
        const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Invalid image data URL format');
        }

        const mediaType = matches[1];
        const base64Data = matches[2];

        console.log('Making request to Anthropic API...');

        // Initialize Anthropic client
        const anthropic = new Anthropic({
            apiKey: ANTHROPIC_API_KEY,
            dangerouslyAllowBrowser: true,
        });

        // Make the request using Anthropic SDK
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 300,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                                data: base64Data
                            }
                        },
                        {
                            type: 'text',
                            text: 'Analyze this image and identify all objects in it, paying special attention to potentially prohibited items like weapons, drugs, illegal substances, counterfeit goods, explosives, etc. If the image contains a product that could be sold in a marketplace, also provide a product category, description (maximum 70 characters), and relevant tags. Return the result as a JSON object with the following structure: {"detectedObjects": ["object1", "object2", ...], "description": "brief description of the image", "productCategory": "category if this is a sellable product", "productDescription": "detailed product description for marketplace listing (maximum 70 characters)", "productTags": ["tag1", "tag2", "tag3"]}. Only include the JSON in your response, no other text.'
                        }
                    ]
                }
            ]
        });

        // Parse the response
        const content = response.content[0];
        if (!content || content.type !== 'text') {
            throw new Error('No text content in the API response');
        }

        // Extract the JSON from the response
        const jsonMatch = content.text.match(/\{.*\}/s);
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

        // For approved products, extract category and description
        const analysisResult: AnalysisResult = {
            approved: isApproved,
            message: isApproved
                ? `Image approved: no prohibited items detected`
                : `Image rejected: contains prohibited item "${objectName}"`,
            detectedObjects: detectedObjects.map((obj: string) => `${obj} (detected)`)
        };

        // Add product categorization, description, and tags for approved images
        if (isApproved && result.productCategory && result.productDescription) {
            analysisResult.category = result.productCategory;
            // Ensure description is limited to 70 characters
            analysisResult.description = result.productDescription.length > 70 
                ? result.productDescription.substring(0, 70).trim() 
                : result.productDescription;
            // Add tags if available
            if (result.productTags && Array.isArray(result.productTags)) {
                analysisResult.tags = result.productTags;
            }
        }

        return analysisResult;
    } catch (error) {
        console.error('Error in image analysis:', error);
        if (error instanceof Error) {
            throw new Error(`Error analyzing image: ${error.message}`);
        } else {
            throw new Error(`Error analyzing image: ${String(error)}`);
        }
    }
}
