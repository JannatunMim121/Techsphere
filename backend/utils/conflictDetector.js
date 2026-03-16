/**
 * Conflict Detection Utility
 * Detects teacher and room conflicts across sections
 */

/**
 * Check for conflicts when adding/updating a slot
 * @param {Array} slots - All existing slots
 * @param {Object} newSlot - The new slot to check
 * @param {String} excludeSlotId - Slot ID to exclude (for updates)
 * @returns {Object} - { hasConflict, conflicts: [] }
 */
const checkConflicts = (slots, newSlot, excludeSlotId = null) => {
  const conflicts = [];

  // Filter out the slot being updated
  const otherSlots = slots.filter(s => s._id?.toString() !== excludeSlotId);

  // Get all slots at the same day and time
  const slotsAtSameTime = otherSlots.filter(slot =>
    slot.day === newSlot.day &&
    slot.startTime === newSlot.startTime
  );

  // Check section conflict FIRST (same section, same time) - This is critical!
  if (newSlot.sectionName) {
    const sectionConflict = slotsAtSameTime.find(slot =>
      slot.sectionName === newSlot.sectionName
    );

    if (sectionConflict) {
      conflicts.push({
        type: 'section',
        message: `${newSlot.sectionName} already has a class at this time (${newSlot.startTime})`,
        slot: sectionConflict,
        severity: 'error'
      });
    }
  }

  // Check if same course already exists for this section on this day
  if (newSlot.sectionName && newSlot.course?.code) {
    const courseConflict = otherSlots.find(slot =>
      slot.day === newSlot.day &&
      slot.sectionName === newSlot.sectionName &&
      slot.course?.code === newSlot.course?.code
    );

    if (courseConflict) {
      conflicts.push({
        type: 'duplicate_course',
        message: `${newSlot.sectionName} already has ${newSlot.course?.code} scheduled on ${newSlot.day}`,
        slot: courseConflict,
        severity: 'error'
      });
    }

    // THEORETICAL CLASS 3-DAY LIMIT: Theory courses can only be scheduled on max 3 days per week
    if (newSlot.course?.type === 'theory') {
      // Count unique days for this theory course in this section
      const theorySlots = otherSlots.filter(slot =>
        slot.sectionName === newSlot.sectionName &&
        slot.course?.code === newSlot.course?.code &&
        slot.course?.type === 'theory'
      );

      const uniqueDays = new Set(theorySlots.map(slot => slot.day));

      // If adding this slot would exceed 3 days, block it
      if (!uniqueDays.has(newSlot.day) && uniqueDays.size >= 3) {
        conflicts.push({
          type: 'theory_day_limit',
          message: `${newSlot.sectionName} - ${newSlot.course?.code} (Theory) is already scheduled on ${uniqueDays.size} days. Theory classes can only be allocated maximum 3 days per week.`,
          slot: null,
          severity: 'error'
        });
      }
    }
  }

  // Check for LAB overlap - Labs span multiple hours (e.g., 8:00-11:00)
  // When a lab is scheduled:
  // 1. The SECTION cannot have any other class during lab hours
  // 2. The ROOM cannot be used by any other section during lab hours
  
  const newSlotStartMinutes = parseTime(newSlot.startTime);
  const newSlotEndMinutes = parseTime(newSlot.endTime);
  
  // Check ALL existing slots for conflicts
  otherSlots.forEach((slot) => {
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
            slot: slot,
            severity: 'error'
          });
        }
        
        // ROOM conflict - room already booked during lab time
        if (slot.roomNumber === newSlot.roomNumber && slot.startTime !== newSlot.startTime) {
          conflicts.push({
            type: 'lab_room_overlap',
            message: `Lab room ${newSlot.roomNumber} is already booked for ${slot.sectionName} at ${slot.startTime} during lab hours (${newSlot.startTime}-${newSlot.endTime})`,
            slot: slot,
            severity: 'error'
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
            slot: slot,
            severity: 'error'
          });
        }
        
        // ROOM conflict - room is lab room
        if (slot.roomNumber === newSlot.roomNumber) {
          conflicts.push({
            type: 'lab_room_overlap',
            message: `Room ${newSlot.roomNumber} is booked for ${slot.sectionName}'s lab (${slot.startTime}-${slot.endTime})`,
            slot: slot,
            severity: 'error'
          });
        }
      }
    }
  });

  // Check room conflict
  if (newSlot.roomNumber) {
    const roomConflict = slotsAtSameTime.find(slot =>
      slot.roomNumber === newSlot.roomNumber
    );

    if (roomConflict) {
      conflicts.push({
        type: 'room',
        message: `Room "${newSlot.roomNumber}" is already booked for ${roomConflict.sectionName}`,
        slot: roomConflict,
        severity: 'error'
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
};

/**
 * Get all conflicts in a routine
 * @param {Array} slots - All slots in the routine
 * @returns {Object} - { teacherConflicts: [], roomConflicts: [], sectionConflicts: [] }
 */
const getAllConflicts = (slots) => {
  const teacherConflicts = [];
  const roomConflicts = [];
  const sectionConflicts = [];

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slot1 = slots[i];
      const slot2 = slots[j];

      // Skip if different days or times
      if (slot1.day !== slot2.day || slot1.startTime !== slot2.startTime) {
        continue;
      }

      // Check teacher conflict
      if (slot1.teacher && slot2.teacher && slot1.teacher === slot2.teacher) {
        teacherConflicts.push({
          type: 'teacher',
          message: `Teacher "${slot1.teacher}" assigned to both ${slot1.sectionName} and ${slot2.sectionName}`,
          slots: [slot1, slot2]
        });
      }

      // Check room conflict
      if (slot1.roomNumber && slot2.roomNumber && slot1.roomNumber === slot2.roomNumber) {
        roomConflicts.push({
          type: 'room',
          message: `Room "${slot1.roomNumber}" booked for both ${slot1.sectionName} and ${slot2.sectionName}`,
          slots: [slot1, slot2]
        });
      }

      // Check section conflict
      if (slot1.sectionName && slot2.sectionName && slot1.sectionName === slot2.sectionName) {
        sectionConflicts.push({
          type: 'section',
          message: `${slot1.sectionName} has multiple classes at the same time`,
          slots: [slot1, slot2]
        });
      }
    }
  }

  return {
    teacherConflicts,
    roomConflicts,
    sectionConflicts,
    totalConflicts: teacherConflicts.length + roomConflicts.length + sectionConflicts.length
  };
};

/**
 * Parse time string to minutes
 */
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Find available rooms for a given time slot
 * @param {Array} allSlots - All existing slots
 * @param {String} day - Day of the week
 * @param {String} startTime - Start time
 * @param {Array} availableRooms - List of available room numbers
 * @returns {Array} - Available rooms
 */
const findAvailableRooms = (allSlots, day, startTime, availableRooms) => {
  const bookedRooms = new Set(
    allSlots
      .filter(slot => slot.day === day && slot.startTime === startTime)
      .map(slot => slot.roomNumber)
  );

  return availableRooms.filter(room => !bookedRooms.has(room));
};

/**
 * Find available teachers for a given time slot
 * @param {Array} allSlots - All existing slots
 * @param {String} day - Day of the week
 * @param {String} startTime - Start time
 * @param {Array} availableTeachers - List of available teachers
 * @returns {Array} - Available teachers
 */
const findAvailableTeachers = (allSlots, day, startTime, availableTeachers) => {
  const busyTeachers = new Set(
    allSlots
      .filter(slot => slot.day === day && slot.startTime === startTime && slot.teacher)
      .map(slot => slot.teacher)
  );

  return availableTeachers.filter(teacher => !busyTeachers.has(teacher));
};

module.exports = {
  checkConflicts,
  getAllConflicts,
  findAvailableRooms,
  findAvailableTeachers
};
