const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is running!', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Connect to MongoDB with immediate connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_portal';

mongoose.set('strictQuery', false);

// Force immediate connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB Connected Successfully');
    console.log('📍 Database:', MONGODB_URI);
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

connectDB();

// MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Import and setup routes
try {
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/users');
  const studentRoutes = require('./routes/students');
  const teacherRoutes = require('./routes/teachers');
  const attendanceRoutes = require('./routes/attendance');
  const marksRoutes = require('./routes/marks');
  
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/teachers', teacherRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/marks', marksRoutes);
  
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error(error.stack);
}

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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🗄️  MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log('📝 Available routes:');
  console.log('   - POST /api/auth/login');
  console.log('   - POST /api/auth/register');
  console.log('   - GET/POST/PUT/DELETE /api/students');
  console.log('   - GET/POST/PUT/DELETE /api/teachers');
});