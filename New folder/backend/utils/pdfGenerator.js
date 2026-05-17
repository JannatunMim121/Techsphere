const PDFDocument = require('pdfkit');

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

/**
 * Generate Master/Department PDF - Improved readable format showing all sections weekly
 */
const generateMasterPDF = (routine, res) => {
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
    margins: { top: 25, bottom: 25, left: 15, right: 15 },
  });

  // Pipe to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${routine.department.replace(/\s+/g, '_')}_Master_Routine.pdf`
  );
  doc.pipe(res);

  // Title
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#2c3e50')
    .text(`${routine.department} - Master Routine`, { align: 'center' });

  doc.moveDown(0.2);

  // Subtitle
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#7f8c8d')
    .text(`Semester: ${routine.semester} | ${routine.slots.length} Total Classes`, {
      align: 'center',
    });

  doc
    .fontSize(7)
    .text(`Generated: ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`, { align: 'center' });

  doc.moveDown(0.4);

  // Get unique sections and their colors
  const sectionNames = [...new Set(routine.slots.map(s => s.sectionName))].sort();
  const sectionColors = {};
  const pastelColors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
  sectionNames.forEach((name, idx) => {
    sectionColors[name] = pastelColors[idx % pastelColors.length];
  });

  // Draw section legend
  const legendStartX = 20;
  const legendStartY = 60;
  let legendX = legendStartX;
  let legendY = legendStartY;
  
  doc.font('Helvetica-Bold').fontSize(6).fillColor('#2c3e50').text('Sections:', legendStartX, legendY, { align: 'left' });
  legendX += 38;
  
  sectionNames.forEach((section, idx) => {
    const color = sectionColors[section];
    
    if (legendX > doc.page.width - 60) {
      legendX = legendStartX;
      legendY += 8;
    }
    
    doc.circle(legendX + 3, legendY - 2.5, 3).fill(color);
    doc.font('Helvetica').fontSize(5).fillColor('#2c3e50').text(section, legendX + 7, legendY - 3, { width: 40 });
    legendX += 45;
  });

  doc.moveDown(0.5);

  // Generate time slots from schedule
  const timeSlots = generateTimeSlotsFromSchedule(routine.schedule);

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  
  const baseRowHeight = 18; // Base height for 1 slot
  const slotHeight = 15; // Height per additional slot
  
  // Create a separate page for each day
  DAYS.forEach((day, dayIndex) => {
    // Add new page for each day
    if (dayIndex > 0) {
      doc.addPage({ layout: 'landscape', size: 'A4' });
    }
    if (dayIndex === 0) {
      doc.addPage({ layout: 'landscape', size: 'A4' });
    }

    const pageWidth = doc.page.width - 30;
    const tableLeft = 15;
    const tableTop = 70;
    const timeColWidth = 40;
    const courseColWidth = 50;
    const sectionColWidth = 60;
    const roomColWidth = 55;
    const teacherColWidth = pageWidth - timeColWidth - courseColWidth - sectionColWidth - roomColWidth;
    const headerHeight = 14;

    // Day title - VERY PROMINENT
    doc
      .rect(tableLeft, tableTop - 16, 60, 14)
      .fill('#2c3e50');
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#ffffff')
      .text(day, tableLeft, tableTop - 12, { align: 'left' });

    // Draw table header
    drawMasterTableHeader(doc, tableLeft, tableTop, timeColWidth, courseColWidth, sectionColWidth, roomColWidth, teacherColWidth, headerHeight);

    // Draw table rows for this day
    let currentY = tableTop + headerHeight;

    timeSlots.forEach((timeSlot, rowIndex) => {
      // Find ALL slots for this day and time
      const daySlots = routine.slots.filter(
        (slot) => slot.day === day && slot.startTime === timeSlot.start
      );
      
      // DYNAMIC row height based on number of slots
      const dynamicRowHeight = baseRowHeight + (Math.max(0, daySlots.length - 1) * slotHeight);
      
      // Check if we need a new page for this day
      if (currentY + dynamicRowHeight > doc.page.height - 35) {
        doc.addPage({ layout: 'landscape', size: 'A4' });
        currentY = 25;
        drawMasterTableHeader(doc, tableLeft, currentY, timeColWidth, courseColWidth, sectionColWidth, roomColWidth, teacherColWidth, headerHeight);
        currentY += headerHeight;
      }

      const isBreak = timeSlot.isBreak;
      const bgColor = isBreak ? '#fff9e6' : (rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa');

      // Time column
      doc
        .rect(tableLeft, currentY, timeColWidth, dynamicRowHeight)
        .fillAndStroke(bgColor, '#d0d3d8');

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#2c3e50')
        .text(timeSlot.start, tableLeft + 3, currentY + 7, {
          width: timeColWidth - 6,
          align: 'left',
        });

      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#7f8c8d')
        .text(timeSlot.end, tableLeft + 3, currentY + 14, {
          width: timeColWidth - 6,
          align: 'left',
        });

      if (isBreak) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(7)
          .fillColor('#d68910')
          .text('Break', tableLeft + 3, currentY + 19, {
            width: timeColWidth - 6,
            align: 'left',
          });
      }

      // Course column - stack all courses
      const courseX = tableLeft + timeColWidth;
      doc
        .rect(courseX, currentY, courseColWidth, dynamicRowHeight)
        .fillAndStroke('#ffffff', '#d0d3d8');

      if (daySlots.length > 0) {
        daySlots.forEach((slotData, slotIdx) => {
          const color = sectionColors[slotData.sectionName] || '#3498db';
          const slotY = currentY + (slotIdx * slotHeight);
          
          // Colored left border
          doc
            .rect(courseX, slotY, 2.5, slotHeight)
            .fill(color);
          
          // Horizontal separator line between slots
          doc
            .strokeColor('#d0d3d8')
            .lineWidth(0.3)
            .moveTo(courseX, slotY + slotHeight)
            .lineTo(courseX + courseColWidth, slotY + slotHeight)
            .stroke();
          
          doc
            .font('Helvetica-Bold')
            .fontSize(7)
            .fillColor('#2c3e50')
            .text(slotData.course?.code || 'N/A', courseX + 6, slotY + 9, {
              width: courseColWidth - 10,
              align: 'left',
            });
        });
      }

      // Section column - stack all sections
      const sectionX = courseX + courseColWidth;
      doc
        .rect(sectionX, currentY, sectionColWidth, dynamicRowHeight)
        .fillAndStroke('#ffffff', '#d0d3d8');

      if (daySlots.length > 0) {
        daySlots.forEach((slotData, slotIdx) => {
          const slotY = currentY + (slotIdx * slotHeight);
          
          // Horizontal separator line between slots
          doc
            .strokeColor('#d0d3d8')
            .lineWidth(0.3)
            .moveTo(sectionX, slotY + slotHeight)
            .lineTo(sectionX + sectionColWidth, slotY + slotHeight)
            .stroke();
          
          doc
            .font('Helvetica')
            .fontSize(6)
            .fillColor('#2c3e50')
            .text(slotData.sectionName, sectionX + 3, slotY + 9, {
              width: sectionColWidth - 6,
              align: 'left',
            });
        });
      }

      // Room column - stack all rooms
      const roomX = sectionX + sectionColWidth;
      doc
        .rect(roomX, currentY, roomColWidth, dynamicRowHeight)
        .fillAndStroke('#ffffff', '#d0d3d8');

      if (daySlots.length > 0) {
        daySlots.forEach((slotData, slotIdx) => {
          const slotY = currentY + (slotIdx * slotHeight);
          
          // Horizontal separator line between slots
          doc
            .strokeColor('#d0d3d8')
            .lineWidth(0.3)
            .moveTo(roomX, slotY + slotHeight)
            .lineTo(roomX + roomColWidth, slotY + slotHeight)
            .stroke();
          
          doc
            .font('Helvetica-Bold')
            .fontSize(7)
            .fillColor('#3498db')
            .text(slotData.roomNumber || 'N/A', roomX + 3, slotY + 9, {
              width: roomColWidth - 6,
              align: 'left',
            });
        });
      }

      // Teacher column - stack all teachers
      const teacherX = roomX + roomColWidth;
      doc
        .rect(teacherX, currentY, teacherColWidth, dynamicRowHeight)
        .fillAndStroke('#ffffff', '#d0d3d8');

      if (daySlots.length > 0) {
        daySlots.forEach((slotData, slotIdx) => {
          const slotY = currentY + (slotIdx * slotHeight);
          const teacherText = slotData.teacher || 'TBA';
          
          // Horizontal separator line between slots
          doc
            .strokeColor('#d0d3d8')
            .lineWidth(0.3)
            .moveTo(teacherX, slotY + slotHeight)
            .lineTo(teacherX + teacherColWidth, slotY + slotHeight)
            .stroke();
          
          doc
            .font('Helvetica')
            .fontSize(6)
            .fillColor('#34495e')
            .text(teacherText, teacherX + 3, slotY + 9, {
              width: teacherColWidth - 6,
              align: 'left',
            });
        });
      }

      currentY += dynamicRowHeight;
    });
  });

  // Footer
  const footerY = doc.page.height - 18;
  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#bdc3c7')
    .text(
      `TeachSphere - ${routine.department} Master Routine | Total Sections: ${sectionNames.length}`,
      15,
      footerY,
      { align: 'center', width: doc.page.width - 30 }
    );

  doc.end();
};

