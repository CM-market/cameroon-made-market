// Anthropic API configuration
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Debug helper - only show first 4 and last 4 characters of the API key
const debugApiKey = () => {
  if (!ANTHROPIC_API_KEY) return 'API key is undefined';
  if (ANTHROPIC_API_KEY.length < 10) return 'API key is too short';
  return `${ANTHROPIC_API_KEY.substring(0, 4)}...${ANTHROPIC_API_KEY.substring(ANTHROPIC_API_KEY.length - 4)}`;
};

console.log(`Anthropic API Key format check: ${debugApiKey()}`);
