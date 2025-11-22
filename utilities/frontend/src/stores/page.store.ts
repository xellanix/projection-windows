import { pages, type Page } from "@/data";
import type { JSX } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface PageState {
	pages: Record<Page, () => JSX.Element>;
	currentPage: Page;
	isForward: boolean;
}

interface PageActions {
	setCurrentPage: (page: Page | ((prev: Page) => Page)) => void;
	back: () => void;
	next: () => void;
}

type PageStore = PageState & PageActions;

export const usePageStore = create<PageStore>()(
	immer((set) => ({
		pages: pages,
		currentPage: "1",
		isForward: true,

		setCurrentPage: (page) => {
			set((s) => {
				s.isForward = page > s.currentPage;
				s.currentPage = typeof page === "function" ? page(s.currentPage) : page;
			});
		},

		back: () => {
			set((s) => {
				s.isForward = false;
				s.currentPage = s.currentPage.slice(0, s.currentPage.lastIndexOf(".")) as Page;
			});
		},

		next: () => {
			set((s) => {
				s.isForward = true;
				s.currentPage = (s.currentPage + ".1") as Page;
			});
		},
	}))
);
