import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

const DraggableItem = ({ item, index, type }) => {
  const draggableId = JSON.stringify({
    sectionId: item._id,
    sectionName: item.name,
    color: item.color,
    studentCount: item.studentCount,
  });

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`draggable-item ${snapshot.isDragging ? 'dragging' : ''}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="draggable-item-header">
            <div
              className="draggable-item-color"
              style={{ background: item.color || '#6366f1' }}
            />
            <span className="draggable-item-name">{item.name}</span>
          </div>
          <div className="draggable-item-meta">
            Semester {item.semester} • {item.studentCount} students
          </div>
          {item.courses && item.courses.length > 0 && (
            <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {item.courses.slice(0, 3).map((course, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {course.code}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </Draggable>
  );
};

export default DraggableItem;