/**
 * Check for conflicts when adding/updating a slot
 * @param {Object} newSlot - The new slot to check
 * @param {Array} existingSlots - All existing slots
 * @param {Array} rooms - All available rooms
 * @returns {Array} - Array of conflict objects
 */
export const checkConflicts = (newSlot, existingSlots, rooms = []) => {
  const conflicts = [];

  // Get all slots at the same day and time
  const slotsAtSameTime = existingSlots.filter(
    (slot) => slot.day === newSlot.day && slot.startTime === newSlot.startTime
  );

  // Check section conflict FIRST - same section cannot have multiple classes at same time
  const sectionConflict = slotsAtSameTime.find(
    (slot) => slot.sectionName === newSlot.sectionName
  );

  if (sectionConflict) {
    conflicts.push({
      type: 'section',
      message: `${newSlot.sectionName} already has a class at this time (${newSlot.startTime})`,
      severity: 'error',
    });
  }

  // Check if same course already exists for this section on this day
  const courseConflict = existingSlots.find(
    (slot) =>
      slot.day === newSlot.day &&
      slot.sectionName === newSlot.sectionName &&
      slot.course?.code === newSlot.course?.code
  );

  if (courseConflict) {
    conflicts.push({
      type: 'duplicate_course',
      message: `${newSlot.sectionName} already has ${newSlot.course?.code} scheduled on ${newSlot.day}`,
      severity: 'error',
    });
  }

  // LAB WEEKLY LIMIT: A lab course can only be scheduled once per week for a section.
  if (newSlot.course?.type === 'lab') {
    const labConflict = existingSlots.find(
      (slot) =>
        slot.sectionName === newSlot.sectionName &&
        slot.course?.code === newSlot.course?.code &&
        slot.course?.type === 'lab'
    );

    if (labConflict) {
      conflicts.push({
        type: 'lab_weekly_limit',
        message: `${newSlot.sectionName} - ${newSlot.course?.code} (Lab) is already scheduled on ${labConflict.day}. A lab can only be allocated once per week.`,
        severity: 'error',
      });
    }
  }

  // THEORETICAL CLASS 3-DAY LIMIT: Theory courses can only be scheduled on max 3 days per week
  if (newSlot.course?.type === 'theory') {
    // Count unique days for this theory course in this section
    const theorySlots = existingSlots.filter(
      (slot) =>
        slot.sectionName === newSlot.sectionName &&
        slot.course?.code === newSlot.course?.code &&
        slot.course?.type === 'theory'
    );

    const uniqueDays = new Set(theorySlots.map((slot) => slot.day));

    // If adding this slot would exceed 3 days, block it
    if (!uniqueDays.has(newSlot.day) && uniqueDays.size >= 3) {
      conflicts.push({
        type: 'theory_day_limit',
        message: `${newSlot.sectionName} - ${newSlot.course?.code} (Theory) is already scheduled on ${uniqueDays.size} days. Theory classes can only be allocated maximum 3 days per week.`,
        severity: 'error',
      });
    }
  }

  // Check room conflict - same room at same time
  const roomConflict = slotsAtSameTime.find(
    (slot) => slot.roomNumber === newSlot.roomNumber
  );

  if (roomConflict) {
    conflicts.push({
      type: 'room',
      message: `Room "${newSlot.roomNumber}" is already booked for ${roomConflict.sectionName} at this time`,
      severity: 'error',
    });
  }

  // Check teacher conflict - same teacher at same time
  if (newSlot.teacher) {
    const teacherConflict = slotsAtSameTime.find(
      (slot) => slot.teacher && slot.teacher === newSlot.teacher
    );

    if (teacherConflict) {
      conflicts.push({
        type: 'teacher',
        message: `Teacher "${newSlot.teacher}" is already assigned to ${teacherConflict.sectionName} at this time`,
        severity: 'error',
      });
    }
  }

  // Check for LAB overlap - Labs span multiple hours (e.g., 8:00-11:00)
  // When a lab is scheduled:
  // 1. The SECTION cannot have any other class during lab hours
  // 2. The ROOM cannot be used by any other section during lab hours
  
  const newSlotStartMinutes = parseTime(newSlot.startTime);
  const newSlotEndMinutes = parseTime(newSlot.endTime);
  
  // Check ALL existing slots for conflicts
  existingSlots.forEach((slot) => {
    if (slot.day !== newSlot.day) return;
    
    const slotStartMinutes = parseTime(slot.startTime);
    const slotEndMinutes = parseTime(slot.endTime);
    
    // Check if this is a LAB slot (either new or existing)
    const newSlotIsLab = newSlot.course?.type === 'lab';
    const existingSlotIsLab = slot.course?.type === 'lab';
    
    // CASE 1: New slot is LAB - check if it conflicts with existing classes
    if (newSlotIsLab) {
      // Check if existing slot's time falls within new lab's time range
      const timeOverlaps = slotStartMinutes >= newSlotStartMinutes && slotStartMinutes < newSlotEndMinutes;
      
      if (timeOverlaps) {
        // SECTION conflict - section already has class during lab time
        if (slot.sectionName === newSlot.sectionName && slot.startTime !== newSlot.startTime) {
          conflicts.push({
            type: 'lab_section_overlap',
            message: `Lab (${newSlot.startTime}-${newSlot.endTime}) conflicts with ${slot.course?.code} at ${slot.startTime} for ${newSlot.sectionName}. Section cannot have classes during lab hours.`,
            severity: 'error',
          });
        }
        
        // ROOM conflict - room already booked during lab time
        if (slot.roomNumber === newSlot.roomNumber && slot.startTime !== newSlot.startTime) {
          conflicts.push({
            type: 'lab_room_overlap',
            message: `Lab room ${newSlot.roomNumber} is already booked for ${slot.sectionName} at ${slot.startTime} during lab hours (${newSlot.startTime}-${newSlot.endTime})`,
            severity: 'error',
          });
        }
      }
    }
    
    // CASE 2: Existing slot is LAB - check if new slot falls within lab hours
    if (existingSlotIsLab) {
      // Check if new slot's time falls within existing lab's time range
      const newSlotInLabTime = newSlotStartMinutes >= slotStartMinutes && newSlotStartMinutes < slotEndMinutes;
      
      if (newSlotInLabTime) {
        // SECTION conflict - section already has lab during this time
        if (slot.sectionName === newSlot.sectionName) {
          conflicts.push({
            type: 'lab_section_overlap',
            message: `${newSlot.course?.code} at ${newSlot.startTime} conflicts with lab (${slot.startTime}-${slot.endTime}) for ${newSlot.sectionName}. Section has lab during this time.`,
            severity: 'error',
          });
        }
        
        // ROOM conflict - room is lab room
        if (slot.roomNumber === newSlot.roomNumber) {
          conflicts.push({
            type: 'lab_room_overlap',
            message: `Room ${newSlot.roomNumber} is booked for ${slot.sectionName}'s lab (${slot.startTime}-${slot.endTime})`,
            severity: 'error',
          });
        }
      }
    }
  });

  // Check room capacity
  if (newSlot.room) {
    const room = rooms.find((r) => r._id === newSlot.room);
    const section = existingSlots.find((s) => s.sectionName === newSlot.sectionName);

    if (room && section?.studentCount && room.capacity < section.studentCount) {
      conflicts.push({
        type: 'capacity',
        message: `Room capacity (${room.capacity}) is less than section size (${section.studentCount})`,
        severity: 'warning',
      });
    }
  }

  return conflicts;
};

