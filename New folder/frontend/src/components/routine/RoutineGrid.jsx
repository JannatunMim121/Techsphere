import React from 'react';
import { useSelector } from 'react-redux';
import { Droppable } from '@hello-pangea/dnd';
import TimeSlot from './TimeSlot';
import { parseTime } from '../../utils/timeSlotGenerator';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

const RoutineGrid = ({ timeSlots, onSlotClick, onSlotDelete }) => {
  const { slots } = useSelector((state) => state.routine);

  // Get ALL slots for a given day/time, including lab continuation cells
  const getSlotsForCell = (day, timeSlot) => {
    if (timeSlot.isBreak) return [];

    const directMatches = slots.filter(
      (slot) => slot.day === day && slot.startTime === timeSlot.start
    );

    // Cells that fall inside a lab's 3-hour window (but are not the start)
    const cellStartMins = parseTime(timeSlot.start);
    const labContinuations = slots
      .filter((slot) => {
        if (slot.day !== day || !slot.isLab) return false;
        if (slot.startTime === timeSlot.start) return false;
        const labStart = parseTime(slot.startTime);
        const labEnd = parseTime(slot.endTime);
        return cellStartMins > labStart && cellStartMins < labEnd;
      })
      .map((slot) => ({ ...slot, isLabContinuation: true, _contCellTime: timeSlot.start }));

    return [...directMatches, ...labContinuations];
  };

  return (
    <div className="routine-grid-wrapper">
        <div className="routine-grid">
          {/* Header Row */}
          <div className="routine-header-cell time-header">Time</div>
          {DAYS.map((day) => (
            <div key={day} className="routine-header-cell day-header">
              {day}
            </div>
          ))}

          {/* Time Slots */}
          {timeSlots.map((timeSlot, rowIndex) => (
            <React.Fragment key={timeSlot.start}>
              {/* Time Column */}
              <div className={`routine-time-cell ${timeSlot.isBreak ? 'break' : ''}`}>
                <span className="time-start">{timeSlot.start}</span>
                <span className="time-end">{timeSlot.end}</span>
                {timeSlot.isBreak && <span style={{ fontSize: '10px' }}>Break</span>}
              </div>

              {/* Day Columns */}
              {DAYS.map((day) => {
                const cellSlots = getSlotsForCell(day, timeSlot);
                const droppableId = `${day}_${timeSlot.start}`;
                const isBreak = timeSlot.isBreak;

                return (
                  <Droppable key={droppableId} droppableId={droppableId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`routine-slot ${isBreak ? 'break-slot' : ''} ${
                          snapshot.isDraggingOver ? 'drag-over' : ''
                        } ${cellSlots.length === 0 && !isBreak ? 'droppable' : ''}`}
                        onClick={() => !isBreak && onSlotClick(day, timeSlot)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          padding: '4px',
                          minHeight: '80px',
                        }}
                      >
                        {cellSlots.length > 0 ? (
                          cellSlots.map((slotData) => (
                            <TimeSlot
                              key={slotData._id}
                              slot={slotData}
                              onDelete={(e) => {
                                e?.stopPropagation?.();
                                onSlotDelete(slotData._id);
                              }}
                            />
                          ))
                        ) : !isBreak ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'var(--text-muted)',
                            fontSize: 'var(--font-size-xs)',
                          }}>
                            + Add
                          </div>
                        ) : null}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </React.Fragment>
          ))}
        </div>
    </div>
  );
};

export default RoutineGrid;
