import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiPlus } from 'react-icons/hi';
import { fetchSections, createSection, updateSection, deleteSection } from '../redux/slices/sectionSlice';
import SectionList from '../components/sections/SectionList';
import SectionForm from '../components/sections/SectionForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const SectionManagement = () => {
  const dispatch = useDispatch();
  const { sections = [], loading, error } = useSelector((state) => state.sections || {});
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleOpenModal = (section = null) => {
    setEditingSection(section);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingSection(null);
    setModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editingSection) {
        await dispatch(updateSection({ id: editingSection._id, data: formData })).unwrap();
        toast.success('Section updated successfully');
      } else {
        await dispatch(createSection(formData)).unwrap();
        toast.success('Section created successfully');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err || 'Something went wrong');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await dispatch(deleteSection(id)).unwrap();
        toast.success('Section deleted successfully');
      } catch (err) {
        toast.error(err || 'Failed to delete section');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Sections</h1>
          <p className="page-subtitle">Manage student sections and their courses</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <HiPlus /> Add Section
        </Button>
      </div>

      <SectionList
        sections={sections}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingSection ? 'Edit Section' : 'Create New Section'}
        size="lg"
      >
        <SectionForm
          section={editingSection}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={saving}
        />
      </Modal>
    </motion.div>
  );
};

export default SectionManagement;