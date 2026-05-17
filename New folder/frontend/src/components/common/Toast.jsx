import React from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiXCircle, HiExclamation, HiInformationCircle } from 'react-icons/hi';

const icons = {
  success: HiCheckCircle,
  error: HiXCircle,
  warning: HiExclamation,
  info: HiInformationCircle,
};

const colors = {
  success: 'var(--md-sys-color-tertiary)',
  error: 'var(--md-sys-color-error)',
  warning: 'var(--md-sys-color-secondary)',
  info: 'var(--md-sys-color-primary)',
};

const Toast = ({ type = 'info', message, onClose }) => {
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        background: 'var(--md-sys-color-surface-container)',
        border: '1px solid var(--md-sys-color-outline-variant)',
        borderLeft: `4px solid ${colors[type]}`,
        borderRadius: 'var(--radius-extra-large)',
        boxShadow: 'var(--md-shadow-level3)',
        minWidth: '300px',
      }}
    >
      <Icon style={{ fontSize: 'var(--md-title-large)', color: colors[type], flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 'var(--md-body-medium)', color: 'var(--md-sys-color-on-surface)' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--md-sys-color-on-surface-variant)',
          padding: '4px',
          fontSize: '20px',
        }}
      >
        ×
      </button>
    </motion.div>
  );
};

export default Toast;