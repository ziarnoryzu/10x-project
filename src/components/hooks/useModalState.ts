import { useState, useCallback } from "react";

type ModalName = "deleteDialog" | "generatePlan";

interface ModalState {
  deleteDialog: boolean;
  generatePlan: boolean;
}

interface UseModalStateReturn {
  modals: ModalState;
  openModal: (name: ModalName) => void;
  closeModal: (name: ModalName) => void;
  toggleModal: (name: ModalName) => void;
}

/**
 * Custom hook for managing multiple modal states in a component.
 * Provides a cleaner API than managing individual boolean states.
 */
export function useModalState(): UseModalStateReturn {
  const [modals, setModals] = useState<ModalState>({
    deleteDialog: false,
    generatePlan: false,
  });

  const openModal = useCallback((name: ModalName) => {
    setModals((prev) => ({ ...prev, [name]: true }));
  }, []);

  const closeModal = useCallback((name: ModalName) => {
    setModals((prev) => ({ ...prev, [name]: false }));
  }, []);

  const toggleModal = useCallback((name: ModalName) => {
    setModals((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
  };
}
