// src/services/gita-api.js
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const GITA_API_BASE_URL = 'https://bhagavadgita.io/api/v1';
const GITA_API_KEY = process.env.GITA_API_KEY;

// Cache for verses to reduce API calls
const verseCache = new Map();

// Sample verse data for development and fallback
const sampleVerses = {
  '2.47': {
    chapter: 2,
    verse: 47,
    text: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.",
    meaning: "Focus on doing your duty without attachment to results. This is the essence of karma yoga - selfless action."
  },
  '2.14': {
    chapter: 2,
    verse: 14,
    text: "O son of Kunti, the nonpermanent appearance of happiness and distress, and their disappearance in due course, are like the appearance and disappearance of winter and summer seasons. They arise from sense perception, O scion of Bharata, and one must learn to tolerate them without being disturbed.",
    meaning: "The temporary experiences of pleasure and pain are like changing seasons. One should learn to tolerate them with equanimity."
  },
  '2.62': {
    chapter: 2,
    verse: 62,
    text: "While contemplating the objects of the senses, a person develops attachment for them, and from such attachment lust develops, and from lust anger arises.",
    meaning: "Attachment to sense objects leads to desire, and when desire is unfulfilled, anger arises."
  },
  '2.63': {
    chapter: 2,
    verse: 63,
    text: "From anger, delusion arises, and from delusion bewilderment of memory. When memory is bewildered, intelligence is lost, and when intelligence is lost, one falls down again into the material pool.",
    meaning: "Anger leads to delusion, which disturbs memory and intelligence, resulting in spiritual downfall."
  },
  '2.48': {
    chapter: 2,
    verse: 48,
    text: "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called yoga.",
    meaning: "True yoga is performing action with equanimity, free from concern for success or failure."
  },
  '2.66': {
    chapter: 2,
    verse: 66,
    text: "One who is not in transcendental consciousness can have neither a controlled mind nor steady intelligence, without which there is no possibility of peace. And how can there be any happiness without peace?",
    meaning: "Without spiritual consciousness, there can be no mental control, steady intelligence, or peace, and without peace, there can be no happiness."
  },
  '3.35': {
    chapter: 3,
    verse: 35,
    text: "It is far better to perform one's natural prescribed duty, though tinged with faults, than to perform another's prescribed duty, though perfectly. In fact, it is preferable to die in the discharge of one's duty, than to follow the path of another, which is fraught with danger.",
    meaning: "It's better to perform your own duty imperfectly than someone else's duty perfectly. Following your natural calling, even with difficulties, is safer than imitating others."
  },
  '6.5': {
    chapter: 6,
    verse: 5,
    text: "One must deliver himself with the help of his mind, and not degrade himself. The mind is the friend of the conditioned soul, and his enemy as well.",
    meaning: "Your mind can be either your best friend or your worst enemy. It's up to you to use it for your elevation rather than degradation."
  },
  '6.6': {
    chapter: 6,
    verse: 6,
    text: "For him who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his mind will remain the greatest enemy.",
    meaning: "When you master your mind, it becomes your ally. If you fail to control it, it remains your worst adversary."
  },
  '6.7': {
    chapter: 6,
    verse: 7,
    text: "For one who has conquered the mind, the Supersoul is already reached, for he has attained tranquility. To such a man happiness and distress, heat and cold, honor and dishonor are all the same.",
    meaning: "One who has mastered the mind finds the divine within and remains peaceful amidst all dualities like joy and sorrow, heat and cold."
  }
};

/**
 * Fetch a specific verse by chapter and verse number
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<Object>} - Verse object
 */
