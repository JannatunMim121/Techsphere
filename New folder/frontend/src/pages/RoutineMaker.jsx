import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { HiPlus, HiCalendar, HiAcademicCap, HiOfficeBuilding, HiTrash, HiDocumentText, HiExclamation, HiInformationCircle, HiUser, HiFolder } from 'react-icons/hi';
import {
  fetchRoutine,
  createRoutine,
  updateRoutine,
  resetRoutine,
  setCurrentRoutine,
  addLocalSlot,
  removeLocalSlot,
  updateLocalSlot,
  restoreSlots,
} from '../redux/slices/routineSlice';
import { fetchSections } from '../redux/slices/sectionSlice';
import { fetchRooms } from '../redux/slices/roomSlice';
import { pushState } from '../redux/slices/historySlice';
import RoutineGrid from '../components/routine/RoutineGrid';
import RoutineToolbar from '../components/routine/RoutineToolbar';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { generateTimeSlots } from '../utils/timeSlotGenerator';
import { exportDepartmentPDF, exportSectionPDF } from '../utils/pdfExport';
import { checkConflicts } from '../utils/conflictChecker';
import { parseTime, formatTime } from '../utils/timeSlotGenerator';
import toast from 'react-hot-toast';

const DEFAULT_SCHEDULE = {
  startTime: '08:00',
  endTime: '17:30',
  classDuration: 50,
  shortBreak: 10,
  longBreakStart: '10:50',
  longBreakEnd: '11:30',
  labDuration: 180,
};

