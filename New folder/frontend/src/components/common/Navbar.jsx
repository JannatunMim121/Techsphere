import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleSidebar, toggleDarkMode } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { darkMode } = useSelector((state) => state.ui || {});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <button 
            className="navbar-btn"
            onClick={() => dispatch(toggleSidebar())}
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
          >
            Menu
          </button>
          <Link to="/" className="navbar-brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-medium)',
              background: 'var(--md-sys-color-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--md-sys-color-on-primary-container)',
              fontFamily: 'var(--md-font-family)',
              fontSize: 'var(--md-title-large)',
              fontWeight: 500,
            }}>
              T
            </div>
            <span style={{
              fontFamily: 'var(--md-font-family)',
              fontSize: 'var(--md-title-large)',
              fontWeight: 500,
              color: 'var(--md-sys-color-on-surface)',
            }}>
              TeachSphere
            </span>
          </Link>
        </div>

        <div className="navbar-actions">
          <button
            className="navbar-btn"
            onClick={() => dispatch(toggleDarkMode())}
            style={{ 
              color: 'var(--md-sys-color-on-surface-variant)',
              fontFamily: 'var(--md-font-family)',
              fontSize: 'var(--md-label-medium)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="user-menu">
            <motion.div
              className="user-avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--md-font-family)',
                fontSize: 'var(--md-title-medium)',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
              }}
            >
              {getInitials(user?.name)}
            </motion.div>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: '224px',
                    background: 'var(--md-sys-color-surface-container-high)',
                    borderRadius: 'var(--radius-extra-large)',
                    boxShadow: 'var(--md-shadow-level3)',
                    padding: 'var(--space-2)',
                    zIndex: 'var(--z-dropdown)',
                  }}
                >
                  <div style={{ 
                    padding: '16px', 
                    borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                    textAlign: 'left'
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--md-font-family)',
                      fontSize: 'var(--md-title-small)',
                      fontWeight: 500,
                      color: 'var(--md-sys-color-on-surface)'
                    }}>
                      {user?.name || 'User'}
                    </div>
                    <div style={{ 
                      fontFamily: 'var(--md-font-family)',
                      fontSize: 'var(--md-body-small)', 
                      color: 'var(--md-sys-color-on-surface-variant)' 
                    }}>
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>
                  <Link 
                    to="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--md-sys-color-on-surface)',
                      textDecoration: 'none',
                      fontFamily: 'var(--md-font-family)',
                      fontSize: 'var(--md-label-large)',
                    }}
                    className="dropdown-item"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setDropdownOpen(false)}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--md-sys-color-on-surface)',
                      textDecoration: 'none',
                      fontFamily: 'var(--md-font-family)',
                      fontSize: 'var(--md-label-large)',
                    }}
                    className="dropdown-item"
                  >
                    Settings
                  </Link>
                  <div style={{ height: '1px', background: 'var(--md-sys-color-outline-variant)', margin: '8px 0' }} />
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--md-sys-color-error)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      fontFamily: 'var(--md-font-family)',
                      fontSize: 'var(--md-label-large)',
                      textAlign: 'left',
                    }}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;