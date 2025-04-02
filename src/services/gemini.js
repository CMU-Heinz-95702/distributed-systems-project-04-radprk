const axios = require('axios');
const { GEMINI_API_KEY } = require('../config/config');

/**
 * Generate a response using Google's Gemini API
 * @param {string} prompt - The text prompt to send to Gemini
 * @returns {Promise<string>} - The generated text response
 */
async function generateResponse(prompt) {
  try {
    console.log(`Sending prompt to Gemini: ${prompt.substring(0, 100)}...`);
    
    // Using correct Google Gemini API endpoint
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`, 
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more consistent JSON outputs
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024
        }
      }, 
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: GEMINI_API_KEY
        }
      }
    );

    console.log("Gemini API response received");

    // Extract the text from Gemini's response
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0]) {
      
      const resultText = response.data.candidates[0].content.parts[0].text;
      console.log(`Gemini response text (first 100 chars): ${resultText.substring(0, 100)}...`);
      return resultText;
    }
    
    throw new Error("Unexpected response format from Gemini API");
  } catch (error) {
    console.error('Error generating response from Gemini:', error.message);
    if (error.response && error.response.data) {
      console.error('Error response data:', JSON.stringify(error.response.data));
    }
    throw error;
  }
}

module.exports = {
  generateResponse
};