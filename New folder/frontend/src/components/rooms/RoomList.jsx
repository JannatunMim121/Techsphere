import React from 'react';
import { motion } from 'framer-motion';
import RoomCard from './RoomCard';
import { HiOfficeBuilding } from 'react-icons/hi';

const RoomList = ({ rooms, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card" style={{ height: '200px' }}>
            <div className="skeleton" style={{ height: '100%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="card empty-card">
        <div className="empty-card-icon">
          <HiOfficeBuilding />
        </div>
        <h3 className="empty-card-title">No Rooms Added</h3>
        <p className="empty-card-description">
          Start by adding classrooms and lab rooms to your department.
          These will be used when creating your routine.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-3"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {rooms.map((room) => (
        <RoomCard
          key={room._id}
          room={room}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
};

export default RoomList;