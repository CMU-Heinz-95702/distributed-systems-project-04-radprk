const express = require('express');
const bodyParser = require('body-parser');
const { handleUserQuery ,handleUserQueryWithGemini } = require('./services/nlp');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/find-wisdom', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await handleUserQueryWithGemini(query);  // Changed from handleUserQuery
    res.json(result);
  } catch (error) {
    console.error('Error handling user query:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});