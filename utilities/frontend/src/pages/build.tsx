import { useNavigatorStore } from "@/stores/navigator.store";
import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import Error from "@/pages/error";
import { useErrorStore } from "@/stores/error.store";
import { usePageStore } from "@/stores/page.store";

function BuildSection({ setIsBuild }: { setIsBuild: (v: null | boolean) => void }) {
    const setNext = useNavigatorStore((s) => s.setNextContent);
    const setNextFunc = useNavigatorStore((s) => s.setNextFunc);
    const setBack = useNavigatorStore((s) => s.setBackContent);
    const setBackFunc = useNavigatorStore((s) => s.setBackFunc);

    useEffect(() => {
        setBack("Build Later");
        setBackFunc(() => usePageStore.getState().next());
        setNext("Build Now");
        setNextFunc(() => setIsBuild(true));
    }, [setBack, setBackFunc, setIsBuild, setNext, setNextFunc]);

    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden justify-center items-center">
            <DotLottieReact src="./success.lottie" autoplay className="h-48" />
            <h1 className="text-center font-bold text-2xl">
                The Extraction Is Complete!
                <br />
                Would You Like to <span className="text-brand">Build It Now</span>?
            </h1>
            <div className="flex flex-col gap-2 justify-center items-center">
                <p className="text-center text-muted-foreground">
                    You can also build manually later by running this command
                    <br />
                    in the terminal that refers to the <b className="font-semibold">
                        Projection
                    </b>{" "}
                    project folder.
                </p>
                <code className="bg-muted px-2 py-1 rounded-sm text-muted-foreground">
                    bun run build
                </code>
            </div>
        </div>
    );
}

function BuildProcess({ setIsBuild }: { setIsBuild: (v: null | boolean) => void }) {
    const setNext = useNavigatorStore((s) => s.setNextContent);
    const setBack = useNavigatorStore((s) => s.setBackContent);

    useEffect(() => {
        setBack("");
        setNext("");
    }, [setBack, setNext]);

    useEffect(() => {
        const task = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const res = await window.build();
            if (res === "Success") usePageStore.getState().next();
            else {
                useErrorStore.getState().setError(res);
                setIsBuild(false);
            }
        };
        task();
    }, [setIsBuild]);

    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden justify-center items-center">
            <DotLottieReact src="./build.lottie" loop autoplay className="h-48" />
            <h1 className="text-center font-bold text-2xl">Building...</h1>
            <p className="text-center text-muted-foreground">
                Please wait a few seconds while we build your projection file. <br />
                <b className="font-semibold">This process cannot be canceled.</b>
            </p>
        </div>
    );
}

export default function Build() {
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
                {isBuild === true ? (
                    <BuildProcess setIsBuild={setIsBuild} />
                ) : isBuild === null ? (
                    <BuildSection setIsBuild={setIsBuild} />
                ) : (
                    <Error setIsBuild={setIsBuild} canManual />
                )}
            </motion.div>
        </AnimatePresence>
    );
}
