import { usePageStore } from "@/stores/page.store";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface NavigatorState {
	back: {
		content: string;
		isLoading: boolean;
		func: () => void;
	};
	next: {
		content: string;
		isLoading: boolean;
		func: () => void;
	};
}
interface NavigatorActions {
	setBackContent: (content: string) => void;
	setNextContent: (content: string) => void;

	setBackLoading: (isLoading: boolean) => void;
	setNextLoading: (isLoading: boolean) => void;

	setBackFunc: (func: () => void) => void;
	setNextFunc: (func: () => void) => void;
}

type NavigatorStore = NavigatorState & NavigatorActions;

export const useNavigatorStore = create<NavigatorStore>()(
	immer((set) => ({
		back: {
			content: "Back",
			isLoading: false,
			func: () => {
				usePageStore.getState().back();
			},
		},
		next: {
			content: "Next",
			isLoading: false,
			func: () => {
				usePageStore.getState().next();
			},
		},

		setBackContent: (content: string) => {
			set((s) => {
				s.back.content = content;
			});
		},
		setNextContent: (content: string) => {
			set((s) => {
				s.next.content = content;
			});
		},

		setBackLoading: (isLoading: boolean) => {
			set((s) => {
				s.back.isLoading = isLoading;
			});
		},
		setNextLoading: (isLoading: boolean) => {
			set((s) => {
				s.next.isLoading = isLoading;
			});
		},

		setBackFunc: (func) => {
			set((s) => {
				s.back.func = func;
			});
		},
		setNextFunc: (func) => {
			set((s) => {
				s.next.func = func;
			});
		},
	}))
);
