import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HiSave,
  HiDownload,
  HiRefresh,
  HiCog,
  HiArrowLeft,
  HiArrowRight,
  HiExclamation,
} from 'react-icons/hi';
import Button from '../common/Button';
import { undo, redo } from '../../redux/slices/historySlice';

const RoutineToolbar = ({
  routineName,
  onNameChange,
  onSave,
  onExportPDF,
  onReset,
  onSettings,
  saving,
  conflicts,
}) => {
  const dispatch = useDispatch();
  const { past, future } = useSelector((state) => state.history);

  const totalConflicts = conflicts?.totalConflicts || 0;

  return (
    <div className="routine-toolbar">
      <div className="routine-toolbar-left">
        <input
          type="text"
          className="routine-name-input"
          placeholder="Routine Name..."
          value={routineName}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="routine-toolbar-right">
        {/* Conflict Indicator */}
        {totalConflicts > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            marginRight: 'var(--space-3)',
          }}>
            <HiExclamation style={{ color: 'var(--error-500)', fontSize: '18px' }} />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--error-500)', fontWeight: 600 }}>
              {totalConflicts} Conflict{totalConflicts > 1 ? 's' : ''}
            </span>
          </div>
        )}

        <motion.button
          className="btn btn-ghost btn-icon"
          onClick={() => dispatch(undo())}
          disabled={past.length === 0}
          whileTap={{ scale: 0.95 }}
          title="Undo (Ctrl+Z)"
        >
          <HiArrowLeft />
        </motion.button>

        <motion.button
          className="btn btn-ghost btn-icon"
          onClick={() => dispatch(redo())}
          disabled={future.length === 0}
          whileTap={{ scale: 0.95 }}
          title="Redo (Ctrl+Y)"
        >
          <HiArrowRight />
        </motion.button>

        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }} />

        <Button variant="ghost" size="sm" onClick={onReset}>
          <HiRefresh /> Reset
        </Button>

        <Button variant="ghost" size="sm" onClick={onSettings}>
          <HiCog /> Settings
        </Button>

        <Button variant="secondary" size="sm" onClick={onExportPDF}>
          <HiDownload /> Export PDF
        </Button>

        <Button variant="primary" size="sm" onClick={onSave} loading={saving}>
          <HiSave /> Save
        </Button>
      </div>
    </div>
  );
};

export default RoutineToolbar;