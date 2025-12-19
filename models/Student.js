const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  rollNo: { 
    type: String, 
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  class: { 
    type: String, 
    required: [true, 'Class/Branch is required'],
    trim: true
  },
  section: { 
    type: String,
    trim: true
  },
  phone: { 
    type: String,
    trim: true,
    match: [/^[\d\s\-\+\(\)]{10,15}$/, 'Please enter a valid phone number']
  },
  address: { 
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Graduated', 'Suspended'],
    default: 'Active' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
studentSchema.index({ email: 1 });
studentSchema.index({ rollNo: 1 });
studentSchema.index({ class: 1 });

module.exports = mongoose.model('Student', studentSchema);