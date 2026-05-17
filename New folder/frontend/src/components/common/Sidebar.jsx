import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebarOpen } from '../../redux/slices/uiSlice';

const menuItems = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', path: '/' },
      { name: 'Routine Maker', path: '/routine' },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Rooms & Labs', path: '/rooms' },
      { name: 'Sections', path: '/sections' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { name: 'Export PDF', path: '/export' },
      { name: 'Analytics', path: '/analytics' },
    ],
  },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state) => state.ui || {});
  const { user } = useSelector((state) => state.auth || {});

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 992) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="sidebar-section">
            <div className="sidebar-section-title">{section.title}</div>
            <nav className="sidebar-nav">
              {section.items.map((item, itemIndex) => (
                <NavLink
                  key={itemIndex}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeSidebarOnMobile}
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="sidebar-link-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}

        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            onClick={closeSidebarOnMobile}
          >
            <span>Settings</span>
          </NavLink>
          
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role">{user?.department || 'Department'}</div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}
    </>
  );
};

export default Sidebar;