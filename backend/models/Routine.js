const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  sectionName: {
    type: String,
    required: true
  },
  course: {
    code: String,
    title: String,
    type: {
      type: String,
      enum: ['theory', 'lab', 'tutorial']
    },
    credits: Number
  },
  room: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Room'
  },
  roomNumber: {
    type: String,
    required: [function() { return !this.isBreak; }, 'Room number is required for non-break slots']
  },
  teacher: {
    type: String,
    required: [function() { return !this.isBreak; }, 'Teacher is required for non-break slots']
  },
  color: String,
  isBreak: {
    type: Boolean,
    default: false
  },
  breakType: {
    type: String,
    enum: ['short', 'long', null],
    default: null
  }
});

const routineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  routineType: {
    type: String,
    enum: ['department', 'section'],
    default: 'department',
    required: true
  },
  targetSections: [{
    type: String
  }],
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveTo: {
    type: Date
  },
  workingDays: [{
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    default: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
  }],
  schedule: {
    startTime: {
      type: String,
      default: '08:00'
    },
    endTime: {
      type: String,
      default: '17:30'
    },
    classDuration: {
      type: Number,
      default: 50
    },
    shortBreak: {
      type: Number,
      default: 10
    },
    longBreakStart: {
      type: String,
      default: '10:50'
    },
    longBreakEnd: {
      type: String,
      default: '11:30'
    },
    labDuration: {
      type: Number,
      default: 180
    }
  },
  slots: [slotSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
routineSchema.index({ department: 1, semester: 1, routineType: 1 });
routineSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Routine', routineSchema);