/**
 * Draw master table header - DARK background for visibility
 */
const drawMasterTableHeader = (doc, x, y, timeColWidth, courseColWidth, sectionColWidth, roomColWidth, teacherColWidth, height) => {
  const headerBg = '#2c3e50'; // Dark gray-blue
  const headerBorder = '#2c3e50';
  const headerText = '#ffffff'; // White text
  
  // Time header
  doc
    .rect(x, y, timeColWidth, height)
    .fillAndStroke(headerBg, headerBorder);

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(headerText)
    .text('Time', x, y + height / 2 - 4, {
      width: timeColWidth,
      align: 'center',
    });

  // Course Code header
  doc
    .rect(x + timeColWidth, y, courseColWidth, height)
    .fillAndStroke(headerBg, headerBorder);

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(headerText)
    .text('Course Code', x + timeColWidth, y + height / 2 - 4, {
      width: courseColWidth,
      align: 'center',
    });

  // Section header
  doc
    .rect(x + timeColWidth + courseColWidth, y, sectionColWidth, height)
    .fillAndStroke(headerBg, headerBorder);

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(headerText)
    .text('Section', x + timeColWidth + courseColWidth, y + height / 2 - 4, {
      width: sectionColWidth,
      align: 'center',
    });

  // Room No. header
  doc
    .rect(x + timeColWidth + courseColWidth + sectionColWidth, y, roomColWidth, height)
    .fillAndStroke(headerBg, headerBorder);

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(headerText)
    .text('Room No.', x + timeColWidth + courseColWidth + sectionColWidth, y + height / 2 - 4, {
      width: roomColWidth,
      align: 'center',
    });

  // Teacher header
  doc
    .rect(x + timeColWidth + courseColWidth + sectionColWidth + roomColWidth, y, teacherColWidth, height)
    .fillAndStroke(headerBg, headerBorder);

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(headerText)
    .text('Teacher', x + timeColWidth + courseColWidth + sectionColWidth + roomColWidth, y + height / 2 - 4, {
      width: teacherColWidth,
      align: 'center',
    });
};

