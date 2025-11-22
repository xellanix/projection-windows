import { useNavigatorStore } from "@/stores/navigator.store";
import { useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useErrorStore } from "@/stores/error.store";

export default function Error({
    setIsBuild,
    canManual,
}: {
    setIsBuild: (v: null | boolean) => void;
    canManual: boolean;
}) {
    const setNext = useNavigatorStore((s) => s.setNextContent);
    const setNextFunc = useNavigatorStore((s) => s.setNextFunc);
    const setBack = useNavigatorStore((s) => s.setBackContent);
    const setBackFunc = useNavigatorStore((s) => s.setBackFunc);
    const error = useErrorStore((s) => s.error);

    useEffect(() => {
        if (canManual) {
            setBack("Process Manually");
            setBackFunc(() => setIsBuild(null));
        } else {
            setBack("");
        }
        setNext("Try Again");
        setNextFunc(() => setIsBuild(true));
    }, [canManual, setBack, setBackFunc, setIsBuild, setNext, setNextFunc]);

    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden justify-center items-center">
            <DotLottieReact src="./error.lottie" autoplay className="h-48" />
            <h1 className="text-center font-bold text-2xl">Oops, Something Went Wrong!</h1>
            <div className="flex flex-col gap-2 justify-center items-center">
                {canManual ? (
                    <p className="text-center text-muted-foreground">
                        You can try this process again or do it manually
                        <br />
                        according to the instructions provided on the previous page.
                        <br />
                        Click on <b className="font-semibold">Process Manually</b> to go to the
                        previous page.
                    </p>
                ) : (
                    <p className="text-center text-muted-foreground">
                        You can try this process again by clicking on{" "}
                        <b className="font-semibold">Try Again</b>.
                    </p>
                )}
            </div>
            <code className="bg-muted px-2 py-1 rounded-sm text-muted-foreground text-sm max-w-3/4 max-h-24 overflow-y-auto whitespace-pre-wrap">
                {error || "Unknown Error"}
            </code>
        </div>
    );
}
