import { create } from "zustand";

type HeartsModalState = {
    isOpen: boolean;
    broken: boolean; // true when opened due to hearts running out
    open: () => void;
    openBroken: () => void;
    close: () => void;
};

export const useHeartsModal = create<HeartsModalState>((set) => ({
    isOpen: false,
    broken: false,
    open: () => set({ isOpen: true, broken: false }),
    openBroken: () => set({ isOpen: true, broken: true }),
    close: () => set({ isOpen: false, broken: false }),
}));