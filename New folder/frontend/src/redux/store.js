import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import roomReducer from './slices/roomSlice';
import sectionReducer from './slices/sectionSlice';
import routineReducer from './slices/routineSlice';
import uiReducer from './slices/uiSlice';
import historyReducer from './slices/historySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomReducer,
    sections: sectionReducer,
    routine: routineReducer,
    ui: uiReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;