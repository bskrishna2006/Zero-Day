const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API with your API key
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA8Y_wvx6nDNK_OPZDfJfZjP4MJPpUJkF8';
console.log('Using Gemini API with key starting with:', API_KEY.substring(0, 6) + '...');
const genAI = new GoogleGenerativeAI(API_KEY);

// Default model configuration
const defaultModelName = 'gemini-1.5-pro'; // Using the most capable model

// You can adjust these parameters based on your requirements
const defaultGenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

// Custom safety settings (optional)
const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

// System prompt to define the bot's behavior and context
const getCampusAssistantSystemPrompt = (userName) => {
  return `You are CampusBot, a helpful AI assistant for the CampusLink platform. Your purpose is to help ${userName} with campus-related information, navigation through the platform, and to answer questions about the university experience.

Key information about CampusLink:
1. CampusLink is a platform for university students and administrators
2. It has features for lost & found items, announcements, complaints, and skill exchange
3. Students can connect with peer teachers through the platform
4. The platform includes a timetable feature

As CampusBot, you should:
- Be friendly, helpful, and concise in your responses
- Provide accurate information about campus resources and the platform features
- Help students navigate the platform and understand its functionality
- Offer guidance on common student issues
- Maintain a positive and supportive tone

If you don't know the answer to a specific question about the university, acknowledge this limitation and suggest where the student might find that information.

The current date is ${new Date().toLocaleDateString()}.
`;
};

/**
 * Generate a response using Gemini
 * @param {string} userInput - The user's message
 * @param {string} userName - The user's name for personalization
 * @param {Array} history - Previous conversation messages in the format [{role: 'user'|'model', content: string}]
 * @returns {Promise<string>} - Gemini's response
 */
const generateResponse = async (userInput, userName = 'student', history = []) => {
  try {
    console.log('Generating response with:');
    console.log('- User input:', userInput);
    console.log('- User name:', userName);
    console.log('- History length:', history.length);
    
    // Get the model - use simpler configuration
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
    });
    
    // Create a basic prompt with system context and user query
    const systemPrompt = getCampusAssistantSystemPrompt(userName);
    
    // Simplified approach - just use a single message with context
    const prompt = `
${systemPrompt}

User query: ${userInput}
    `;
    
    console.log('- Prompt created, sending to Gemini API...');
    
    // Generate content with simple prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('- Response received from Gemini API');
    
    return response.text();
  } catch (error) {
    console.error('Error generating response from Gemini:', error);
    // Provide a more helpful error message
    if (error.toString().includes('API key')) {
      console.error('API KEY ISSUE: Check that your Gemini API key is valid and has proper permissions');
      return 'I apologize, but there seems to be an issue with my configuration. Please contact the administrator to check the Gemini API key.';
    } else {
      return 'Sorry, I encountered an error while processing your request. Please try again later.';
    }
  }
};

module.exports = {
  generateResponse
};
