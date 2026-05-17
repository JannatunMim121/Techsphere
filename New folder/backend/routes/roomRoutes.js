const express = require('express');
const router = express.Router();
const {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getRooms)
  .post(createRoom);

router.route('/:id')
  .put(updateRoom)
  .delete(deleteRoom);

module.exports = router;