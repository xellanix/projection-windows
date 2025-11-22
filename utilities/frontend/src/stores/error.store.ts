import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ErrorState {
	error: string;
}

interface ErrorActions {
	setError: (error: string) => void;
	clearError: () => void;
}

type ErrorStore = ErrorState & ErrorActions;

export const useErrorStore = create<ErrorStore>()(
	immer((set) => ({
		error: "",

		setError: (error) => {
			set((s) => {
				s.error = error;
			});
		},
		clearError: () => {
			set((s) => {
				s.error = "";
			});
		},
	}))
);