/**
 * Generate Routine PDF (Section-wise view)
 */
const generateRoutinePDF = (routine, res) => {
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
  });

  // Pipe to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=routine-${routine.name.replace(/\s+/g, '_')}.pdf`
  );
  doc.pipe(res);

  // Title
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor('#1e293b')
    .text(routine.name, { align: 'center' });

  doc.moveDown(0.3);

  // Subtitle
  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor('#64748b')
    .text(`Department: ${routine.department} | Semester: ${routine.semester}`, {
      align: 'center',
    });

  doc
    .fontSize(9)
    .text(`Generated on: ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`, { align: 'center' });

  doc.moveDown(1);

  // Table configuration
  const tableTop = 120;
  const tableLeft = 40;
  const pageWidth = doc.page.width - 80;
  const timeColWidth = 70;
  const dayColWidth = (pageWidth - timeColWidth) / DAYS.length;
  const headerHeight = 28;
  const rowHeight = 50;

  // Generate time slots from routine schedule
  const timeSlots = generateTimeSlotsFromSchedule(routine.schedule);

  // Draw table header
  drawTableHeader(doc, tableLeft, tableTop, timeColWidth, dayColWidth, headerHeight);

  // Draw table rows
  let currentY = tableTop + headerHeight;

  timeSlots.forEach((timeSlot, rowIndex) => {
    // Check if we need a new page
    if (currentY + rowHeight > doc.page.height - 60) {
      doc.addPage({ layout: 'landscape', size: 'A4' });
      currentY = 40;
      drawTableHeader(doc, tableLeft, currentY, timeColWidth, dayColWidth, headerHeight);
      currentY += headerHeight;
    }

    // Draw time cell
    const isBreak = timeSlot.isBreak;
    const bgColor = isBreak ? '#fef3c7' : rowIndex % 2 === 0 ? '#f8fafc' : '#f1f5f9';

    // Time column
    doc
      .rect(tableLeft, currentY, timeColWidth, rowHeight)
      .fillAndStroke(bgColor, '#e2e8f0');

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#1e293b')
      .text(timeSlot.start, tableLeft + 5, currentY + 12, {
        width: timeColWidth - 10,
        align: 'center',
      });

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#64748b')
      .text(timeSlot.end, tableLeft + 5, currentY + 24, {
        width: timeColWidth - 10,
        align: 'center',
      });

    if (isBreak) {
      doc
        .font('Helvetica-Oblique')
        .fontSize(7)
        .fillColor('#b45309')
        .text('Break', tableLeft + 5, currentY + 36, {
          width: timeColWidth - 10,
          align: 'center',
        });
    }

    // Day columns
    DAYS.forEach((day, dayIndex) => {
      const x = tableLeft + timeColWidth + dayIndex * dayColWidth;

      doc
        .rect(x, currentY, dayColWidth, rowHeight)
        .fillAndStroke(bgColor, '#e2e8f0');

      if (isBreak) {
        if (dayIndex === 2) {
          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#b45309')
            .text('BREAK', x + 5, currentY + rowHeight / 2 - 5, {
              width: dayColWidth - 10,
              align: 'center',
            });
        }
      } else {
        // Find slot for this cell
        const slotData = routine.slots.find(
          (slot) => slot.day === day && slot.startTime === timeSlot.start
        );

        if (slotData) {
          // Draw colored indicator
          doc
            .rect(x, currentY, 4, rowHeight)
            .fill(slotData.color || '#6366f1');

          // Course code
          doc
            .font('Helvetica-Bold')
            .fontSize(8)
            .fillColor('#1e293b')
            .text(slotData.course?.code || 'N/A', x + 8, currentY + 6, {
              width: dayColWidth - 16,
            });

          // Course title (truncated)
          const title = slotData.course?.title || '';
          const truncatedTitle = title.length > 25 ? title.substring(0, 25) + '...' : title;
          doc
            .font('Helvetica')
            .fontSize(7)
            .fillColor('#334155')
            .text(truncatedTitle, x + 8, currentY + 18, {
              width: dayColWidth - 16,
            });

          // Section and Room
          doc
            .font('Helvetica')
            .fontSize(6)
            .fillColor('#64748b')
            .text(`${slotData.sectionName || ''}`, x + 8, currentY + 32, {
              width: dayColWidth - 16,
            });

          doc
            .text(`Room: ${slotData.roomNumber || 'TBA'}`, x + 8, currentY + 40, {
              width: dayColWidth - 16,
            });
        }
      }
    });

    currentY += rowHeight;
  });

  // Footer
  const footerY = doc.page.height - 30;
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#94a3b8')
    .text(
      'TeachSphere - Intelligent Routine Management System',
      tableLeft,
      footerY,
      { align: 'center', width: pageWidth }
    );

  doc.end();
};

