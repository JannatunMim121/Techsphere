import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { undo, redo } from '../redux/slices/historySlice';

const useKeyboardShortcuts = (handlers = {}) => {
  const dispatch = useDispatch();

  const handleKeyDown = useCallback(
    (event) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const modifier = ctrlKey || metaKey;

      // Ctrl/Cmd + S - Save
      if (modifier && key === 's') {
        event.preventDefault();
        handlers.onSave?.();
      }

      // Ctrl/Cmd + Z - Undo
      if (modifier && key === 'z' && !shiftKey) {
        event.preventDefault();
        dispatch(undo());
      }

      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z - Redo
      if ((modifier && key === 'y') || (modifier && shiftKey && key === 'z')) {
        event.preventDefault();
        dispatch(redo());
      }

      // Escape - Close modal/cancel
      if (key === 'Escape') {
        handlers.onEscape?.();
      }

      // Delete - Delete selected
      if (key === 'Delete' || key === 'Backspace') {
        handlers.onDelete?.();
      }
    },
    [dispatch, handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;