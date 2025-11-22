import { TreeView, type TreeDataItem } from "@/components/tree-view";
import { Separator } from "@/components/ui/separator";
import { useDataStore } from "@/stores/data.store";
import { useNavigatorStore } from "@/stores/navigator.store";
import type { TreeNode } from "@/types";
import { File02Icon, Folder01Icon, Folder02Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo } from "react";
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

const convert = (data: TreeNode[]): TreeDataItem[] => {
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

export default function Import() {
    const setNext = useNavigatorStore((s) => s.setNextContent);
    const setBack = useNavigatorStore((s) => s.setBackContent);
    const importData = useDataStore((s) => s.import.data);

    const viewData = useMemo((): [TreeDataItem[], TreeDataItem[]] => {
        const assets = importData.filter((i) => i.data === "public");
        const queue = importData.filter((i) => i.data === "data");
        if (assets.length === 0 || queue.length === 0) return [[], []];
        return [convert(assets[0]!.children!), convert(queue[0]!.children!)];
    }, [importData]);

    useEffect(() => {
        setBack("Cancel");
        setNext("Process");
    }, [setBack, setNext]);

    return (
        <div className="flex flex-col h-full gap-8 overflow-hidden">
            <div className="flex flex-row gap-4 h-full overflow-hidden">
                <FolderView data={viewData[0]} name="Assets" />
                <Separator orientation="vertical" />
                <FolderView data={viewData[1]} name="Queue Items" />
            </div>
        </div>
    );
}

function FolderView({ data, name }: { data: TreeDataItem[]; name: string }) {
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
