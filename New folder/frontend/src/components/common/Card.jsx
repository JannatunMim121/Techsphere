import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  padding = true,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      className={`card ${className}`}
      style={{ padding: padding ? 'var(--space-6)' : 0 }}
      whileHover={hover ? { y: -4, boxShadow: 'var(--md-shadow-level2)' } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`card-title ${className}`}>{children}</h3>
);

export const CardSubtitle = ({ children, className = '' }) => (
  <p className={`card-subtitle ${className}`}>{children}</p>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);

export default Card;