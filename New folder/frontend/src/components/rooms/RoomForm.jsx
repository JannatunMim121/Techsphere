import React, { useState, useEffect } from 'react';
import { HiOfficeBuilding, HiBeaker } from 'react-icons/hi';
import Button from '../common/Button';

const RoomForm = ({ room, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'classroom',
    floor: 1,
    capacity: 30,
    equipment: [],
    isAvailable: true,
  });
  const [equipmentInput, setEquipmentInput] = useState('');

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        type: room.type || 'classroom',
        floor: room.floor || 1,
        capacity: room.capacity || 30,
        equipment: room.equipment || [],
        isAvailable: room.isAvailable !== false,
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddEquipment = () => {
    if (equipmentInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        equipment: [...prev.equipment, equipmentInput.trim()],
      }));
      setEquipmentInput('');
    }
  };

  const handleRemoveEquipment = (index) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      floor: parseInt(formData.floor),
      capacity: parseInt(formData.capacity),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label required">Room Type</label>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <label
            className="form-check"
            style={{
              flex: 1,
              padding: 'var(--space-4)',
              background: formData.type === 'classroom' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${formData.type === 'classroom' ? 'var(--primary-500)' : 'transparent'}`,
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="type"
              value="classroom"
              checked={formData.type === 'classroom'}
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <HiOfficeBuilding style={{ fontSize: 'var(--md-title-large)', color: 'var(--md-sys-color-primary)' }} />
            <span>Classroom</span>
          </label>
          <label
            className="form-check"
            style={{
              flex: 1,
              padding: 'var(--space-4)',
              background: formData.type === 'lab' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${formData.type === 'lab' ? 'var(--success-500)' : 'transparent'}`,
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="type"
              value="lab"
              checked={formData.type === 'lab'}
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <HiBeaker style={{ fontSize: 'var(--md-title-large)', color: 'var(--md-sys-color-tertiary)' }} />
            <span>Lab Room</span>
          </label>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">Room Number</label>
          <input
            type="text"
            name="roomNumber"
            className="form-input"
            placeholder="e.g., 101, A-201"
            value={formData.roomNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label required">Floor</label>
          <input
            type="number"
            name="floor"
            className="form-input"
            min="0"
            max="20"
            value={formData.floor}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label required">Seating Capacity</label>
        <input
          type="number"
          name="capacity"
          className="form-input"
          min="1"
          max="500"
          value={formData.capacity}
          onChange={handleChange}
          required
        />
        <p className="form-help">Maximum number of students this room can accommodate</p>
      </div>

      {formData.type === 'lab' && (
        <div className="form-group">
          <label className="form-label">Equipment</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Add equipment..."
              value={equipmentInput}
              onChange={(e) => setEquipmentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
            />
            <Button type="button" variant="secondary" onClick={handleAddEquipment}>
              Add
            </Button>
          </div>
          {formData.equipment.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
              {formData.equipment.map((eq, index) => (
                <span
                  key={index}
                  className="course-tag"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveEquipment(index)}
                >
                  {eq} ×
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="form-group">
        <label className="form-check">
          <input
            type="checkbox"
            name="isAvailable"
            className="form-check-input"
            checked={formData.isAvailable}
            onChange={handleChange}
          />
          <span className="form-check-label">Room is currently available</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {room ? 'Update Room' : 'Add Room'}
        </Button>
      </div>
    </form>
  );
};

export default RoomForm;