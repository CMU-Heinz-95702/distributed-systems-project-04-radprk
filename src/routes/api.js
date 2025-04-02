// src/routes/api.js
const express = require('express');
const router = express.Router();
const { COLLECTIONS } = require('../config/db');
const gitaApiService = require('../services/gita-api');
const nlpService = require('../services/nlp');

// Get all verses
router.get('/verses', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const verses = await db.collection(COLLECTIONS.VERSES).find().toArray();
   
    if (verses.length === 0) {
      // If no verses in database, fetch from Gita API
      const apiVerses = await gitaApiService.fetchVerses();
      return res.json({ verses: apiVerses });
    }
   
    return res.json({ verses });
  } catch (error) {
    console.error('Error fetching verses:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Find wisdom based on user query
router.post('/find-wisdom', async (req, res) => {
  try {
    const { query } = req.body;
   
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
   
    const db = req.app.locals.db;
   
    // Save user query
    await db.collection(COLLECTIONS.USER_QUERIES).insertOne({
      query,
      timestamp: new Date()
    });
   
    // Use Gemini-powered NLP service to find relevant verse
    const recommendation = await nlpService.handleUserQueryWithGemini(query);
   
    // Save recommendation
    await db.collection(COLLECTIONS.RECOMMENDATIONS).insertOne({
      query,
      chapter: recommendation.chapter,
      verse: recommendation.verse,
      timestamp: new Date()
    });
   
    return res.json(recommendation);
  } catch (error) {
    console.error('Error finding wisdom:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'There was an issue analyzing your query. Please try again with a different question.'
    });
  }
});

// Get user history
router.get('/user-history', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const history = await db.collection(COLLECTIONS.USER_QUERIES)
      .find()
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
   
    return res.json({ history });
  } catch (error) {
    console.error('Error fetching user history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Search verses by text
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await gitaApiService.searchVerses(query);
    return res.json({ results });
  } catch (error) {
    console.error('Error searching verses:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;