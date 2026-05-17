import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: '400px',
    md: '560px',
    lg: '720px',
    xl: '900px',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 'var(--z-modal-backdrop)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-4)',
            }}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.25,
                easing: [0.2, 0, 0, 1],
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: sizeClasses[size],
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                background: 'var(--md-sys-color-surface-container)',
                borderRadius: 'var(--radius-extra-large)',
                boxShadow: 'var(--md-shadow-level3)',
              }}
            >
              <div
                className="modal-header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-5) var(--space-6)',
                  borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                }}
              >
                <h2 style={{ 
                  fontFamily: 'var(--md-font-family)',
                  fontSize: 'var(--md-headline-small)',
                  fontWeight: 400,
                  color: 'var(--md-sys-color-on-surface)',
                  margin: 0,
                }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--md-motion-duration-short) var(--md-motion-easing-standard)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--md-sys-color-secondary-container)';
                    e.currentTarget.style.color = 'var(--md-sys-color-on-secondary-container)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)';
                  }}
                >
                  <HiX style={{ fontSize: 'var(--md-title-large)', color: 'var(--md-sys-color-on-surface-variant)' }} />
                </button>
              </div>
              <div
                className="modal-body"
                style={{ padding: 'var(--space-6)' }}
              >
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;