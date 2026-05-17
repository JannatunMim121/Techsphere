import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Get all routines
export const fetchRoutines = createAsyncThunk(
  'routine/fetchRoutines',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/routines`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch routines');
    }
  }
);

// Get single routine
export const fetchRoutine = createAsyncThunk(
  'routine/fetchRoutine',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/routines/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch routine');
    }
  }
);

// Create routine
export const createRoutine = createAsyncThunk(
  'routine/createRoutine',
  async (routineData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/routines`, routineData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create routine');
    }
  }
);

// Update routine
export const updateRoutine = createAsyncThunk(
  'routine/updateRoutine',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/routines/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update routine');
    }
  }
);

// Delete routine
export const deleteRoutine = createAsyncThunk(
  'routine/deleteRoutine',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/routines/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete routine');
    }
  }
);

// Add slot
export const addSlot = createAsyncThunk(
  'routine/addSlot',
  async ({ routineId, slotData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/routines/${routineId}/slots`, slotData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add slot');
    }
  }
);

// Update slot
export const updateSlot = createAsyncThunk(
  'routine/updateSlot',
  async ({ routineId, slotId, slotData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/routines/${routineId}/slots/${slotId}`, slotData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update slot');
    }
  }
);

// Delete slot
export const deleteSlot = createAsyncThunk(
  'routine/deleteSlot',
  async ({ routineId, slotId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/routines/${routineId}/slots/${slotId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete slot');
    }
  }
);

const initialState = {
  routines: [],
  currentRoutine: null,
  slots: [],
  conflicts: {
    teacherConflicts: [],
    roomConflicts: [],
    sectionConflicts: [],
    totalConflicts: 0,
  },
  loading: false,
  saving: false,
  error: null,
};

const routineSlice = createSlice({
  name: 'routine',
  initialState,
  reducers: {
    setCurrentRoutine: (state, action) => {
      state.currentRoutine = action.payload;
      state.slots = action.payload?.slots || [];
    },
    addLocalSlot: (state, action) => {
      state.slots.push(action.payload);
    },
    updateLocalSlot: (state, action) => {
      const slot = state.slots.find(slot => slot._id === action.payload._id);
      if (slot) {
        Object.assign(slot, action.payload);
      }
    },
    removeLocalSlot: (state, action) => {
      const index = state.slots.findIndex(slot => slot._id === action.payload);
      if (index !== -1) {
        state.slots.splice(index, 1);
      }
    },
    setConflicts: (state, action) => {
      state.conflicts = action.payload;
    },
    clearConflicts: (state) => {
      state.conflicts = { teacherConflicts: [], roomConflicts: [], sectionConflicts: [], totalConflicts: 0 };
    },
    clearRoutineError: (state) => {
      state.error = null;
    },
    resetRoutine: (state) => {
      state.currentRoutine = null;
      state.slots = [];
      state.conflicts = { teacherConflicts: [], roomConflicts: [], sectionConflicts: [], totalConflicts: 0 };
    },
    restoreSlots: (state, action) => {
      state.slots = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Routines
      .addCase(fetchRoutines.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoutines.fulfilled, (state, action) => {
        state.routines = action.payload;
        state.loading = false;
      })
      .addCase(fetchRoutines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Routine
      .addCase(fetchRoutine.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoutine.fulfilled, (state, action) => {
        state.currentRoutine = action.payload.data || action.payload;
        state.slots = action.payload.data?.slots || action.payload?.slots || [];
        state.conflicts = action.payload.conflicts || { totalConflicts: 0 };
        state.loading = false;
      })
      .addCase(fetchRoutine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Routine
      .addCase(createRoutine.pending, (state) => {
        state.saving = true;
      })
      .addCase(createRoutine.fulfilled, (state, action) => {
        state.routines.push(action.payload.data || action.payload);
        state.currentRoutine = action.payload.data || action.payload;
        state.slots = action.payload.data?.slots || action.payload?.slots || [];
        state.conflicts = action.payload.conflicts || { totalConflicts: 0 };
        state.saving = false;
      })
      .addCase(createRoutine.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Update Routine
      .addCase(updateRoutine.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateRoutine.fulfilled, (state, action) => {
        const index = state.routines.findIndex(r => r._id === action.payload.data?._id || action.payload?._id);
        if (index !== -1) {
          state.routines[index] = action.payload.data || action.payload;
        }
        state.currentRoutine = action.payload.data || action.payload;
        state.slots = action.payload.data?.slots || action.payload?.slots || [];
        state.conflicts = action.payload.conflicts || { totalConflicts: 0 };
        state.saving = false;
      })
      .addCase(updateRoutine.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Delete Routine
      .addCase(deleteRoutine.fulfilled, (state, action) => {
        state.routines = state.routines.filter(r => r._id !== action.payload);
        if (state.currentRoutine?._id === action.payload) {
          state.currentRoutine = null;
          state.slots = [];
        }
      })
      // Add Slot
      .addCase(addSlot.fulfilled, (state, action) => {
        const routine = action.payload.data || action.payload;
        state.currentRoutine = routine;
        state.slots = routine?.slots || [];
      })
      // Update Slot
      .addCase(updateSlot.fulfilled, (state, action) => {
        const routine = action.payload.data || action.payload;
        state.currentRoutine = routine;
        state.slots = routine?.slots || [];
      })
      // Delete Slot
      .addCase(deleteSlot.fulfilled, (state, action) => {
        const routine = action.payload.data || action.payload;
        state.currentRoutine = routine;
        state.slots = routine?.slots || [];
      });
  },
});

export const {
  setCurrentRoutine,
  addLocalSlot,
  updateLocalSlot,
  removeLocalSlot,
  setConflicts,
  clearConflicts,
  clearRoutineError,
  resetRoutine,
  restoreSlots,
} = routineSlice.actions;

export default routineSlice.reducer;