import type { TreeNode } from "@/types";

export {};

declare global {
	interface Window {
		importProjection(): Promise<TreeNode[]>;
		extract(): Promise<string>;
		build(): Promise<string>;
		closeApp(): Promise<void>;
		closeAndStart(): Promise<void>;
		exportProjection(): Promise<TreeNode[]>;
		pack(): Promise<string>;
		// loadTracksMetadata: (tracks: Track[]) => Promise<void>;
	}
}
