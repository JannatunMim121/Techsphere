import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiPlus } from 'react-icons/hi';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../redux/slices/roomSlice';
import RoomList from '../components/rooms/RoomList';
import RoomForm from '../components/rooms/RoomForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const RoomManagement = () => {
  const dispatch = useDispatch();
  const { rooms = [], classrooms = [], labs = [], loading, error } = useSelector((state) => state.rooms || {});
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [filter, setFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleOpenModal = (room = null) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingRoom(null);
    setModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editingRoom) {
        await dispatch(updateRoom({ id: editingRoom._id, data: formData })).unwrap();
        toast.success('Room updated successfully');
      } else {
        await dispatch(createRoom(formData)).unwrap();
        toast.success('Room created successfully');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err || 'Something went wrong');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await dispatch(deleteRoom(id)).unwrap();
        toast.success('Room deleted successfully');
      } catch (err) {
        toast.error(err || 'Failed to delete room');
      }
    }
  };

  const filteredRooms = filter === 'all' 
    ? rooms 
    : filter === 'classroom' 
      ? classrooms 
      : labs;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Rooms & Labs</h1>
          <p className="page-subtitle">Manage classrooms and laboratory rooms for your department</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <HiPlus /> Add Room
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {[
          { key: 'all', label: 'All Rooms', count: rooms.length },
          { key: 'classroom', label: 'Classrooms', count: classrooms.length },
          { key: 'lab', label: 'Labs', count: labs.length },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`btn ${filter === tab.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <RoomList
        rooms={filteredRooms}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingRoom ? 'Edit Room' : 'Add New Room'}
        size="md"
      >
        <RoomForm
          room={editingRoom}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={saving}
        />
      </Modal>
    </motion.div>
  );
};

export default RoomManagement;