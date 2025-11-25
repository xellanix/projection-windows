import { useNavigatorStore } from "@/stores/navigator.store";
import { useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function FinishExport() {
    const setNext = useNavigatorStore((s) => s.setNextContent);
    const setNextFunc = useNavigatorStore((s) => s.setNextFunc);
    const setBack = useNavigatorStore((s) => s.setBackContent);

    useEffect(() => {
        setBack("");
        setNext("Close");
        setNextFunc(async () => {
            useNavigatorStore.getState().setNextLoading(true);
            await window.closeApp();
        });
    }, [setBack, setNext, setNextFunc]);

    return (
        <div className="flex flex-col h-full gap-8 overflow-hidden">
            <div className="flex flex-col gap-4 h-full overflow-hidden justify-center items-center">
                <DotLottieReact src="./success.lottie" autoplay className="h-48" />
                <h1 className="text-center font-bold text-2xl">
                    Everything Is <span className="text-brand">Ready</span>!
                </h1>
                <div className="flex flex-col gap-2 justify-center items-center">
                    <p className="text-center text-muted-foreground">
                        You can now close this window and share your{" "}
                        <b className="font-semibold">Projection</b> with others.
                    </p>
                </div>
            </div>
        </div>
    );
}
