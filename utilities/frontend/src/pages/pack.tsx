import { useNavigatorStore } from "@/stores/navigator.store";
import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { usePageStore } from "@/stores/page.store";
import { useErrorStore } from "@/stores/error.store";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import Error from "@/pages/error";

function PackProcess({ setIsBuild }: { setIsBuild: (v: null | boolean) => void }) {
    const setNext = useNavigatorStore((s) => s.setNextContent);
    const setBack = useNavigatorStore((s) => s.setBackContent);

    useEffect(() => {
        setBack("");
        setNext("");
    }, [setBack, setNext]);

    useEffect(() => {
        const task = async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const res = await window.pack();
            if (res === "Success") usePageStore.getState().next();
            else {
                useErrorStore.getState().setError(res);
                setIsBuild(false);
            }
        };
        task();
    }, [setIsBuild]);

    return (
        <div className="flex flex-col h-full gap-8 overflow-hidden">
            <div className="flex flex-col gap-4 h-full overflow-hidden justify-center items-center">
                <DotLottieReact src="./process.lottie" loop autoplay className="h-48" />
                <h1 className="text-center font-bold text-2xl">Packing...</h1>
                <p className="text-center text-muted-foreground">
                    Please wait a few seconds while we pack your projection file. <br />
                    <b className="font-semibold">This process cannot be canceled.</b>
                </p>
            </div>
        </div>
    );
}

export default function Pack() {
    const [isBuild, setIsBuild] = useState<null | boolean>(null);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={isBuild ? "1" : "2"}
                initial={"initial"}
                animate={"animate"}
                exit={"exit"}
                transition={{ duration: 0.15, ease: "easeOut" }}
                variants={{
                    initial: { opacity: 0, transform: `translateX(100px)` },
                    animate: { opacity: 1, transform: "translateX(0px)" },
                    exit: { opacity: 0, transform: `translateX(-100px)` },
                }}
                className="flex flex-col h-full gap-8 overflow-hidden">
                {isBuild === false ? (
                    <Error setIsBuild={setIsBuild} canManual={false} />
                ) : (
                    <PackProcess setIsBuild={setIsBuild} />
                )}
            </motion.div>
        </AnimatePresence>
    );
}
