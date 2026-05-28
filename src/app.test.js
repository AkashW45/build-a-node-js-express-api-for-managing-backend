const request = require('supertest');

// Mocks must be set up before requiring the app
jest.mock('./routes/notes', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.status(200).json({ notes: [] }));
  router.get('/error', (req, res, next) => next(new Error('test error')));
  return router;
});

jest.mock('./middleware/errorHandler', () => {
  return (err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  };
});

const app = require('./app');

describe('App', () => {
  describe('GET /health', () => {
    it('should return 200 and status ok', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/notes', () => {
    it('should return 200 and notes array', async () => {
      const response = await request(app).get('/api/notes');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ notes: [] });
    });
  });

  describe('Error handling', () => {
    it('should respond with 500 on route error', async () => {
      const response = await request(app).get('/api/notes/error');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'test error' });
    });
  });

  describe('Unknown route', () => {
    it('should return 404 for non-existent path', async () => {
      const response = await request(app).get('/non-existent');
      expect(response.status).toBe(404);
    });
  });
});