import { Progress } from "@/components/ui/progress";
import type { Page } from "@/data";
import { cn } from "@/lib/utils";
import { usePageStore } from "@/stores/page.store";
import { memo } from "react";

export type StepItem = {
    id: Page;
    name: string;
};

interface StepperProps {
    steps: StepItem[];
}
function StepperR({ steps }: StepperProps) {
    return (
        <div className="flex flex-row gap-4">
            {steps.map((step) => (
                <StepperItem key={step.id} step={step} />
            ))}
        </div>
    );
}
export const Stepper = memo(StepperR);
Stepper.displayName = "Stepper";

function StepperItemR({ step }: { step: StepItem }) {
    const isActive = usePageStore((s) => s.currentPage.startsWith(step.id));

    return (
        <div className="flex flex-col flex-1 gap-2">
            <Progress value={isActive ? 100 : 0} />
            <span className={cn("font-semibold", { "text-muted-foreground font-normal": !isActive })}>
                {step.name}
            </span>
        </div>
    );
}
const StepperItem = memo(StepperItemR);
StepperItem.displayName = "StepperItem";