const RoutineMaker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentRoutine, slots = [], loading, saving, conflicts } = useSelector((state) => state.routine || {});
  const { sections = [] } = useSelector((state) => state.sections || {});
  const { rooms = [] } = useSelector((state) => state.rooms || {});

  // Routine type: 'department' or 'section'
  const [routineType, setRoutineType] = useState('department');
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [routineName, setRoutineName] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [scheduleSettings, setScheduleSettings] = useState(DEFAULT_SCHEDULE);
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState(null);
  const [slotForm, setSlotForm] = useState({
    sectionId: '',
    courseIndex: 0,
    roomId: '',
    teacher: '',
  });

  // Track saved routine id to detect transitions FROM saved → new
  const currentRoutineIdRef = useRef(null);
  currentRoutineIdRef.current = currentRoutine?._id || null;

  // Get selected section details
  const selectedSection = sections.find(s => s._id === selectedSectionId);
  const selectedSectionData = sections.find(s => s._id === slotForm.sectionId);

  // Get courses for selected section(s)
  const availableCourses = routineType === 'department'
    ? sections.flatMap(s => s.courses?.map(c => ({ ...c, sectionName: s.name, sectionId: s._id, color: s.color })) || [])
    : selectedSection?.courses?.map(c => ({ ...c, sectionName: selectedSection.name, sectionId: selectedSection._id, color: selectedSection.color })) || [];

  useEffect(() => {
    dispatch(fetchSections());
    dispatch(fetchRooms());

    if (id) {
      dispatch(fetchRoutine(id));
    } else if (currentRoutineIdRef.current) {
      // Navigating from a saved routine → new: clear the old data
      dispatch(resetRoutine());
    }
    // Otherwise keep existing draft in Redux (navigated away temporarily)
    // No cleanup: unmounting should NOT wipe unsaved work
  }, [dispatch, id]);

  // Restore draft from localStorage after a page refresh (Redux is empty)
  useEffect(() => {
    if (!id && slots.length === 0 && !currentRoutine) {
      try {
        const saved = localStorage.getItem('routine_draft');
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.routineName) setRoutineName(draft.routineName);
          if (draft.department) setDepartment(draft.department);
          if (draft.semester) setSemester(draft.semester);
          if (draft.routineType) setRoutineType(draft.routineType);
          if (draft.selectedSectionId) setSelectedSectionId(draft.selectedSectionId);
          if (draft.scheduleSettings) setScheduleSettings(draft.scheduleSettings);
          if (draft.slots?.length > 0) dispatch(restoreSlots(draft.slots));
        }
      } catch (_) {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist draft to localStorage whenever it changes (survives page refresh)
  useEffect(() => {
    if (!id) {
      try {
        localStorage.setItem('routine_draft', JSON.stringify({
          slots,
          routineName,
          department,
          semester,
          routineType,
          selectedSectionId,
          scheduleSettings,
        }));
      } catch (_) {}
    }
  }, [slots, routineName, department, semester, routineType, selectedSectionId, scheduleSettings, id]);

  useEffect(() => {
    if (currentRoutine) {
      setRoutineName(currentRoutine.name);
      setDepartment(currentRoutine.department || '');
      setSemester(currentRoutine.semester || '');
      setRoutineType(currentRoutine.routineType || 'department');
      setSelectedSectionId(currentRoutine.targetSections?.[0] || null);
      setScheduleSettings(currentRoutine.schedule || DEFAULT_SCHEDULE);
    } else {
      setRoutineType('department');
      setRoutineName('New Department Routine');
    }
  }, [currentRoutine]);

  useEffect(() => {
    const generatedSlots = generateTimeSlots(scheduleSettings);
    setTimeSlots(generatedSlots);
  }, [scheduleSettings]);

  const handleSlotClick = (day, timeSlot) => {
    setSelectedSlotInfo({ day, timeSlot });
    setSlotForm({
      sectionId: routineType === 'section' ? selectedSectionId : '',
      courseIndex: 0,
      roomId: '',
      teacher: '',
    });
    setSlotModalOpen(true);
  };

  const handleSlotDelete = (slotId) => {
    dispatch(pushState(slots));
    dispatch(removeLocalSlot(slotId));
    toast.success('Slot removed');
  };

  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const [day, startTime] = destination.droppableId.split('_');

    if (source.droppableId === 'sections-panel') {
      const newSlot = {
        _id: `temp_${Date.now()}`,
        day,
        startTime,
        endTime: calculateEndTime(startTime, 50),
        ...JSON.parse(draggableId),
      };

      const slotConflicts = checkConflicts(newSlot, slots, rooms);
      if (slotConflicts.length > 0) {
        toast.error(slotConflicts[0].message);
        return;
      }

      dispatch(pushState(slots));
      dispatch(addLocalSlot(newSlot));
      return;
    }

    const slotToMove = slots.find((slot) => slot._id === draggableId);
    if (!slotToMove) return;

    const updatedSlot = {
      ...slotToMove,
      day,
      startTime,
      endTime: calculateEndTime(startTime, 50),
    };

    const slotConflicts = checkConflicts(
      updatedSlot,
      slots.filter((slot) => slot._id !== draggableId),
      rooms
    );

    if (slotConflicts.length > 0) {
      toast.error(slotConflicts[0].message);
      return;
    }

    dispatch(pushState(slots));
    dispatch(updateLocalSlot(updatedSlot));
  };

  const handleAddSlot = () => {
    if (!slotForm.sectionId || !slotForm.roomId) {
      toast.error('Please select section and room');
      return;
    }

    const section = sections.find((s) => s._id === slotForm.sectionId);
    const room = rooms.find((r) => r._id === slotForm.roomId);
    const course = section?.courses?.[slotForm.courseIndex];

    if (!section || !room) {
      toast.error('Invalid selection');
      return;
    }

    // Check capacity
    if (section.studentCount > room.capacity) {
      toast.error(`Room capacity (${room.capacity}) is less than section size (${section.studentCount})`);
      return;
    }

    // Calculate endTime based on course type
    let endTime = selectedSlotInfo.timeSlot.end;
    if (course?.type === 'lab') {
      // Lab is 3 hours (180 minutes)
      const startMinutes = parseTime(selectedSlotInfo.timeSlot.start);
      const endMinutes = startMinutes + 180; // 3 hours = 180 minutes
      endTime = formatTime(endMinutes);
    }

    const newSlot = {
      _id: `temp_${Date.now()}`,
      day: selectedSlotInfo.day,
      startTime: selectedSlotInfo.timeSlot.start,
      endTime: endTime,
      section: section._id,
      sectionName: section.name,
      course: course || { code: 'TBA', title: 'To Be Assigned', type: 'theory' },
      room: room._id,
      roomNumber: room.roomNumber,
      teacher: slotForm.teacher || course?.teacher || '',
      color: section.color,
      isLab: course?.type === 'lab',
    };

    // Check for conflicts BEFORE adding
    const conflicts = checkConflicts(newSlot, slots, rooms);

    if (conflicts.length > 0) {
      // Block adding if there are conflicts
      toast.error(conflicts[0].message);
      return;
    }

    dispatch(pushState(slots));
    dispatch(addLocalSlot(newSlot));
    setSlotModalOpen(false);
    toast.success('Slot added successfully');
  };

  const handleSave = async () => {
    if (!routineName.trim()) {
      toast.error('Please enter a routine name');
      return;
    }

    if (!department.trim()) {
      toast.error('Please enter department name');
      return;
    }

    if (!semester.trim()) {
      toast.error('Please enter semester');
      return;
    }

    if (routineType === 'section' && !selectedSectionId) {
      toast.error('Please select a section');
      return;
    }

    const routineData = {
      name: routineName,
      department,
      semester,
      routineType,
      targetSections: routineType === 'department' 
        ? sections.map(s => s._id) 
        : [selectedSectionId],
      schedule: scheduleSettings,
      slots: slots,
      workingDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    };

    try {
      if (currentRoutine?._id) {
        await dispatch(updateRoutine({ id: currentRoutine._id, data: routineData })).unwrap();
        toast.success('Routine updated successfully');
      } else {
        const result = await dispatch(createRoutine(routineData)).unwrap();
        localStorage.removeItem('routine_draft');
        toast.success('Routine created successfully');
        navigate(`/routine/${result._id}`);
      }
    } catch (err) {
      toast.error(err || 'Failed to save routine');
    }
  };

  const handleExportDepartmentPDF = () => {
    exportDepartmentPDF(routineName, scheduleSettings, slots);
    toast.success('Department PDF exported successfully');
  };

  const handleExportSectionPDF = (sectionName) => {
    exportSectionPDF(routineName, scheduleSettings, slots, sectionName);
    toast.success(`${sectionName} PDF exported successfully`);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the routine? All unsaved changes will be lost.')) {
      dispatch(resetRoutine());
      localStorage.removeItem('routine_draft');
      setRoutineName(routineType === 'department' ? 'New Department Routine' : 'New Section Routine');
      setDepartment('');
      setSemester('');
      toast.success('Routine reset');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading routine...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="routine-container"
    >
      <RoutineToolbar
        routineName={routineName}
        onNameChange={setRoutineName}
        onSave={handleSave}
        onExportPDF={routineType === 'department' ? handleExportDepartmentPDF : () => handleExportSectionPDF(selectedSection?.name || 'Section')}
        onReset={handleReset}
        onSettings={() => setSettingsModalOpen(true)}
        saving={saving}
        conflicts={conflicts}
      />

      {/* Routine Type and Settings Card */}
      <Card style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {/* Routine Type Toggle */}
          <div className="form-group">
            <label className="form-label">Routine Type</label>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                className={`btn-option ${routineType === 'department' ? 'active' : ''}`}
                onClick={() => setRoutineType('department')}
                type="button"
              >
                <HiOfficeBuilding /> Department
              </button>
              <button
                className={`btn-option ${routineType === 'section' ? 'active' : ''}`}
                onClick={() => setRoutineType('section')}
                type="button"
              >
                <HiAcademicCap /> Section
              </button>
            </div>
          </div>

          {/* Department */}
          <div className="form-group">
            <label className="form-label required">Department</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., CSE, EEE, ME"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          {/* Semester */}
          <div className="form-group">
            <label className="form-label required">Semester</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., 2, 3, Fall 2024"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
          </div>

          {/* Section Selector (for Section mode) */}
          {routineType === 'section' && (
            <div className="form-group">
              <label className="form-label required">Select Section</label>
              <select
                className="form-select"
                value={selectedSectionId || ''}
                onChange={(e) => setSelectedSectionId(e.target.value)}
              >
                <option value="">Choose a section</option>
                {sections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-3)',
          background: routineType === 'department' ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-tertiary-container)',
          border: 'none',
          borderRadius: 'var(--radius-medium)',
        }}>
          <p style={{ fontFamily: 'var(--md-font-family)', fontSize: 'var(--md-body-medium)', color: routineType === 'department' ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-tertiary-container)' }}>
{routineType === 'department' 
               ? 'Department Mode: Add classes for ALL sections in one grid. Multiple sections can have classes at the same time in different rooms.'
               : 'Section Mode: Create a routine for a single section only.'}
          </p>
        </div>
      </Card>

      {/* Conflict Warning */}
      {conflicts && conflicts.totalConflicts > 0 && (
        <Card style={{ marginBottom: 'var(--space-6)', background: 'var(--md-sys-color-error-container)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--md-sys-color-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
            }}>!</div>
            <h3 style={{ color: 'var(--md-sys-color-on-error-container)', fontFamily: 'var(--md-font-family)', fontSize: 'var(--md-title-medium)', fontWeight: 500 }}>Conflicts Detected ({conflicts.totalConflicts})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: '200px', overflowY: 'auto' }}>
            {conflicts.teacherConflicts?.map((conflict, idx) => (
              <p key={idx} style={{ fontFamily: 'var(--md-font-family)', fontSize: 'var(--md-body-medium)', color: 'var(--md-sys-color-on-error-container)', padding: 'var(--space-2)', background: 'var(--md-sys-color-error)', borderRadius: 'var(--radius-extra-small)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiUser style={{ color: 'var(--md-sys-color-on-error)' }} /> {conflict.message}
              </p>
            ))}
            {conflicts.roomConflicts?.map((conflict, idx) => (
              <p key={idx} style={{ fontFamily: 'var(--md-font-family)', fontSize: 'var(--md-body-medium)', color: 'var(--md-sys-color-on-error-container)', padding: 'var(--space-2)', background: 'var(--md-sys-color-error)', borderRadius: 'var(--radius-extra-small)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOfficeBuilding style={{ color: 'var(--md-sys-color-on-error)' }} /> {conflict.message}
              </p>
            ))}
            {conflicts.sectionConflicts?.map((conflict, idx) => (
              <p key={idx} style={{ fontFamily: 'var(--md-font-family)', fontSize: 'var(--md-body-medium)', color: 'var(--md-sys-color-on-error-container)', padding: 'var(--space-2)', background: 'var(--md-sys-color-error)', borderRadius: 'var(--radius-extra-small)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiAcademicCap style={{ color: 'var(--md-sys-color-on-error)' }} /> {conflict.message}
              </p>
            ))}
          </div>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
        {/* Left Panel - Courses */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          <div className="draggable-panel">
            <div className="draggable-panel-header">
              <h3 className="draggable-panel-title">
                {routineType === 'department' ? 'All Sections & Courses' : 'Section Courses'}
              </h3>
            </div>

            {sections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                <HiCalendar style={{ fontSize: 'var(--md-headline-medium)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--space-2)' }} />
                <p style={{ fontSize: 'var(--md-body-medium)' }}>No sections available</p>
                <Button variant="ghost" size="sm" onClick={() => navigate('/sections')} style={{ marginTop: 'var(--space-2)' }}>
                  <HiPlus /> Add Sections
                </Button>
              </div>
            ) : routineType === 'department' ? (
              // Department Mode: Show all sections with their courses
              <Droppable droppableId="sections-panel" isDropDisabled={true}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="draggable-panel-content" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {sections.map((section) => (
                      <div key={section._id} style={{ marginBottom: 'var(--space-4)' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          padding: 'var(--space-2)',
                          background: `${section.color}20`,
                          borderRadius: 'var(--radius-md)',
                          marginBottom: 'var(--space-2)',
                        }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: 'var(--radius-full)',
                            background: section.color,
                          }} />
                          <span style={{ fontWeight: 600, fontSize: 'var(--md-body-medium)' }}>{section.name}</span>
                          <span style={{ fontSize: 'var(--md-label-small)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                            ({section.courses?.length || 0} courses)
                          </span>
                        </div>
                        <div style={{ paddingLeft: 'var(--space-3)' }}>
                          {section.courses?.map((course, idx) => {
                            const dragData = JSON.stringify({ section: section._id, sectionName: section.name, color: section.color, course });
                            return (
                              <Draggable key={`${section._id}-${idx}`} draggableId={dragData} index={idx}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      padding: 'var(--space-2)',
                                      marginBottom: 'var(--space-1)',
                                      background: snapshot.isDragging ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container)',
                                      borderRadius: 'var(--radius-sm)',
                                      fontSize: 'var(--md-label-small)',
                                      cursor: 'grab',
                                      border: `1px solid ${snapshot.isDragging ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)'}`,
                                      ...provided.draggableProps.style,
                                    }}
                                    title={`${course.code}: ${course.title}`}
                                  >
                                    <span style={{ fontWeight: 600, color: section.color }}>{course.code}</span>
                                    <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}> - {course.type}</span>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ) : selectedSection ? (
              // Section Mode: Show selected section's courses
              <Droppable droppableId="sections-panel" isDropDisabled={true}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="draggable-panel-content">
                    {selectedSection.courses?.map((course, idx) => {
                      const dragData = JSON.stringify({ section: selectedSection._id, sectionName: selectedSection.name, color: selectedSection.color, course });
                      return (
                        <Draggable key={`${selectedSection._id}-${idx}`} draggableId={dragData} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                padding: 'var(--space-2)',
                                marginBottom: 'var(--space-1)',
                                background: snapshot.isDragging ? 'var(--md-sys-color-primary-container)' : `${selectedSection.color}20`,
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 'var(--md-body-medium)',
                                cursor: 'grab',
                                border: `1px solid ${snapshot.isDragging ? 'var(--md-sys-color-primary)' : `${selectedSection.color}40`}`,
                                ...provided.draggableProps.style,
                              }}
                            >
                              <span style={{ fontWeight: 600, color: selectedSection.color }}>{course.code}</span>
                              <span style={{ display: 'block', fontSize: 'var(--md-label-small)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                {course.title}
                              </span>
                              <span style={{ fontSize: 'var(--md-label-small)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                {course.type} • {course.credits} credits
                              </span>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                <p style={{ fontSize: 'var(--md-body-medium)' }}>Select a section to view courses</p>
              </div>
            )}
          </div>

          {/* Rooms Summary */}
          <Card style={{ marginTop: 'var(--space-4)' }}>
            <h4 style={{ fontSize: 'var(--md-body-medium)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Available Rooms
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--md-body-medium)' }}>
                <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Classrooms</span>
                <span style={{ fontWeight: 600 }}>{rooms.filter(r => r.type === 'classroom').length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--md-body-medium)' }}>
                <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Labs</span>
                <span style={{ fontWeight: 600 }}>{rooms.filter(r => r.type === 'lab').length}</span>
              </div>
            </div>
          </Card>

          {/* Export Section PDFs (Department Mode) */}
          {routineType === 'department' && slots.length > 0 && (
            <Card style={{ marginTop: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--md-body-medium)', fontWeight: 600, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <HiDocumentText /> Export Section PDFs
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {[...new Set(slots.map(s => s.sectionName))].map((sectionName) => (
                  <Button
                    key={sectionName}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExportSectionPDF(sectionName)}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    {sectionName}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Routine Grid */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <RoutineGrid
            timeSlots={timeSlots}
            onSlotClick={handleSlotClick}
            onSlotDelete={handleSlotDelete}
          />
        </div>
      </div>
      </DragDropContext>

      {/* Add Slot Modal */}
      <Modal
        isOpen={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        title="Add Class Slot"
        size="md"
      >
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: 'var(--md-body-medium)' }}>
            {selectedSlotInfo?.day} • {selectedSlotInfo?.timeSlot?.start} - {selectedSlotInfo?.timeSlot?.end}
          </p>
        </div>

        {/* Section Selector */}
        <div className="form-group">
          <label className="form-label required">Section</label>
          <select
            className="form-select"
            value={slotForm.sectionId}
            onChange={(e) => {
              const newSectionId = e.target.value;
              // Reset course and teacher when section changes
              setSlotForm({ 
                ...slotForm, 
                sectionId: newSectionId, 
                courseIndex: 0,
                teacher: '' 
              });
            }}
          >
            <option value="">Select Section</option>
            {sections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course Selector */}
        {selectedSectionData && selectedSectionData.courses?.length > 0 && (
          <div className="form-group">
            <label className="form-label">Course</label>
            <select
              className="form-select"
              value={slotForm.courseIndex}
              onChange={(e) => {
                const courseIdx = parseInt(e.target.value);
                const selectedCourse = selectedSectionData.courses[courseIdx];
                // Auto-fill teacher name from selected course
                setSlotForm({ 
                  ...slotForm, 
                  courseIndex: courseIdx,
                  teacher: selectedCourse?.teacher || '' 
                });
              }}
            >
              {selectedSectionData.courses.map((course, index) => (
                <option key={index} value={index}>
                  {course.code} - {course.title} ({course.type})
                </option>
              ))}
            </select>
            {/* Lab duration indicator */}
            {selectedSectionData.courses[slotForm.courseIndex]?.type === 'lab' && (
              <p style={{ 
                fontSize: 'var(--md-label-small)', 
                color: 'var(--md-sys-color-error)', 
                marginTop: 'var(--space-2)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <HiExclamation /> Lab: {selectedSlotInfo?.timeSlot?.start} - {formatTime(parseTime(selectedSlotInfo?.timeSlot?.start) + 180)} (3 hours)
                <br />
                Section & Room will be blocked during this entire period
              </p>
            )}
          </div>
        )}

        {/* Room Selector */}
        <div className="form-group">
          <label className="form-label required">Room</label>
          <select
            className="form-select"
            value={slotForm.roomId}
            onChange={(e) => setSlotForm({ ...slotForm, roomId: e.target.value })}
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.roomNumber} ({room.type} • {room.capacity} seats)
              </option>
            ))}
          </select>
        </div>

        {/* Teacher Input */}
        <div className="form-group">
          <label className="form-label">Teacher</label>
          <input
            type="text"
            className="form-input"
            placeholder="Auto-filled from course (you can edit)"
            value={slotForm.teacher}
            onChange={(e) => setSlotForm({ ...slotForm, teacher: e.target.value })}
          />
          {selectedSectionData?.courses?.[slotForm.courseIndex]?.teacher && (
            <p style={{ fontSize: 'var(--md-label-small)', color: 'var(--md-sys-color-on-surface-variant)', marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiInformationCircle style={{ fontSize: '14px' }} /> Teacher will be auto-filled from: <strong>{selectedSectionData.courses[slotForm.courseIndex].teacher}</strong>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
          <Button variant="ghost" onClick={() => setSlotModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSlot}>
            Add Slot
          </Button>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Schedule Settings"
        size="md"
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              type="time"
              className="form-input"
              value={scheduleSettings.startTime}
              onChange={(e) => setScheduleSettings({ ...scheduleSettings, startTime: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input
              type="time"
              className="form-input"
              value={scheduleSettings.endTime}
              onChange={(e) => setScheduleSettings({ ...scheduleSettings, endTime: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Class Duration (minutes)</label>
            <input
              type="number"
              className="form-input"
              min="30"
              max="120"
              value={scheduleSettings.classDuration}
              onChange={(e) => setScheduleSettings({ ...scheduleSettings, classDuration: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Short Break (minutes)</label>
            <input
              type="number"
              className="form-input"
              min="5"
              max="30"
              value={scheduleSettings.shortBreak}
              onChange={(e) => setScheduleSettings({ ...scheduleSettings, shortBreak: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Long Break Start</label>
            <input
              type="time"
              className="form-input"
              value={scheduleSettings.longBreakStart}
              onChange={(e) => setScheduleSettings({ ...scheduleSettings, longBreakStart: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Long Break End</label>
            <input
              type="time"
              className="form-input"
              value={scheduleSettings.longBreakEnd}
              onChange={(e) => setScheduleSettings({ ...scheduleSettings, longBreakEnd: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
          <Button variant="ghost" onClick={() => setSettingsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setSettingsModalOpen(false)}>
            Apply Settings
          </Button>
        </div>
      </Modal>

      <style>{`
        .btn-option {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 8px 12px;
          border: 1px solid var(--md-sys-color-outline);
          background: var(--md-sys-color-surface-container);
          color: var(--md-sys-color-on-surface);
          border-radius: var(--radius-extra-small);
          cursor: pointer;
          transition: all var(--md-motion-duration-short) var(--md-motion-easing-standard);
          font-family: var(--md-font-family);
          font-size: var(--md-label-medium);
          font-weight: 500;
        }
        .btn-option:hover {
          background: var(--md-sys-color-surface-container-high);
        }
        .btn-option.active {
          background: var(--md-sys-color-primary);
          border-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }
      `}</style>
    </motion.div>
  );
};

export default RoutineMaker;
