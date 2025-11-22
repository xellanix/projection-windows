import { useNavigatorStore } from "@/stores/navigator.store";
import { useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Finish() {
    const setNext = useNavigatorStore((s) => s.setNextContent);
    const setNextFunc = useNavigatorStore((s) => s.setNextFunc);
    const setBack = useNavigatorStore((s) => s.setBackContent);
    const setBackFunc = useNavigatorStore((s) => s.setBackFunc);

    useEffect(() => {
        setBack("Close");
        setBackFunc(async () => {
            useNavigatorStore.getState().setBackLoading(true);
            await window.closeApp();
        });
        setNext("Close & Start");
        setNextFunc(async () => {
            useNavigatorStore.getState().setNextLoading(true);
            await window.closeAndStart();
        });
    }, [setBack, setBackFunc, setNext, setNextFunc]);

    return (
        <div className="flex flex-col h-full gap-8 overflow-hidden">
            <div className="flex flex-col gap-4 h-full overflow-hidden justify-center items-center">
                <DotLottieReact src="./success.lottie" autoplay className="h-48" />
                <h1 className="text-center font-bold text-2xl">
                    Everything Is <span className="text-brand">Ready</span>!
                </h1>
                <div className="flex flex-col gap-2 justify-center items-center">
                    <p className="text-center text-muted-foreground">
                        You can now close this window and start using the{" "}
                        <b className="font-semibold">Projection</b>.
                    </p>
                    <div className="flex flex-col gap-2 justify-center items-center">
                        <p className="text-center text-muted-foreground">
                            To start it manually, run this command in the terminal that refers to
                            the <b className="font-semibold">Projection</b> project folder
                            <br />
                            and then go to <code>http://localhost:3000</code>.
                        </p>
                        <code className="bg-muted px-2 py-1 rounded-sm text-muted-foreground">
                            bun run start
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
}
