const express = require('express');
const router = express.Router();
const {
  getRoutines,
  getRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  addSlot,
  updateSlot,
  deleteSlot,
  generatePDF,
  generateSectionPDF,
  generateRoomPDF,
  generateMasterPDF,
  duplicateRoutine,
  getRoutineStats,
  getConflicts,
} = require('../controllers/routineController');
const { protect } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(protect);

// Main routine routes
router.route('/')
  .get(getRoutines)
  .post(createRoutine);

router.route('/:id')
  .get(getRoutine)
  .put(updateRoutine)
  .delete(deleteRoutine);

// Slot management
router.route('/:id/slots')
  .post(addSlot);

router.route('/:id/slots/:slotId')
  .put(updateSlot)
  .delete(deleteSlot);

// Get conflicts
router.get('/:id/conflicts', getConflicts);

// PDF generation routes
router.get('/:id/pdf', generatePDF);
router.get('/:id/pdf/master', generateMasterPDF);
router.get('/:id/pdf/section/:sectionName', generateSectionPDF);
router.get('/:id/pdf/room/:roomNumber', generateRoomPDF);

// Utility routes
router.post('/:id/duplicate', duplicateRoutine);
router.get('/:id/stats', getRoutineStats);

module.exports = router;