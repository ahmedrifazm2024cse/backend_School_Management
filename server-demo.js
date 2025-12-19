const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory data for demo
let users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@school.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: '2',
    username: 'teacher1',
    email: 'teacher@school.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'teacher',
    name: 'John Teacher'
  },
  {
    id: '3',
    username: 'student1',
    email: 'student@school.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'student',
    name: 'Jane Student'
  }
];

let students = [
  { id: '1', name: 'Jane Student', email: 'student@school.com', class: '10A', rollNumber: '001' },
  { id: '2', name: 'John Doe', email: 'john@school.com', class: '10B', rollNumber: '002' }
];

let teachers = [
  { id: '1', name: 'John Teacher', email: 'teacher@school.com', subject: 'Mathematics', classes: ['10A', '10B'] }
];

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is running!', 
    timestamp: new Date().toISOString(),
    mongodb: 'Demo Mode - No Database Required'
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'demo_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role, name } = req.body;
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: String(users.length + 1),
      username,
      email,
      password: hashedPassword,
      role: role || 'student',
      name
    };

    users.push(newUser);

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'demo_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Students routes
app.get('/api/students', (req, res) => {
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const newStudent = {
    id: String(students.length + 1),
    ...req.body
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// Teachers routes
app.get('/api/teachers', (req, res) => {
  res.json(teachers);
});

app.post('/api/teachers', (req, res) => {
  const newTeacher = {
    id: String(teachers.length + 1),
    ...req.body
  };
  teachers.push(newTeacher);
  res.status(201).json(newTeacher);
});

// Attendance routes
app.get('/api/attendance', (req, res) => {
  res.json([
    { studentId: '1', date: '2024-01-15', status: 'present' },
    { studentId: '2', date: '2024-01-15', status: 'absent' }
  ]);
});

// Marks routes
app.get('/api/marks', (req, res) => {
  res.json([
    { studentId: '1', subject: 'Mathematics', marks: 85, maxMarks: 100 },
    { studentId: '1', subject: 'Science', marks: 92, maxMarks: 100 }
  ]);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Demo Server running on http://localhost:${PORT}`);
  console.log(`📋 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🗄️  Database: Demo Mode (In-Memory)`);
  console.log('📝 Demo Credentials:');
  console.log('   Admin: admin@school.com / password');
  console.log('   Teacher: teacher@school.com / password');
  console.log('   Student: student@school.com / password');
});