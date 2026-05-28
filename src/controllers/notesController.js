const Note = require('../models/Note');
const { validationResult } = require('express-validator');

// GET /api/notes - List all notes (with optional filtering)
exports.listNotes = async (req, res, next) => {
  try {
    const { archived } = req.query;
    const where = {};
    if (archived !== undefined) {
      where.archived = archived === 'true';
    }
    const notes = await Note.findAll({ where, order: [['updated_at', 'DESC']] });
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

// GET /api/notes/:id - Read a single note
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
};

// POST /api/notes - Create a new note
exports.createNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, content } = req.body;
    const note = await Note.create({ title, content });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

// PUT /api/notes/:id - Update an existing note
exports.updateNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    const { title, content, archived } = req.body;
    const updated = await note.update({ title, content, archived });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notes/:id - Delete a note
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await note.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
