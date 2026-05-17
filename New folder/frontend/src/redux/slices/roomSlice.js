import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Get all rooms
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rooms');
    }
  }
);

// Create room
export const createRoom = createAsyncThunk(
  'rooms/createRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/rooms`, roomData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create room');
    }
  }
);

// Update room
export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/rooms/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update room');
    }
  }
);

// Delete room
export const deleteRoom = createAsyncThunk(
  'rooms/deleteRoom',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/rooms/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete room');
    }
  }
);

const initialState = {
  rooms: [],
  classrooms: [],
  labs: [],
  loading: false,
  error: null,
};

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearRoomError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rooms
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
        state.classrooms = action.payload.filter(room => room.type === 'classroom');
        state.labs = action.payload.filter(room => room.type === 'lab');
        state.loading = false;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Room
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
        if (action.payload.type === 'classroom') {
          state.classrooms.push(action.payload);
        } else {
          state.labs.push(action.payload);
        }
        state.loading = false;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Room
      .addCase(updateRoom.fulfilled, (state, action) => {
        const index = state.rooms.findIndex(room => room._id === action.payload._id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        state.classrooms = state.rooms.filter(room => room.type === 'classroom');
        state.labs = state.rooms.filter(room => room.type === 'lab');
      })
      // Delete Room
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter(room => room._id !== action.payload);
        state.classrooms = state.rooms.filter(room => room.type === 'classroom');
        state.labs = state.rooms.filter(room => room.type === 'lab');
      });
  },
});

export const { clearRoomError } = roomSlice.actions;
export default roomSlice.reducer;