async function fetchVerse(chapter, verse) {
  const verseKey = `${chapter}.${verse}`;
  
  // Check cache first
  if (verseCache.has(verseKey)) {
    return verseCache.get(verseKey);
  }
  
  // For development, return from sample if available
  if (process.env.NODE_ENV === 'development' && sampleVerses[verseKey]) {
    const verseData = {
      verseKey,
      ...sampleVerses[verseKey]
    };
    verseCache.set(verseKey, verseData);
    return verseData;
  }
  
  try {
    // In production, fetch from API
    const response = await axios.get(
      `${GITA_API_BASE_URL}/chapters/${chapter}/verses/${verse}`, 
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${GITA_API_KEY}`
        }
      }
    );
    
    // Format the response based on the API structure
    // This will need to be adapted to match the actual API response
    const verseData = {
      verseKey,
      chapter: response.data.chapter_number,
      verse: response.data.verse_number,
      text: response.data.text,
      meaning: response.data.meaning || response.data.translation || ''
    };
    
    // Cache the result
    verseCache.set(verseKey, verseData);
    return verseData;
  } catch (error) {
    console.error(`Error fetching verse ${chapter}.${verse} from API:`, error);
    
    // Fallback to sample verse if available
    if (sampleVerses[verseKey]) {
      return {
        verseKey,
        ...sampleVerses[verseKey]
      };
    }
    
    // Ultimate fallback
    return {
      verseKey,
      chapter,
      verse,
      text: `Verse ${chapter}.${verse} from the Bhagavad Gita`,
      meaning: "Meaning unavailable"
    };
  }
}

/**
 * Fetch multiple verses by their references
 * @param {Array<string>} verseRefs - Array of verse references like ["2.47", "3.35"]
 * @returns {Promise<Array<Object>>} - Array of verse objects
 */
async function fetchVersesByRefs(verseRefs) {
  const promises = verseRefs.map(ref => {
    const [chapter, verse] = ref.split('.');
    return fetchVerse(parseInt(chapter), parseInt(verse));
  });
  
  return Promise.all(promises);
}

/**
 * Fetch verses by chapter
 * @param {number} chapter - Chapter number
 * @returns {Promise<Array<Object>>} - Array of verse objects
 */
async function fetchVersesByChapter(chapter) {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Filter sample verses by chapter
      const chapterVerses = Object.entries(sampleVerses)
        .filter(([key, verse]) => verse.chapter === chapter)
        .map(([key, verse]) => ({
          verseKey: key,
          ...verse
        }));
      
      return chapterVerses;
    }
    
    // In production, fetch from API
    const response = await axios.get(
      `${GITA_API_BASE_URL}/chapters/${chapter}/verses`, 
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${GITA_API_KEY}`
        }
      }
    );
    
    // Format the response based on the API structure
    return response.data.map(verseData => ({
      verseKey: `${verseData.chapter_number}.${verseData.verse_number}`,
      chapter: verseData.chapter_number,
      verse: verseData.verse_number,
      text: verseData.text,
      meaning: verseData.meaning || verseData.translation || ''
    }));
  } catch (error) {
    console.error(`Error fetching verses for chapter ${chapter}:`, error);
    
    // Fallback to sample verses
    const chapterVerses = Object.entries(sampleVerses)
      .filter(([key, verse]) => verse.chapter === chapter)
      .map(([key, verse]) => ({
        verseKey: key,
        ...verse
      }));
    
    return chapterVerses;
  }
}

/**
 * Search verses by keywords
 * @param {string} query - Search query
 * @returns {Promise<Array<Object>>} - Array of matching verse objects
 */
async function searchVerses(query) {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Simple keyword search in sample verses
      const matchingVerses = Object.entries(sampleVerses)
        .filter(([key, verse]) => {
          const lowerQuery = query.toLowerCase();
          return verse.text.toLowerCase().includes(lowerQuery) ||
                 verse.meaning.toLowerCase().includes(lowerQuery);
        })
        .map(([key, verse]) => ({
          verseKey: key,
          ...verse
        }));
      
      return matchingVerses;
    }
    
    // In production, use API search if available
    const response = await axios.get(
      `${GITA_API_BASE_URL}/search`, 
      {
        params: { query },
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${GITA_API_KEY}`
        }
      }
    );
    
    // Format the response based on the API structure
    return response.data.map(verseData => ({
      verseKey: `${verseData.chapter_number}.${verseData.verse_number}`,
      chapter: verseData.chapter_number,
      verse: verseData.verse_number,
      text: verseData.text,
      meaning: verseData.meaning || verseData.translation || ''
    }));
  } catch (error) {
    console.error(`Error searching verses with query "${query}":`, error);
    
    // Fallback to simple keyword search in sample verses
    const matchingVerses = Object.entries(sampleVerses)
      .filter(([key, verse]) => {
        const lowerQuery = query.toLowerCase();
        return verse.text.toLowerCase().includes(lowerQuery) ||
               verse.meaning.toLowerCase().includes(lowerQuery);
      })
      .map(([key, verse]) => ({
        verseKey: key,
        ...verse
      }));
    
    return matchingVerses;
  }
}

/**
 * Get all sample verses (for development)
 * @returns {Array<Object>} - Array of verse objects
 */
function getAllSampleVerses() {
  return Object.entries(sampleVerses).map(([key, verse]) => ({
    verseKey: key,
    ...verse
  }));
}

// Add this function to your gita-api.js file

/**
 * Fetch all available verses from the Bhagavad Gita API
 * @returns {Promise<Array<Object>>} - Array of verse objects
 */
async function fetchVerses() {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Return all sample verses in development mode
      return getAllSampleVerses();
    }
    
    // In production, fetch from API
    const chapters = await fetchChapters();
    let allVerses = [];
    
    for (const chapter of chapters) {
      const chapterVerses = await fetchVersesByChapter(chapter.chapter_number);
      allVerses = [...allVerses, ...chapterVerses];
    }
    
    return allVerses;
  } catch (error) {
    console.error('Error fetching all verses:', error);
    // Fallback to sample verses
    return getAllSampleVerses();
  }
}

/**
 * Fetch all chapters metadata
 * @returns {Promise<Array<Object>>} - Array of chapter objects
 */
async function fetchChapters() {
  try {
    const response = await axios.get(
      `${GITA_API_BASE_URL}/chapters`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${GITA_API_KEY}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching chapters:', error);
    // Return a basic array of 18 chapters (Bhagavad Gita has 18 chapters)
    return Array.from({ length: 18 }, (_, i) => ({ 
      chapter_number: i + 1, 
      name: `Chapter ${i + 1}` 
    }));
  }
}

// Add this to the module.exports
module.exports = {
  fetchVerse,
  fetchVersesByRefs,
  fetchVersesByChapter,
  searchVerses,
  getAllSampleVerses,
  sampleVerses,
  fetchVerses,
  fetchChapters
};

