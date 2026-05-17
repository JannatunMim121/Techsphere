import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { HiX, HiLocationMarker, HiUser } from 'react-icons/hi';

const TimeSlot = ({ slot, index = 0, onDelete, compact = false }) => {
  const isContinuation = slot.isLabContinuation === true;

  const getBackgroundStyle = () => {
    const color = slot.color || '#6366f1';
    if (isContinuation) {
      return {
        background: `repeating-linear-gradient(45deg, ${color}33, ${color}33 6px, ${color}55 6px, ${color}55 12px)`,
        borderColor: color,
        color: '#fff',
        opacity: 0.85,
      };
    }
    return {
      background: `linear-gradient(135deg, ${color}, ${color}dd)`,
      borderColor: color,
      color: '#fff',
    };
  };

  return (
    <Draggable
      draggableId={isContinuation ? `${slot._id}_cont_${(slot._contCellTime || '').replace(':', '')}` : slot._id}
      index={index}
      isDragDisabled={isContinuation}
    >
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(!isContinuation ? provided.dragHandleProps : {})}
          className="slot-content"
          style={{
            ...getBackgroundStyle(),
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : (isContinuation ? 0.85 : 1),
            padding: compact ? '6px 8px' : '8px',
            borderRadius: '6px',
            fontSize: compact ? '10px' : '11px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: isContinuation ? 'default' : 'grab',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: isContinuation ? 1 : 1.02 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: compact ? '10px' : '12px' }}>
              {slot.course?.code || 'N/A'}
            </span>
            {!isContinuation && (
              <button
                className="slot-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(e);
                }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  padding: 0,
                  fontSize: '10px',
                }}
              >
                <HiX />
              </button>
            )}
          </div>

          {!compact && (
            <div className="slot-course-title" style={{
              fontSize: '9px',
              opacity: 0.9,
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontStyle: isContinuation ? 'italic' : 'normal',
            }}>
              {isContinuation ? '(Lab cont.)' : slot.course?.title || ''}
            </div>
          )}

          <div className="slot-meta" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="slot-section" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: compact ? '9px' : '10px',
            }}>
              <HiUser style={{ fontSize: '10px', opacity: 0.8 }} />
              {slot.sectionName}
            </span>
            <span className="slot-room" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: compact ? '9px' : '10px',
              opacity: 0.9,
            }}>
              <HiLocationMarker style={{ fontSize: '10px' }} />
              {slot.roomNumber || 'TBA'}
            </span>
            {slot.teacher && (
              <span className="slot-teacher" style={{
                fontSize: compact ? '8px' : '9px',
                opacity: 0.8,
              }}>
                {slot.teacher}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </Draggable>
  );
};

export default TimeSlot;
