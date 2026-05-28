const express = require('express');
const { body, param } = require('express-validator');
const notesController = require('../controllers/notesController');

const router = express.Router();

// Validation rules
const noteValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
];

const idValidation = [
  param('id').isUUID().withMessage('Invalid note ID'),
];

// Routes
router.get('/', notesController.listNotes);
router.get('/:id', idValidation, notesController.getNote);
router.post('/', noteValidation, notesController.createNote);
router.put('/:id', [...idValidation, ...noteValidation], notesController.updateNote);
router.delete('/:id', idValidation, notesController.deleteNote);

module.exports = router;
