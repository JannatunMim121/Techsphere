import jsPDF from 'jspdf';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

const COLORS = {
  navy: [22, 45, 76],
  blue: [37, 99, 235],
  blueLight: [239, 246, 255],
  ink: [17, 24, 39],
  body: [55, 65, 81],
  muted: [107, 114, 128],
  lightText: [148, 163, 184],
  white: [255, 255, 255],
  border: [203, 213, 225],
  borderDark: [100, 116, 139],
  rowAlt: [248, 250, 252],
  timeBg: [241, 245, 249],
  breakBg: [255, 251, 235],
  breakText: [146, 64, 14],
  labBg: [254, 242, 242],
  labText: [185, 28, 28],
  success: [5, 150, 105],
};

const PALETTE = [
  [37, 99, 235],
  [5, 150, 105],
  [220, 38, 38],
  [217, 119, 6],
  [124, 58, 237],
  [13, 148, 136],
  [219, 39, 119],
  [234, 88, 12],
];

const parseTime = (time) => {
  const [hours, minutes] = String(time || '00:00').split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const truncate = (value, limit) => {
  const text = String(value || '');
  return text.length > limit ? `${text.slice(0, Math.max(0, limit - 3))}...` : text;
};

const hexToRgb = (hex) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return match
    ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)]
    : COLORS.blue;
};

const tint = (rgb, amount = 0.92) =>
  rgb.map((value) => Math.round(value * (1 - amount) + 255 * amount));

const setText = (pdf, color, size, weight = 'normal') => {
  pdf.setTextColor(...color);
  pdf.setFontSize(size);
  pdf.setFont('helvetica', weight);
};

const fill = (pdf, x, y, w, h, color) => {
  pdf.setFillColor(...color);
  pdf.rect(x, y, w, h, 'F');
};

const stroke = (pdf, x, y, w, h, color = COLORS.border, width = 0.25) => {
  pdf.setDrawColor(...color);
  pdf.setLineWidth(width);
  pdf.rect(x, y, w, h, 'S');
};

const hLine = (pdf, x1, x2, y, color = COLORS.border, width = 0.25) => {
  pdf.setDrawColor(...color);
  pdf.setLineWidth(width);
  pdf.line(x1, y, x2, y);
};

const vLine = (pdf, x, y1, y2, color = COLORS.border, width = 0.25) => {
  pdf.setDrawColor(...color);
  pdf.setLineWidth(width);
  pdf.line(x, y1, x, y2);
};

const buildTimeSlots = (schedule = {}) => {
  const {
    startTime = '08:00',
    endTime = '17:30',
    classDuration = 50,
    shortBreak = 10,
    longBreakStart = '10:50',
    longBreakEnd = '11:30',
  } = schedule;

  const slots = [];
  let current = parseTime(startTime);
  const end = parseTime(endTime);
  const breakStart = parseTime(longBreakStart);
  const breakEnd = parseTime(longBreakEnd);

  while (current < end) {
    if (current >= breakStart && current < breakEnd) {
      slots.push({ start: formatTime(breakStart), end: formatTime(breakEnd), isBreak: true });
      current = breakEnd;
      continue;
    }

    const slotEnd = current + classDuration;
    if (current < breakStart && slotEnd > breakStart) {
      current = breakStart;
      continue;
    }

    if (slotEnd <= end) {
      slots.push({ start: formatTime(current), end: formatTime(slotEnd), isBreak: false });
      current = slotEnd + shortBreak;
      continue;
    }

    break;
  }

  return slots;
};

const drawFooter = (pdf, label) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageCount = pdf.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page);
    const y = pageHeight - 10;
    hLine(pdf, 10, pageWidth - 10, y - 4, COLORS.border, 0.3);
    setText(pdf, COLORS.lightText, 6.5);
    pdf.text('TeachSphere', 12, y);
    pdf.text(label, pageWidth / 2, y, { align: 'center' });
    pdf.text(`Page ${page} of ${pageCount}`, pageWidth - 12, y, { align: 'right' });
  }
};

