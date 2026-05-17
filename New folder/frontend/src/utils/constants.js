export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export const COURSE_TYPES = [
  { value: 'theory', label: 'Theory', color: '#6366f1' },
  { value: 'lab', label: 'Lab', color: '#10b981' },
  { value: 'tutorial', label: 'Tutorial', color: '#f59e0b' },
];

export const SECTION_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6b7280',
  '#84cc16',
];

export const DEFAULT_SCHEDULE_SETTINGS = {
  startTime: '08:00',
  endTime: '17:30',
  classDuration: 50,
  shortBreak: 10,
  longBreakStart: '10:50',
  longBreakEnd: '11:30',
  labDuration: 180,
};

export const SEMESTERS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Semester ${i + 1}`,
}));

export const FLOORS = Array.from({ length: 10 }, (_, i) => ({
  value: i,
  label: i === 0 ? 'Ground Floor' : `Floor ${i}`,
}));

export const API_ENDPOINTS = {
  AUTH: '/auth',
  ROOMS: '/rooms',
  SECTIONS: '/sections',
  ROUTINES: '/routines',
};

export const KEYBOARD_SHORTCUTS = {
  SAVE: 'ctrl+s',
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
  DELETE: 'delete',
  ESCAPE: 'escape',
};