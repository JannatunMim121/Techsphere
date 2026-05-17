import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchRooms } from '../redux/slices/roomSlice';
import { fetchSections } from '../redux/slices/sectionSlice';
import { fetchRoutines } from '../redux/slices/routineSlice';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { rooms = [], classrooms = [], labs = [] } = useSelector((state) => state.rooms || {});
  const { sections = [] } = useSelector((state) => state.sections || {});
  const { routines = [] } = useSelector((state) => state.routine || {});

  useEffect(() => {
    dispatch(fetchRooms());
    dispatch(fetchSections());
    dispatch(fetchRoutines());
  }, [dispatch]);

  const stats = [
    {
      label: 'Total Rooms',
      value: rooms.length,
      color: 'primary',
      link: '/rooms',
    },
    {
      label: 'Classrooms',
      value: classrooms.length,
      color: 'primary',
      link: '/rooms',
    },
    {
      label: 'Lab Rooms',
      value: labs.length,
      color: 'primary',
      link: '/rooms',
    },
    {
      label: 'Sections',
      value: sections.length,
      color: 'primary',
      link: '/sections',
    },
  ];

  const quickActions = [
    {
      title: 'Create Routine',
      description: 'Start building a new class routine',
      link: '/routine',
    },
    {
      title: 'Add Room',
      description: 'Add a new classroom or lab',
      link: '/rooms',
    },
    {
      title: 'Create Section',
      description: 'Set up a new student section',
      link: '/sections',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
    >
      <div className="page-header">
        <motion.h1
          className="page-title"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </motion.h1>
        <p className="page-subtitle">
          Here is what is happening with your department today.
        </p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link} style={{ textDecoration: 'none' }}>
              <Card className="stats-card">
                <div className={`stats-card-icon ${stat.color}`}>
                  <span style={{ fontSize: 'var(--md-headline-medium)', fontWeight: 500 }}>{stat.value}</span>
                </div>
                <div className="stats-card-content">
                  <div className="stats-card-value">{stat.value}</div>
                  <div className="stats-card-label">{stat.label}</div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--md-headline-small)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link to={action.link} style={{ textDecoration: 'none' }}>
                <Card className="hover-lift" style={{ cursor: 'pointer' }}>
                  <h3 style={{ fontSize: 'var(--md-title-large)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>
                    {action.title}
                  </h3>
                  <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: 'var(--md-body-medium)' }}>
                    {action.description}
                  </p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--md-headline-small)', fontWeight: 500 }}>
            Recent Routines
          </h2>
          <Link to="/routine">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {routines.length === 0 ? (
          <Card className="empty-card">
            <h3 className="empty-card-title">No Routines Yet</h3>
            <p className="empty-card-description">
              Create your first routine to start organizing your department schedule.
            </p>
            <Link to="/routine">
              <Button variant="primary">
                Create Routine
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-3">
            {routines.slice(0, 3).map((routine, index) => (
              <motion.div
                key={routine._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Link to={`/routine/${routine._id}`} style={{ textDecoration: 'none' }}>
                  <Card>
                    <h3 style={{ fontWeight: 500, marginBottom: 'var(--space-2)' }}>
                      {routine.name}
                    </h3>
                    <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: 'var(--md-body-medium)', marginBottom: 'var(--space-3)' }}>
                      {routine.semester} - {routine.slots?.length || 0} slots
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: routine.isActive ? 'var(--success-500)' : 'var(--md-sys-color-outline)',
                        }}
                      />
                      <span style={{ fontSize: 'var(--md-label-small)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {routine.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;