const getSectionColors = (slots) => {
  const sectionNames = [...new Set(slots.map((slot) => slot.sectionName).filter(Boolean))].sort();
  return sectionNames.reduce((result, name, index) => {
    const sample = slots.find((slot) => slot.sectionName === name && slot.color);
    result[name] = sample?.color ? hexToRgb(sample.color) : PALETTE[index % PALETTE.length];
    return result;
  }, {});
};

const getEntriesForCell = (slots, day, timeSlot, sectionName = null) => {
  if (timeSlot.isBreak) return [];

  const cellStart = parseTime(timeSlot.start);
  const relevant = sectionName
    ? slots.filter((slot) => slot.sectionName === sectionName)
    : slots;

  const direct = relevant.filter((slot) => slot.day === day && slot.startTime === timeSlot.start);
  const continuations = relevant
    .filter((slot) => {
      if (slot.day !== day || slot.course?.type !== 'lab' || slot.startTime === timeSlot.start) return false;
      return cellStart > parseTime(slot.startTime) && cellStart < parseTime(slot.endTime);
    })
    .map((slot) => ({ ...slot, isLabContinuation: true }));

  return [...direct, ...continuations];
};

const drawDocumentHeader = (pdf, { title, subtitle, meta, accent = COLORS.blue, margin = 10, startY = 10 }) => {
  const pageWidth = pdf.internal.pageSize.getWidth();

  fill(pdf, 0, 0, pageWidth, 3, accent);
  setText(pdf, accent, 8, 'bold');
  pdf.text('TeachSphere', margin, startY);

  setText(pdf, COLORS.ink, 16, 'bold');
  pdf.text(title, pageWidth / 2, startY + 5, { align: 'center' });

  if (subtitle) {
    setText(pdf, COLORS.body, 8);
    pdf.text(subtitle, pageWidth / 2, startY + 11, { align: 'center' });
  }

  if (meta) {
    setText(pdf, COLORS.muted, 7);
    pdf.text(meta, pageWidth / 2, startY + 16, { align: 'center' });
  }

  hLine(pdf, margin, pageWidth - margin, startY + 20, COLORS.border, 0.35);
  return startY + 25;
};

const drawWeekGridHeader = (pdf, x, y, timeWidth, dayWidth) => {
  const headerHeight = 8;
  fill(pdf, x, y, timeWidth, headerHeight, COLORS.navy);
  setText(pdf, COLORS.white, 6.8, 'bold');
  pdf.text('TIME', x + timeWidth / 2, y + 5.5, { align: 'center' });

  DAYS.forEach((day, index) => {
    const cellX = x + timeWidth + index * dayWidth;
    fill(pdf, cellX, y, dayWidth, headerHeight, COLORS.navy);
    pdf.text(day.toUpperCase(), cellX + dayWidth / 2, y + 5.5, { align: 'center' });
  });

  return headerHeight;
};

const drawEntryCard = (pdf, x, y, w, h, entry, accent, compact = false) => {
  const bg = entry.isLabContinuation ? COLORS.timeBg : tint(accent);
  fill(pdf, x, y, w, h, bg);
  fill(pdf, x, y, 2, h, accent);
  stroke(pdf, x, y, w, h, tint(accent, 0.72), 0.2);

  const code = entry.isLabContinuation
    ? `${entry.course?.code || 'TBA'} cont.`
    : entry.course?.code || 'TBA';

  setText(pdf, COLORS.ink, compact ? 5.6 : 6.2, entry.isLabContinuation ? 'italic' : 'bold');
  pdf.text(truncate(code, compact ? 12 : 15), x + 3.2, y + 4);

  if (!compact && !entry.isLabContinuation && entry.course?.type === 'lab') {
    setText(pdf, COLORS.labText, 4.8, 'bold');
    fill(pdf, x + w - 11, y + 1.2, 8.5, 3.6, COLORS.labBg);
    pdf.text('LAB', x + w - 6.7, y + 4, { align: 'center' });
  }

  setText(pdf, COLORS.muted, compact ? 4.8 : 5.2);
  const meta = compact
    ? `${entry.roomNumber || 'Room?'} | ${entry.teacher || 'TBA'}`
    : `${entry.sectionName || ''} | ${entry.roomNumber || 'Room?'} | ${entry.teacher || 'TBA'}`;
  pdf.text(truncate(meta, compact ? 22 : 31), x + 3.2, y + h - 2.5);
};

