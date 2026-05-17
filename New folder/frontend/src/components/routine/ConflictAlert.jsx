import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamationCircle, HiX } from 'react-icons/hi';

const ConflictAlert = ({ conflicts, onDismiss }) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="conflict-alert"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="conflict-alert-icon">
          <HiExclamationCircle />
        </div>
        <div className="conflict-alert-content">
          <div className="conflict-alert-title">
            {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''} Detected
          </div>
          <div className="conflict-alert-message">
            {conflicts.map((conflict, index) => (
              <div key={index} style={{ marginBottom: index < conflicts.length - 1 ? '4px' : 0 }}>
                • {conflict.message}
              </div>
            ))}
          </div>
        </div>
        <button className="conflict-alert-dismiss" onClick={onDismiss}>
          <HiX />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConflictAlert;