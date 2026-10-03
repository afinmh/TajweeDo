import { create } from "zustand";

type HeartsModalState = {
    isOpen: boolean;
    broken: boolean;
    open: (broken?: boolean) => void;
    close: () => void;
};

export const useHeartsModal = create<HeartsModalState>((set) => ({
    isOpen: false,
    broken: false,
    open: (broken = false) => set({ isOpen: true, broken }),
    close: () => set({ isOpen: false, broken: false }),
}));