const drawWeekGrid = (pdf, {
  routineName,
  schedule,
  slots,
  title,
  subtitle,
  sectionName = null,
  footerLabel,
  accent = COLORS.blue,
}) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const floor = pageHeight - 16;
  const timeSlots = buildTimeSlots(schedule);
  const sectionColors = getSectionColors(slots);
  const timeWidth = 21;
  const dayWidth = (pageWidth - margin * 2 - timeWidth) / DAYS.length;
  const tableWidth = timeWidth + dayWidth * DAYS.length;
  const entryHeight = sectionName ? 12 : 11;
  const minRowHeight = sectionName ? 20 : 18;

  const startPage = (continued = false) => {
    if (continued) pdf.addPage('landscape');
    const meta = `${truncate(routineName, 64)} - Generated ${new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}`;
    let y = drawDocumentHeader(pdf, {
      title: continued ? `${title} (continued)` : title,
      subtitle,
      meta,
      accent,
      margin,
    });

    if (!sectionName && !continued) {
      const sectionNames = Object.keys(sectionColors);
      let legendX = margin;
      let legendY = y;
      sectionNames.forEach((name) => {
        const color = sectionColors[name];
        fill(pdf, legendX, legendY - 3.3, 4, 4, color);
        setText(pdf, COLORS.body, 6.2);
        pdf.text(truncate(name, 12), legendX + 5.5, legendY);
        legendX += 34;
        if (legendX > pageWidth - margin - 30) {
          legendX = margin;
          legendY += 5.5;
        }
      });
      y = legendY + 5;
    }

    y += drawWeekGridHeader(pdf, margin, y, timeWidth, dayWidth);
    return y;
  };

  let y = startPage(false);

  timeSlots.forEach((timeSlot, rowIndex) => {
    const entriesByDay = DAYS.map((day) => getEntriesForCell(slots, day, timeSlot, sectionName));
    const maxEntries = Math.max(...entriesByDay.map((entries) => entries.length), 0);
    const rowHeight = timeSlot.isBreak ? 7 : Math.max(minRowHeight, 5 + Math.max(1, maxEntries) * entryHeight);

    if (y + rowHeight > floor) {
      hLine(pdf, margin, margin + tableWidth, y, COLORS.borderDark, 0.45);
      y = startPage(true);
    }

    if (timeSlot.isBreak) {
      fill(pdf, margin, y, tableWidth, rowHeight, COLORS.breakBg);
      setText(pdf, COLORS.breakText, 7.2, 'bold');
      pdf.text(`PRAYER / LUNCH BREAK     ${timeSlot.start} - ${timeSlot.end}`, margin + tableWidth / 2, y + 4.9, { align: 'center' });
      stroke(pdf, margin, y, tableWidth, rowHeight, [253, 230, 138], 0.3);
      y += rowHeight;
      return;
    }

    fill(pdf, margin, y, timeWidth, rowHeight, COLORS.timeBg);
    setText(pdf, COLORS.body, 7.4, 'bold');
    pdf.text(timeSlot.start, margin + timeWidth / 2, y + rowHeight / 2 - 1.2, { align: 'center' });
    setText(pdf, COLORS.muted, 5.7);
    pdf.text(timeSlot.end, margin + timeWidth / 2, y + rowHeight / 2 + 3.5, { align: 'center' });

    DAYS.forEach((day, dayIndex) => {
      const x = margin + timeWidth + dayIndex * dayWidth;
      const entries = entriesByDay[dayIndex];
      fill(pdf, x, y, dayWidth, rowHeight, rowIndex % 2 === 0 ? COLORS.white : COLORS.rowAlt);

      entries.forEach((entry, entryIndex) => {
        const cardY = y + 2.5 + entryIndex * entryHeight;
        const cardHeight = Math.min(entryHeight - 1.3, y + rowHeight - cardY - 1.3);
        const accentColor = sectionName
          ? (entry.color ? hexToRgb(entry.color) : accent)
          : sectionColors[entry.sectionName] || accent;
        drawEntryCard(pdf, x + 1.5, cardY, dayWidth - 3, cardHeight, entry, accentColor, !sectionName);
      });
    });

    hLine(pdf, margin, margin + tableWidth, y + rowHeight, COLORS.border, 0.25);
    vLine(pdf, margin, y, y + rowHeight, COLORS.borderDark, 0.35);
    vLine(pdf, margin + timeWidth, y, y + rowHeight, COLORS.border, 0.3);
    for (let index = 1; index < DAYS.length; index++) {
      vLine(pdf, margin + timeWidth + index * dayWidth, y, y + rowHeight, COLORS.border, 0.2);
    }
    vLine(pdf, margin + tableWidth, y, y + rowHeight, COLORS.borderDark, 0.35);

    y += rowHeight;
  });

  hLine(pdf, margin, margin + tableWidth, y, COLORS.borderDark, 0.45);
  drawFooter(pdf, footerLabel);
};

