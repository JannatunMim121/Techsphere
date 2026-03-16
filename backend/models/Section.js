const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['theory', 'lab', 'tutorial'],
    default: 'theory'
  },
  credits: {
    type: Number,
    default: 3
  },
  teacher: {
    type: String
  }
});

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  studentCount: {
    type: Number,
    required: true,
    min: 1
  },
  maxCapacity: {
    type: Number,
    required: true
  },
  courses: [courseSchema],
  color: {
    type: String,
    default: '#6366f1'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Section', sectionSchema);