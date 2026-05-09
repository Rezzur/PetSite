import { useContext } from 'react';
import { InteractionContext } from '../components/interaction/InteractionProvider';

export function usePointer() {
  const context = useContext(InteractionContext);

  if (!context) {
    throw new Error('usePointer must be used inside InteractionProvider');
  }

  return context;
}
