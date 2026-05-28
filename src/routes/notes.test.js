const request = require('supertest');
const express = require('express');

jest.mock('../controllers/notesController');
const notesController = require('../controllers/notesController');
const notesRouter = require('./notes');

describe('Notes Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/notes', notesRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Happy path tests
  test('GET /notes returns list of notes', async () => {
    notesController.listNotes.mockImplementation((req, res) =>
      res.status(200).json([{ id: '1', title: 'Note 1' }])
    );
    const res = await request(app).get('/notes');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: '1', title: 'Note 1' }]);
    expect(notesController.listNotes).toHaveBeenCalled();
  });

  test('GET /notes/:id returns a note by valid UUID', async () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';
    notesController.getNote.mockImplementation((req, res) =>
      res.status(200).json({ id: validId, title: 'Test Note' })
    );
    const res = await request(app).get(`/notes/${validId}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: validId, title: 'Test Note' });
    expect(notesController.getNote).toHaveBeenCalled();
  });

  test('POST /notes creates a new note', async () => {
    const newNote = { title: 'New Note', content: 'Some content' };
    notesController.createNote.mockImplementation((req, res) =>
      res.status(201).json({ id: 'new-id', ...req.body })
    );
    const res = await request(app).post('/notes').send(newNote);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Note');
    expect(notesController.createNote).toHaveBeenCalled();
  });

  test('PUT /notes/:id updates a note', async () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';
    const update = { title: 'Updated', content: 'Updated content' };
    notesController.updateNote.mockImplementation((req, res) =>
      res.status(200).json({ id: validId, ...req.body })
    );
    const res = await request(app).put(`/notes/${validId}`).send(update);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ title: 'Updated' }));
    expect(notesController.updateNote).toHaveBeenCalled();
  });

  test('DELETE /notes/:id deletes a note', async () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';
    notesController.deleteNote.mockImplementation((req, res) =>
      res.status(204).send()
    );
    const res = await request(app).delete(`/notes/${validId}`);
    expect(res.status).toBe(204);
    expect(notesController.deleteNote).toHaveBeenCalled();
  });

  // Error path: validation errors simulated via controller mock
  test('returns 400 for invalid input (controller validation)', async () => {
    // Invalid UUID
    notesController.getNote.mockImplementation((req, res) =>
      res.status(400).json({ errors: [{ msg: 'Invalid note ID' }] })
    );
    const resInvalidId = await request(app).get('/notes/invalid-uuid');
    expect(resInvalidId.status).toBe(400);
    expect(resInvalidId.body).toHaveProperty('errors');

    // Missing title in POST
    notesController.createNote.mockImplementation((req, res) =>
      res.status(400).json({ errors: [{ msg: 'Title is required' }] })
    );
    const resMissingTitle = await request(app)
      .post('/notes')
      .send({ content: 'No title here' });
    expect(resMissingTitle.status).toBe(400);

    // Missing content in POST
    notesController.createNote.mockImplementation((req, res) =>
      res.status(400).json({ errors: [{ msg: 'Content is required' }] })
    );
    const resMissingContent = await request(app)
      .post('/notes')
      .send({ title: 'No content' });
    expect(resMissingContent.status).toBe(400);
  });
});