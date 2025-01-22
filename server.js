'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { expect } = require('chai');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.js');
const testingRoutes = require('./routes/fcctesting.js');
const testRunner = require('./test-runner');

const app = express();

// Serve static files from the "public" directory
app.use('/public', express.static(`${process.cwd()}/public`));

// Enable CORS for all origins
app.use(cors({ origin: '*' }));

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route for the sample front-end
app.route('/:testProject/')
  .get((req, res) => {
    res.sendFile(`${process.cwd()}/views/issue.html`);
  });

// Route for the index page
app.route('/')
  .get((req, res) => {
    res.sendFile(`${process.cwd()}/views/index.html`);
  });

// Routes for FCC testing
testingRoutes(app);

// API routes
apiRoutes(app);

// Middleware for handling 404 errors
app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

// Start the server and run tests if in test environment
const port = process.env.PORT || 3000;
const listener = app.listen(port, () => {
  console.log(`Server is running on port ${listener.address().port}`);
  
  if (process.env.NODE_ENV === 'test') {
    console.log('Running tests...');
    setTimeout(() => {
      try {
        testRunner.run();
      } catch (error) {
        console.error('Tests failed to execute:', error);
      }
    }, 3500);
  }
});

module.exports = app;
