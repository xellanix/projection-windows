import type { TreeNode } from "@/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface DataState {
	import: {
		data: TreeNode[];
	};
}

interface DataActions {
	setImportData: (data: TreeNode[]) => void;
}

type DataStore = DataState & DataActions;

export const useDataStore = create<DataStore>()(
	immer((set) => ({
		import: {
			data: [],
		},

		setImportData: (data) => {
			set((s) => {
				s.import.data = data;
			});
		},
	}))
);
