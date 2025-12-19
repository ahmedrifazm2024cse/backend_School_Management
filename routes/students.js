const express = require('express');
const Student = require('../models/Student');
const router = express.Router();

// Get all students - return simple array for frontend compatibility
router.get('/', async (req, res) => {
  try {
    const students = await Student.find({})
      .sort({ createdAt: -1 })
      .exec();
    
    console.log(`Found ${students.length} students`);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      message: 'Failed to fetch students', 
      error: error.message 
    });
  }
});

// Get single student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ 
      message: 'Failed to fetch student', 
      error: error.message 
    });
  }
});

// Create student
router.post('/', async (req, res) => {
  try {
    const { name, email, rollNo, class: studentClass } = req.body;
    
    if (!name || !email || !rollNo || !studentClass) {
      return res.status(400).json({ 
        message: 'All fields are required: name, email, rollNo, and class' 
      });
    }
    
    const studentData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rollNo: rollNo.trim().toUpperCase(),
      class: studentClass.trim(),
      phone: req.body.phone || '',
      address: req.body.address || '',
      status: 'Active'
    };
    
    const student = new Student(studentData);
    const savedStudent = await student.save();
    
    console.log('✅ Student created and saved:', savedStudent.name, savedStudent._id);
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error('❌ Error creating student:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `Student with this ${field} already exists` 
      });
    }
    
    res.status(400).json({ 
      message: error.message || 'Failed to create student'
    });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check for duplicate email or rollNo (excluding current student)
    if (req.body.email || req.body.rollNo) {
      const duplicateQuery = {
        _id: { $ne: id },
        $or: []
      };
      
      if (req.body.email) duplicateQuery.$or.push({ email: req.body.email });
      if (req.body.rollNo) duplicateQuery.$or.push({ rollNo: req.body.rollNo });
      
      const duplicate = await Student.findOne(duplicateQuery);
      if (duplicate) {
        return res.status(400).json({ 
          message: duplicate.email === req.body.email 
            ? 'Another student with this email already exists' 
            : 'Another student with this roll number already exists'
        });
      }
    }
    
    const student = await Student.findByIdAndUpdate(
      id, 
      { ...req.body, updatedAt: Date.now() }, 
      { new: true, runValidators: true }
    );
    
    console.log('Student updated successfully:', student.name);
    res.json({
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    console.error('Error updating student:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to update student', 
      error: error.message 
    });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await Student.findByIdAndDelete(req.params.id);
    
    console.log('Student deleted successfully:', student.name);
    res.json({ 
      message: 'Student deleted successfully',
      deletedStudent: { name: student.name, rollNo: student.rollNo }
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ 
      message: 'Failed to delete student', 
      error: error.message 
    });
  }
});

module.exports = router;