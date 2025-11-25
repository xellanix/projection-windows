import { convert, FolderView, type TreeDataItem } from "@/components/folder-view";
import { Separator } from "@/components/ui/separator";
import { useNavigatorStore } from "@/stores/navigator.store";
import { useEffect, useState } from "react";

export default function Export() {
    const setNext = useNavigatorStore((s) => s.setNextContent);
    const setBack = useNavigatorStore((s) => s.setBackContent);
    const [viewData, setViewData] = useState<[TreeDataItem[], TreeDataItem[]]>([[], []]);

    useEffect(() => {
        const task = async () => {
            const data = await window.exportProjection();

            const assets = data.filter((i) => i.data === "public");
            const queue = data.filter((i) => i.data === "data");
            if (assets.length === 0 || queue.length === 0) return [[], []];
            setViewData([convert(assets[0]!.children!), convert(queue[0]!.children!)]);
        };

        task();
    }, []);

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
