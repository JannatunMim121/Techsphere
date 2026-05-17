import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  past: [],
  future: [],
  maxHistory: 50,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    pushState: (state, action) => {
      state.past.push(action.payload);
      if (state.past.length > state.maxHistory) {
        state.past.shift();
      }
      state.future = [];
    },
    undo: (state) => {
      if (state.past.length > 0) {
        const previous = state.past.pop();
        state.future.unshift(previous);
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const next = state.future.shift();
        state.past.push(next);
      }
    },
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
    },
  },
});

export const { pushState, undo, redo, clearHistory } = historySlice.actions;
export default historySlice.reducer;