export const generateTimeSlots = (schedule) => {
  const slots = [];
  const {
    startTime,
    endTime,
    classDuration,
    shortBreak,
    longBreakStart,
    longBreakEnd,
  } = schedule;

  let current = parseTime(startTime);
  const end = parseTime(endTime);
  const longStart = parseTime(longBreakStart);
  const longEnd = parseTime(longBreakEnd);

  while (current < end) {
    // Check if we're at long break time
    if (current >= longStart && current < longEnd) {
      slots.push({
        start: formatTime(longStart),
        end: formatTime(longEnd),
        isBreak: true,
        breakType: 'long',
        duration: longEnd - longStart,
      });
      current = longEnd;
      continue;
    }

    // Check if next slot would overlap with long break
    const slotEnd = current + classDuration;
    if (current < longStart && slotEnd > longStart) {
      // End this slot at long break start
      slots.push({
        start: formatTime(current),
        end: formatTime(longStart),
        isBreak: false,
        duration: longStart - current,
      });
      current = longStart;
      continue;
    }

    // Regular class slot
    if (slotEnd <= end) {
      slots.push({
        start: formatTime(current),
        end: formatTime(slotEnd),
        isBreak: false,
        duration: classDuration,
      });
      current = slotEnd + shortBreak;
    } else {
      break;
    }
  }

  return slots;
};

export const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};