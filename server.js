const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Use Railway's PORT or default to 4173
const port = process.env.PORT || 4173;

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 App available at http://0.0.0.0:${port}`);
});

module.exports = app;