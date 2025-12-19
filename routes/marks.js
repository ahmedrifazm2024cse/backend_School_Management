const express = require('express');
const Marks = require('../models/Marks');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const marks = await Marks.find().populate('studentId teacherId');
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const marks = new Marks(req.body);
    await marks.save();
    res.status(201).json(marks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;