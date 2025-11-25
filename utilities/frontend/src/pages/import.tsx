import { convert, FolderView, type TreeDataItem } from "@/components/folder-view";
import { Separator } from "@/components/ui/separator";
import { useDataStore } from "@/stores/data.store";
import { useNavigatorStore } from "@/stores/navigator.store";
import { useEffect, useMemo } from "react";

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
