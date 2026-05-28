const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const notesRouter = require('./routes/notes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notes', notesRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
