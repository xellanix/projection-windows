import { Stepper, type StepItem } from "@/components/stepper";
import { Button } from "@/components/ui/button";
import Home from "@/pages/home";
import { usePageStore } from "@/stores/page.store";
import { useShallow } from "zustand/react/shallow";
import { AnimatePresence, type Variants } from "motion/react";
import * as motion from "motion/react-client";
import { useNavigatorStore } from "@/stores/navigator.store";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const steps: Record<string, StepItem[]> = {
    "1.1": [
        {
            id: "1.1",
            name: "Content Review",
        },
        {
            id: "1.1.1",
            name: "Extract and Import",
        },
        {
            id: "1.1.1.1",
            name: "Build Projection",
        },
        {
            id: "1.1.1.1.1",
            name: "Finish",
        },
    ],
    "1.2": [
        {
            id: "1.2",
            name: "Content Review",
        },
        {
            id: "1.2.1",
            name: "Pack Projection",
        },
        {
            id: "1.2.1.1",
            name: "Finish",
        }
    ]
};

function Navigator() {
    const [back, next] = useNavigatorStore(useShallow((s) => [s.back, s.next]));
    const direction = usePageStore((s) => (s.isForward ? 1 : -1));

    return (
        <AnimatePresence mode={"popLayout"} custom={direction}>
            <motion.div
                key={back.content + next.content}
                initial={"hidden"}
                animate={"visible"}
                exit={"hidden"}
                transition={{ duration: 0.15, ease: "easeOut" }}
                custom={direction}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                }}
                className={cn("flex flex-row justify-between w-full", {
                    "flex-row-reverse": !back.content,
                })}>
                {back.content && (
                    <Button variant={"outline"} onClick={back.func} disabled={back.isLoading}>
                        {back.isLoading && <Spinner />}
                        {back.content}
                    </Button>
                )}
                {next.content && (
                    <Button variant={"brand"} onClick={next.func} disabled={next.isLoading}>
                        {next.isLoading && <Spinner />}
                        {next.content}
                    </Button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

const transition: Variants = {
    initial: (direction: number) => ({ opacity: 0, transform: `translateX(${direction * 100}px)` }),
    animate: { opacity: 1, transform: "translateX(0px)" },
    exit: (direction: number) => ({ opacity: 0, transform: `translateX(${direction * -100}px)` }),
};

function TransitionWrapper({ itemKey, children }: { itemKey: string; children: React.ReactNode }) {
    const direction = usePageStore((s) => (s.isForward ? 1 : -1));

    return (
        <AnimatePresence mode="wait" custom={direction}>
            <motion.div
                key={itemKey}
                initial={"initial"}
                animate={"animate"}
                exit={"exit"}
                transition={{ duration: 0.15, ease: "easeOut" }}
                custom={direction}
                variants={transition}
                className="size-full flex flex-col overflow-hidden">
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

function App() {
    const [pages, currentPage] = usePageStore(useShallow((s) => [s.pages, s.currentPage]));
    const Page = pages[currentPage];
    const isHome = currentPage === "1";

    return (
        <TransitionWrapper itemKey={isHome ? "0" : "1"}>
            {isHome ? (
                <Home />
            ) : (
                <div className="flex flex-col px-16 py-8 h-full gap-8 overflow-hidden">
                    <Stepper steps={steps[currentPage.slice(0, 3)]} />
                    <TransitionWrapper itemKey={currentPage}>
                        <Page />
                    </TransitionWrapper>
                    <Navigator />
                </div>
            )}
        </TransitionWrapper>
    );
}

export default App;
