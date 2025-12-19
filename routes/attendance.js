const express = require('express');
const Attendance = require('../models/Attendance');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('studentId teacherId');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.studentId });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;