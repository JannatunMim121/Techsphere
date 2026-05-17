import React from 'react';
import { motion } from 'framer-motion';
import { HiOfficeBuilding, HiBeaker, HiUsers, HiLocationMarker, HiPencil, HiTrash } from 'react-icons/hi';

const RoomCard = ({ room, onEdit, onDelete }) => {
  const isLab = room.type === 'lab';

  return (
    <motion.div
      className="card room-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <span className={`room-card-badge ${room.isAvailable ? 'available' : 'occupied'}`}>
        {room.isAvailable ? 'Available' : 'In Use'}
      </span>

      <div className={`room-card-icon ${room.type}`}>
        {isLab ? <HiBeaker /> : <HiOfficeBuilding />}
      </div>

      <div className="room-card-info">
        <div className="room-card-number">{room.roomNumber}</div>
        <div className="room-card-details">
          <span className="room-card-detail">
            <HiLocationMarker />
            Floor {room.floor}
          </span>
          <span className="room-card-detail">
            <HiUsers />
            {room.capacity} seats
          </span>
        </div>

        {isLab && room.equipment && room.equipment.length > 0 && (
          <div style={{ marginTop: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
              Equipment:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
              {room.equipment.slice(0, 3).map((eq, i) => (
                <span key={i} className="course-tag">{eq}</span>
              ))}
              {room.equipment.length > 3 && (
                <span className="course-tag">+{room.equipment.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(room)}>
          <HiPencil /> Edit
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onDelete(room._id)} style={{ color: 'var(--error-500)' }}>
          <HiTrash /> Delete
        </button>
      </div>
    </motion.div>
  );
};

export default RoomCard;