/**
 * Draw table header
 */
const drawTableHeader = (doc, x, y, timeColWidth, dayColWidth, height) => {
  // Time header
  doc
    .rect(x, y, timeColWidth, height)
    .fillAndStroke('#6366f1', '#4f46e5');

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#ffffff')
    .text('Time', x, y + height / 2 - 5, {
      width: timeColWidth,
      align: 'center',
    });

  // Day headers
  DAYS.forEach((day, index) => {
    const dayX = x + timeColWidth + index * dayColWidth;

    doc
      .rect(dayX, y, dayColWidth, height)
      .fillAndStroke('#6366f1', '#4f46e5');

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#ffffff')
      .text(day, dayX, y + height / 2 - 5, {
        width: dayColWidth,
        align: 'center',
      });
  });
};

/**
 * Generate time slots from schedule settings
 */
const generateTimeSlotsFromSchedule = (schedule) => {
  const slots = [];
  const {
    startTime = '08:00',
    endTime = '17:30',
    classDuration = 50,
    shortBreak = 10,
    longBreakStart = '10:50',
    longBreakEnd = '11:30',
  } = schedule || {};

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
      });
      current = longEnd;
      continue;
    }

    // Check if next slot would overlap with long break
    const slotEnd = current + classDuration;
    if (current < longStart && slotEnd > longStart) {
      current = longStart;
      continue;
    }

    // Regular class slot
    if (slotEnd <= end) {
      slots.push({
        start: formatTime(current),
        end: formatTime(slotEnd),
        isBreak: false,
      });
      current = slotEnd + shortBreak;
    } else {
      break;
    }
  }

  return slots;
};

/**
 * Parse time string to minutes
 */
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Format minutes to time string
 */
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Convert HSL color to Hex (for PDF rendering)
 */
const hslToHex = (hsl) => {
  if (hsl.startsWith('#')) return hsl;
  
  // Parse hsl(H, S%, L%)
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (!match) return '#6366f1'; // Default indigo
  
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Generate Section-wise PDF
 */
const generateSectionPDF = (routine, sectionName, res) => {
  const filteredRoutine = {
    ...routine,
    name: `${sectionName} - Schedule`,
    slots: routine.slots.filter((slot) => slot.sectionName === sectionName),
  };
  generateRoutinePDF(filteredRoutine, res);
};

/**
 * Generate Room-wise PDF
 */
const generateRoomPDF = (routine, roomNumber, res) => {
  const filteredRoutine = {
    ...routine,
    name: `Room ${roomNumber} - Schedule`,
    slots: routine.slots.filter((slot) => slot.roomNumber === roomNumber),
  };
  generateRoutinePDF(filteredRoutine, res);
};

module.exports = {
  generateRoutinePDF,
  generateSectionPDF,
  generateRoomPDF,
  generateMasterPDF,
  generateTimeSlotsFromSchedule,
  hslToHex,
};