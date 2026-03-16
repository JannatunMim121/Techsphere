const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['classroom', 'lab'],
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  equipment: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  department: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for unique room per department
roomSchema.index({ roomNumber: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);