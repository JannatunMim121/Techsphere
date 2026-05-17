import React from 'react';
import { motion } from 'framer-motion';
import SectionCard from './SectionCard';
import { HiUserGroup } from 'react-icons/hi';

const SectionList = ({ sections, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card" style={{ height: '220px' }}>
            <div className="skeleton" style={{ height: '100%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="card empty-card">
        <div className="empty-card-icon">
          <HiUserGroup />
        </div>
        <h3 className="empty-card-title">No Sections Created</h3>
        <p className="empty-card-description">
          Create sections to organize your students by semester and batch.
          Add courses to each section for scheduling.
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
      {sections.map((section) => (
        <SectionCard
          key={section._id}
          section={section}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
};

export default SectionList;