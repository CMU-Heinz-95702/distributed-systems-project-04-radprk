const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  GITA_API_BASE_URL: 'https://bhagavadgita.io/api/v1',
  GITA_API_KEY: process.env.GITA_API_KEY,
  MONGODB_URI: process.env.MONGODB_URI,
  DB_NAME: process.env.DB_NAME || 'gitaWisdomDB',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY // Add this line
};