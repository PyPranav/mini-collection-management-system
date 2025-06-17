require('dotenv').config();
const express = require('express');
cors = require('cors');

const app = express();
const port = 5000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Welcome to the Elasticsearch API',
    version: '1.0.0'
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app; // Export the app for testing purposes