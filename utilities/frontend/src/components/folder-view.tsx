import { TreeView, type TreeDataItem } from "@/components/tree-view";
import type { TreeNode } from "@/types";
import { File02Icon, Folder01Icon, Folder02Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo } from "react";
import { v4 as uuidv4 } from "uuid";

function FolderIcon() {
    return (
        <HugeiconsIcon
            icon={Folder01Icon}
            className="size-4 mr-1 text-amber-500"
            strokeWidth={1.75}
        />
    );
}

function OpenedFolderIcon() {
    return (
        <HugeiconsIcon
            icon={Folder02Icon}
            className="size-4 mr-1 text-amber-500"
            strokeWidth={1.75}
        />
    );
}

function FileIcon() {
    return (
        <HugeiconsIcon icon={File02Icon} className="size-4 mr-1 text-sky-500" strokeWidth={1.75} />
    );
}

export const convert = (data: TreeNode[]): TreeDataItem[] => {
    const result: TreeDataItem[] = [];
    data.forEach((i) => {
        const hasChild = i.children && i.children.length > 0;

        result.push({
            id: uuidv4(),
            name: i.data,
            ...(hasChild && {
                icon: FolderIcon,
                openIcon: OpenedFolderIcon,
                children: convert(i.children!),
            }),
        });
    });

    return result;
};

function FolderViewR({ data, name }: { data: TreeDataItem[]; name: string }) {
    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <span className="font-bold">{name}</span>
            <TreeView
                data={data}
                defaultLeafIcon={FileIcon}
                expandAll
                initialSelectedItemId="0"
                className="h-full overflow-y-auto"
            />
        </div>
    );
}
export const FolderView = memo(FolderViewR);

export { type TreeDataItem };
