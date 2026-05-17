import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Get all sections
export const fetchSections = createAsyncThunk(
  'sections/fetchSections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/sections`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sections');
    }
  }
);

// Create section
export const createSection = createAsyncThunk(
  'sections/createSection',
  async (sectionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/sections`, sectionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create section');
    }
  }
);

// Update section
export const updateSection = createAsyncThunk(
  'sections/updateSection',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/sections/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update section');
    }
  }
);

// Delete section
export const deleteSection = createAsyncThunk(
  'sections/deleteSection',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/sections/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete section');
    }
  }
);

// Add course to section
export const addCourse = createAsyncThunk(
  'sections/addCourse',
  async ({ sectionId, courseData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/sections/${sectionId}/courses`, courseData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add course');
    }
  }
);

const initialState = {
  sections: [],
  loading: false,
  error: null,
};

const sectionSlice = createSlice({
  name: 'sections',
  initialState,
  reducers: {
    clearSectionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sections
      .addCase(fetchSections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.sections = action.payload;
        state.loading = false;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Section
      .addCase(createSection.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSection.fulfilled, (state, action) => {
        state.sections.push(action.payload);
        state.loading = false;
      })
      .addCase(createSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Section
      .addCase(updateSection.fulfilled, (state, action) => {
        const index = state.sections.findIndex(section => section._id === action.payload._id);
        if (index !== -1) {
          state.sections[index] = action.payload;
        }
      })
      // Delete Section
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.sections = state.sections.filter(section => section._id !== action.payload);
      })
      // Add Course
      .addCase(addCourse.fulfilled, (state, action) => {
        const index = state.sections.findIndex(section => section._id === action.payload._id);
        if (index !== -1) {
          state.sections[index] = action.payload;
        }
      });
  },
});

export const { clearSectionError } = sectionSlice.actions;
export default sectionSlice.reducer;