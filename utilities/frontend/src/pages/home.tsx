import { Button } from "@/components/ui/button";
import type { Page } from "@/data";
import { useDataStore } from "@/stores/data.store";
import { usePageStore } from "@/stores/page.store";
import { Download05Icon, Upload05Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Home() {
    const navigate = (subpage: Page) => () => {
        usePageStore.getState().setCurrentPage(subpage);
    };

    const doImport = async () => {
        const res = await window.importProjection();
        useDataStore.getState().setImportData(res);
        navigate("1.1")();
    };

    return (
        <div className="flex flex-row *:flex-1 *:h-full *:rounded-none size-full overflow-hidden">
            <Button variant={"ghost"} onClick={doImport}>
                <div className="flex flex-col items-center">
                    <HugeiconsIcon icon={Upload05Icon} className="size-24 mb-4 text-brand" />
                    <span className="text-2xl font-semibold">Import</span>
                    <span className="text-muted-foreground text-xl">Projection File (.zip)</span>
                </div>
            </Button>
            <Button variant={"ghost"} onClick={navigate("1.2")}>
                <div className="flex flex-col items-center">
                    <HugeiconsIcon icon={Download05Icon} className="size-24 mb-4 text-brand" />
                    <span className="text-2xl font-semibold">Export</span>
                    <span className="text-muted-foreground text-xl">Projection File (.zip)</span>
                </div>
            </Button>
        </div>
    );
}
