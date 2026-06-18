import { create } from "zustand";

interface ConfirmState {
  isOpen: boolean;
  message: string;
  resolve?: (value: boolean) => void;
  confirm: (message: string) => Promise<boolean>;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  message: "",

  confirm: (message: string) =>
    new Promise((resolve) => {
      set({
        isOpen: true,
        message,
        resolve,
      });
    }),

  close: () =>
    set({
      isOpen: false,
      message: "",
      resolve: undefined,
    }),
}));