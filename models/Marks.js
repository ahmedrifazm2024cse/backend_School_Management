const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  examType: { type: String, required: true },
  marks: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: { type: String },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Marks', marksSchema);