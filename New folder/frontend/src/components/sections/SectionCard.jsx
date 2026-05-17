import React from 'react';
import { motion } from 'framer-motion';
import { HiUserGroup, HiAcademicCap, HiBookOpen, HiPencil, HiTrash } from 'react-icons/hi';

const SectionCard = ({ section, onEdit, onDelete }) => {
  return (
    <motion.div
      className="card section-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      style={{ borderLeftColor: section.color }}
    >
      <div 
        className="section-card-color" 
        style={{ background: `linear-gradient(90deg, ${section.color}, ${section.color}80)` }} 
      />

      <div className="section-card-name">{section.name}</div>

      <div className="section-card-meta">
        <span className="section-card-meta-item">
          <HiAcademicCap />
          Semester {section.semester}
        </span>
        <span className="section-card-meta-item">
          <HiUserGroup />
          {section.studentCount} students
        </span>
        <span className="section-card-meta-item">
          <HiBookOpen />
          {section.courses?.length || 0} courses
        </span>
      </div>

      {section.courses && section.courses.length > 0 && (
        <div className="section-card-courses">
          {section.courses.slice(0, 4).map((course, i) => (
            <span key={i} className="course-tag">
              {course.code}
            </span>
          ))}
          {section.courses.length > 4 && (
            <span className="course-tag">+{section.courses.length - 4} more</span>
          )}
        </div>
      )}

      <div className="card-footer">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(section)}>
          <HiPencil /> Edit
        </button>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => onDelete(section._id)}
          style={{ color: 'var(--error-500)' }}
        >
          <HiTrash /> Delete
        </button>
      </div>
    </motion.div>
  );
};

export default SectionCard;