export const exportSectionPDF = (routineName, schedule, slots, sectionName) => {
  const sectionSlots = slots.filter((slot) => slot.sectionName === sectionName);
  const accent = sectionSlots[0]?.color ? hexToRgb(sectionSlots[0].color) : COLORS.blue;
  const pdf = new jsPDF('landscape', 'mm', 'a4');

  drawWeekGrid(pdf, {
    routineName,
    schedule,
    slots,
    title: `${sectionName} Weekly Schedule`,
    subtitle: `${sectionSlots.length} classes scheduled`,
    sectionName,
    footerLabel: `${sectionName} - Weekly schedule`,
    accent,
  });

  pdf.save(`${String(sectionName || 'Section').replace(/\s+/g, '_')}_Schedule.pdf`);
};

export const exportDepartmentPDF = (routineName, schedule, slots) => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const labCount = slots.filter((slot) => slot.course?.type === 'lab').length;
  const sectionCount = new Set(slots.map((slot) => slot.sectionName).filter(Boolean)).size;

  drawWeekGrid(pdf, {
    routineName,
    schedule,
    slots,
    title: 'Department Master Routine',
    subtitle: `${slots.length} classes | ${labCount} labs | ${sectionCount} sections`,
    footerLabel: `${truncate(routineName, 42)} - Department master routine`,
    accent: COLORS.blue,
  });

  pdf.save(`${String(routineName || 'Department_Routine').replace(/\s+/g, '_')}_Master_Routine.pdf`);
};

export const exportRoomPDF = (routineName, schedule, slots, roomNumber) => {
  const roomSlots = slots.filter((slot) => slot.roomNumber === roomNumber);
  const pdf = new jsPDF('landscape', 'mm', 'a4');

  drawWeekGrid(pdf, {
    routineName,
    schedule,
    slots: roomSlots,
    title: `Room ${roomNumber} Schedule`,
    subtitle: `${roomSlots.length} classes scheduled`,
    footerLabel: `Room ${roomNumber} - Weekly schedule`,
    accent: COLORS.success,
  });

  pdf.save(`Room_${String(roomNumber || 'Schedule').replace(/\s+/g, '_')}_Schedule.pdf`);
};

export const exportToPDF = (routineName, timeSlots, slots) => {
  const schedule = timeSlots.length > 0
    ? { startTime: timeSlots[0]?.start, endTime: timeSlots[timeSlots.length - 1]?.end }
    : {};
  exportDepartmentPDF(routineName, schedule, slots);
};
