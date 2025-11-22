import type { TreeNode } from "@/types";

export {};

declare global {
	interface Window {
		importProjection(): Promise<TreeNode[]>;
		extract(): Promise<string>;
		build(): Promise<string>;
		closeApp(): Promise<void>;
		closeAndStart(): Promise<void>;
		// loadTracksMetadata: (tracks: Track[]) => Promise<void>;
	}
}
