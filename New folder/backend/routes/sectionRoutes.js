const express = require('express');
const router = express.Router();
const {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  addCourse
} = require('../controllers/sectionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSections)
  .post(createSection);

router.route('/:id')
  .put(updateSection)
  .delete(deleteSection);

router.post('/:id/courses', addCourse);

module.exports = router;