/**
 * Validate entire routine for conflicts
 * @param {Array} slots - All slots in the routine
 * @param {Array} rooms - All available rooms
 * @param {Array} sections - All available sections
 * @returns {Object} - { errors, warnings, isValid }
 */
export const validateRoutine = (slots, rooms, sections) => {
  const errors = [];
  const warnings = [];

  // Check each slot against all others
  slots.forEach((slot, index) => {
    // Validate room assignment
    if (!slot.roomNumber) {
      warnings.push(`Slot ${index + 1}: No room assigned`);
    }

    // Validate section
    if (!slot.sectionName) {
      errors.push(`Slot ${index + 1}: No section assigned`);
    }

    // Check for conflicts with other slots
    const slotConflicts = checkConflicts(slot, slots.filter((s) => s._id !== slot._id), rooms);
    slotConflicts.forEach((conflict) => {
      if (conflict.severity === 'error') {
        errors.push(conflict.message);
      } else {
        warnings.push(conflict.message);
      }
    });
  });

  return { errors, warnings, isValid: errors.length === 0 };
};

/**
 * Get all conflicts in a routine (for display)
 * @param {Array} slots - All slots
 * @returns {Object} - { teacherConflicts, roomConflicts, sectionConflicts, totalConflicts }
 */
export const getAllConflicts = (slots) => {
  const teacherConflicts = [];
  const roomConflicts = [];
  const sectionConflicts = [];

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slot1 = slots[i];
      const slot2 = slots[j];

      // Skip if different days or times
      if (slot1.day !== slot2.day || slot1.startTime !== slot2.startTime) {
        const isSameWeeklyLab =
          slot1.sectionName &&
          slot1.sectionName === slot2.sectionName &&
          slot1.course?.code &&
          slot1.course?.code === slot2.course?.code &&
          slot1.course?.type === 'lab' &&
          slot2.course?.type === 'lab';

        if (isSameWeeklyLab) {
          sectionConflicts.push({
            type: 'lab_weekly_limit',
            message: `${slot1.sectionName} - ${slot1.course?.code} (Lab) is scheduled more than once this week`,
            slots: [slot1, slot2],
          });
        }

        continue;
      }

      // Check teacher conflict
      if (slot1.teacher && slot2.teacher && slot1.teacher === slot2.teacher) {
        teacherConflicts.push({
          type: 'teacher',
          message: `Teacher "${slot1.teacher}" assigned to both ${slot1.sectionName} and ${slot2.sectionName}`,
          slots: [slot1, slot2],
        });
      }

      // Check room conflict
      if (slot1.roomNumber && slot2.roomNumber && slot1.roomNumber === slot2.roomNumber) {
        roomConflicts.push({
          type: 'room',
          message: `Room "${slot1.roomNumber}" booked for both ${slot1.sectionName} and ${slot2.sectionName}`,
          slots: [slot1, slot2],
        });
      }

      // Check section conflict
      if (slot1.sectionName && slot2.sectionName && slot1.sectionName === slot2.sectionName) {
        sectionConflicts.push({
          type: 'section',
          message: `${slot1.sectionName} has multiple classes at the same time`,
          slots: [slot1, slot2],
        });
      }
    }
  }

  return {
    teacherConflicts,
    roomConflicts,
    sectionConflicts,
    totalConflicts: teacherConflicts.length + roomConflicts.length + sectionConflicts.length,
  };
};

/**
 * Parse time string to minutes (helper for lab overlap detection)
 */
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};
