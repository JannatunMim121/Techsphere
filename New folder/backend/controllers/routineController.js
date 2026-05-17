const Routine = require('../models/Routine');
const {
  generateRoutinePDF,
  generateSectionPDF,
  generateRoomPDF,
  generateMasterPDF,
} = require('../utils/pdfGenerator');
const { checkConflicts, getAllConflicts } = require('../utils/conflictDetector');

// @desc    Get all routines
// @route   GET /api/routines
exports.getRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: routines.length,
      data: routines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single routine
// @route   GET /api/routines/:id
exports.getRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Get conflicts for this routine
    const conflicts = getAllConflicts(routine.slots || []);

    res.json({
      success: true,
      data: routine,
      conflicts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create routine
// @route   POST /api/routines
exports.createRoutine = async (req, res) => {
  try {
    // Clean up slots - remove temp IDs
    const { slots = [], ...routineData } = req.body;
    
    const cleanedSlots = slots.map(slot => {
      const { _id, ...slotData } = slot;
      return slotData;
    });

    // Check for conflicts before saving
    const conflicts = getAllConflicts(cleanedSlots);
    
    const routine = new Routine({
      ...routineData,
      slots: cleanedSlots,
      createdBy: req.user.id
    });

    await routine.save();

    res.status(201).json({
      success: true,
      data: routine,
      conflicts,
      warning: conflicts.totalConflicts > 0 ? 'Routine saved with conflicts' : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update routine
// @route   PUT /api/routines/:id
exports.updateRoutine = async (req, res) => {
  try {
    let routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Clean up slots if present - remove temp IDs
    const updateData = { ...req.body };
    if (updateData.slots) {
      updateData.slots = updateData.slots.map(slot => {
        const { _id, ...slotData } = slot;
        return slotData;
      });
    }

    routine = await Routine.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    // Get conflicts for updated routine
    const conflicts = getAllConflicts(routine.slots || []);

    res.json({
      success: true,
      data: routine,
      conflicts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete routine
// @route   DELETE /api/routines/:id
exports.deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    await routine.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add slot to routine with conflict check
// @route   POST /api/routines/:id/slots
exports.addSlot = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Clean temp ID
    const slotData = { ...req.body };
    delete slotData._id;

    // Check for conflicts
    const { hasConflict, conflicts } = checkConflicts(routine.slots, slotData);

    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'Conflicts detected',
        conflicts
      });
    }

    routine.slots.push(slotData);
    await routine.save();

    res.json({
      success: true,
      data: routine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update slot in routine with conflict check
// @route   PUT /api/routines/:id/slots/:slotId
exports.updateSlot = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    const slot = routine.slots.id(req.params.slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // Clean temp ID from update data
    const updateData = { ...req.body };
    delete updateData._id;

    // Check for conflicts (excluding current slot)
    const allSlots = routine.slots.map(s => s.toObject());
    const { hasConflict, conflicts } = checkConflicts(allSlots, { ...slot.toObject(), ...updateData }, slot._id);

    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'Conflicts detected',
        conflicts
      });
    }

    slot.set(updateData);
    await routine.save();

    res.json({
      success: true,
      data: routine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete slot from routine
// @route   DELETE /api/routines/:id/slots/:slotId
exports.deleteSlot = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    routine.slots.id(req.params.slotId).deleteOne();
    await routine.save();

    res.json({
      success: true,
      data: routine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get routine conflicts
// @route   GET /api/routines/:id/conflicts
exports.getConflicts = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    const conflicts = getAllConflicts(routine.slots || []);

    res.json({
      success: true,
      data: conflicts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate PDF
// @route   GET /api/routines/:id/pdf
exports.generatePDF = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    generateRoutinePDF(routine.toObject(), res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate Section PDF
// @route   GET /api/routines/:id/pdf/section/:sectionName
exports.generateSectionPDF = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    generateSectionPDF(routine.toObject(), req.params.sectionName, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate Room PDF
// @route   GET /api/routines/:id/pdf/room/:roomNumber
exports.generateRoomPDF = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    generateRoomPDF(routine.toObject(), req.params.roomNumber, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate Master PDF (Department Routine)
// @route   GET /api/routines/:id/pdf/master
exports.generateMasterPDF = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    generateMasterPDF(routine.toObject(), res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Duplicate routine
// @route   POST /api/routines/:id/duplicate
exports.duplicateRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    const duplicatedRoutine = new Routine({
      ...routine.toObject(),
      _id: undefined,
      name: `${routine.name} (Copy)`,
      createdBy: req.user.id,
      createdAt: undefined,
      updatedAt: undefined,
      version: 1,
    });

    await duplicatedRoutine.save();

    res.status(201).json({
      success: true,
      data: duplicatedRoutine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get routine statistics
// @route   GET /api/routines/:id/stats
exports.getRoutineStats = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    const slots = routine.slots || [];

    // Calculate statistics
    const stats = {
      totalSlots: slots.length,
      slotsPerDay: {},
      sectionsCount: new Set(slots.map(s => s.sectionName)).size,
      roomsUsed: new Set(slots.map(s => s.roomNumber)).size,
      courseTypes: {
        theory: slots.filter(s => s.course?.type === 'theory').length,
        lab: slots.filter(s => s.course?.type === 'lab').length,
        tutorial: slots.filter(s => s.course?.type === 'tutorial').length,
      },
      teachersAssigned: new Set(slots.filter(s => s.teacher).map(s => s.teacher)).size,
      conflicts: getAllConflicts(slots)
    };

    // Slots per day
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
      stats.slotsPerDay[day] = slots.filter(s => s.day === day).length;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
