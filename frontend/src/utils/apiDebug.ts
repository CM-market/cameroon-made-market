/**
 * API Debugging Utilities
 * 
 * This file contains helper functions for debugging API issues
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Validates an Anthropic API key format
 * 
 * @param apiKey The API key to validate
 * @returns An object with validation result and message
 */
export function validateAnthropicApiKey(apiKey: string | undefined): { valid: boolean; message: string } {
  if (!apiKey) {
    return { valid: false, message: 'API key is missing' };
  }

  if (!apiKey.startsWith('sk-ant-')) {
    return { 
      valid: false, 
      message: 'API key has incorrect format. Anthropic API keys should start with "sk-ant-"' 
    };
  }

  if (apiKey.length < 30) {
    return { valid: false, message: 'API key appears to be too short' };
  }

  return { valid: true, message: 'API key format appears valid' };
}

/**
 * Tests an Anthropic API key with a simple request
 * 
 * @param apiKey The API key to test
 * @returns Promise resolving to test result
 */
export async function testAnthropicApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message. Please respond with just "OK"'
        }
      ]
    });

    return { 
      success: true, 
      message: `API key is valid. Response received successfully.` 
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';

    return {
      success: false,
      message: `API key test failed: ${errorMessage}`
    };
  }
}
