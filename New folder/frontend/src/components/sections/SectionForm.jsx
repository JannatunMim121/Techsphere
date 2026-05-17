import React, { useState, useEffect } from 'react';
import { HiPlus, HiTrash } from 'react-icons/hi';
import Button from '../common/Button';

const colorOptions = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#6b7280', '#84cc16',
];

const SectionForm = ({ section, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    semester: 1,
    year: new Date().getFullYear(),
    studentCount: 30,
    maxCapacity: 60,
    color: '#6366f1',
    courses: [],
  });

  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    type: 'theory',
    credits: 3,
    teacher: '',
  });

  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name || '',
        semester: section.semester || 1,
        year: section.year || new Date().getFullYear(),
        studentCount: section.studentCount || 30,
        maxCapacity: section.maxCapacity || 60,
        color: section.color || '#6366f1',
        courses: section.courses || [],
      });
    }
  }, [section]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCourse = () => {
    if (courseForm.code && courseForm.title) {
      setFormData((prev) => ({
        ...prev,
        courses: [...prev.courses, { ...courseForm, credits: parseInt(courseForm.credits) }],
      }));
      setCourseForm({
        code: '',
        title: '',
        type: 'theory',
        credits: 3,
        teacher: '',
      });
    }
  };

  const handleRemoveCourse = (index) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      semester: parseInt(formData.semester),
      year: parseInt(formData.year),
      studentCount: parseInt(formData.studentCount),
      maxCapacity: parseInt(formData.maxCapacity),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label required">Section Name</label>
        <input
          type="text"
          name="name"
          className="form-input"
          placeholder="e.g., CSE 2024-A"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Semester</label>
          <select
            name="semester"
            className="form-select"
            value={formData.semester}
            onChange={handleChange}
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label required">Year</label>
          <input
            type="number"
            name="year"
            className="form-input"
            min="2020"
            max="2030"
            value={formData.year}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Current Students</label>
          <input
            type="number"
            name="studentCount"
            className="form-input"
            min="1"
            value={formData.studentCount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label required">Max Capacity</label>
          <input
            type="number"
            name="maxCapacity"
            className="form-input"
            min="1"
            value={formData.maxCapacity}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Section Color</label>
        <div className="color-picker-group">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-option ${formData.color === color ? 'selected' : ''}`}
              style={{ background: color }}
              onClick={() => setFormData((prev) => ({ ...prev, color }))}
            />
          ))}
        </div>
      </div>

      <div className="form-divider">
        <span>Courses</span>
      </div>

      <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
            <input
              type="text"
              name="code"
              className="form-input"
              placeholder="Course Code"
              value={courseForm.code}
              onChange={handleCourseChange}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="Course Title"
              value={courseForm.title}
              onChange={handleCourseChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
            <select
              name="type"
              className="form-select"
              value={courseForm.type}
              onChange={handleCourseChange}
            >
              <option value="theory">Theory</option>
              <option value="lab">Lab</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
            <input
              type="number"
              name="credits"
              className="form-input"
              placeholder="Credits"
              min="1"
              max="6"
              value={courseForm.credits}
              onChange={handleCourseChange}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
          <input
            type="text"
            name="teacher"
            className="form-input"
            placeholder="Teacher Name (optional)"
            value={courseForm.teacher}
            onChange={handleCourseChange}
          />
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={handleAddCourse}>
          <HiPlus /> Add Course
        </Button>
      </div>

      {formData.courses.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Code</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Title</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: 'var(--space-2)' }}></th>
              </tr>
            </thead>
            <tbody>
              {formData.courses.map((course, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>{course.code}</td>
                  <td style={{ padding: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>{course.title}</td>
                  <td style={{ padding: 'var(--space-2)' }}>
                    <span className="course-tag">{course.type}</span>
                  </td>
                  <td style={{ padding: 'var(--space-2)', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => handleRemoveCourse(index)}
                      style={{ color: 'var(--error-500)' }}
                    >
                      <HiTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {section ? 'Update Section' : 'Create Section'}
        </Button>
      </div>
    </form>
  );
};

export default SectionForm;