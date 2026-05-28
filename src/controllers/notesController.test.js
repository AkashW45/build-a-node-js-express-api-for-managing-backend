const { listNotes, getNote, createNote, updateNote, deleteNote } = require('./notesController');
const Note = require('../models/Note');
const { validationResult } = require('express-validator');

jest.mock('../models/Note');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

describe('notesController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      end: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('listNotes returns notes and handles optional archived filter', async () => {
    const mockNotes = [{ id: 1, title: 'Test', archived: false }];
    Note.findAll.mockResolvedValue(mockNotes);

    // No filter
    req.query = {};
    await listNotes(req, res, next);
    expect(Note.findAll).toHaveBeenCalledWith({ where: {}, order: [['updated_at', 'DESC']] });
    expect(res.json).toHaveBeenCalledWith(mockNotes);

    // With archived filter
    jest.clearAllMocks();
    Note.findAll.mockResolvedValue([mockNotes[0]]);
    req.query = { archived: 'true' };
    await listNotes(req, res, next);
    expect(Note.findAll).toHaveBeenCalledWith({ where: { archived: true }, order: [['updated_at', 'DESC']] });
    expect(res.json).toHaveBeenCalledWith([mockNotes[0]]);
  });

  test('listNotes calls next on error', async () => {
    const error = new Error('DB error');
    Note.findAll.mockRejectedValue(error);
    await listNotes(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('getNote returns note or 404', async () => {
    const mockNote = { id: 1, title: 'Note' };

    // Found
    Note.findByPk.mockResolvedValue(mockNote);
    req.params.id = 1;
    await getNote(req, res, next);
    expect(Note.findByPk).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(mockNote);

    // Not found
    jest.clearAllMocks();
    Note.findByPk.mockResolvedValue(null);
    req.params.id = 999;
    await getNote(req, res, next);
    expect(Note.findByPk).toHaveBeenCalledWith(999);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
  });

  test('createNote handles validation and creation', async () => {
    // Successful creation
    validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
    const mockNote = { id: 2, title: 'New', content: 'Body' };
    Note.create.mockResolvedValue(mockNote);
    req.body = { title: 'New', content: 'Body' };

    await createNote(req, res, next);
    expect(Note.create).toHaveBeenCalledWith({ title: 'New', content: 'Body' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockNote);

    // Validation error
    jest.clearAllMocks();
    validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'Title required' }] });
    req.body = { title: '' }; // invalid body

    await createNote(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Title required' }] });
    expect(Note.create).not.toHaveBeenCalled();
  });

  test('updateNote and deleteNote cover happy, not found, validation and deletion', async () => {
    // Update – happy path
    const existingNote = {
      id: 1,
      title: 'Old',
      update: jest.fn().mockResolvedValue({ id: 1, title: 'Updated' }),
    };
    Note.findByPk.mockResolvedValue(existingNote);
    validationResult.mockReturnValue({ isEmpty: () => true });
    req.params.id = 1;
    req.body = { title: 'Updated', content: 'New content', archived: true };

    await updateNote(req, res, next);
    expect(Note.findByPk).toHaveBeenCalledWith(1);
    expect(existingNote.update).toHaveBeenCalledWith({ title: 'Updated', content: 'New content', archived: true });
    expect(res.json).toHaveBeenCalledWith({ id: 1, title: 'Updated' });

    // Update – not found
    jest.clearAllMocks();
    Note.findByPk.mockResolvedValue(null);
    req.params.id = 404;
    await updateNote(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });

    // Update – validation error
    jest.clearAllMocks();
    Note.findByPk.mockResolvedValue(existingNote); // simulate find again
    validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'Invalid field' }] });
    await updateNote(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Invalid field' }] });

    // Delete – success
    jest.clearAllMocks();
    Note.findByPk.mockResolvedValue({
      id: 1,
      destroy: jest.fn().mockResolvedValue(),
    });
    req.params.id = 1;
    await deleteNote(req, res, next);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();

    // Delete – not found
    jest.clearAllMocks();
    Note.findByPk.mockResolvedValue(null);
    req.params.id = 999;
    await deleteNote(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
  });
});