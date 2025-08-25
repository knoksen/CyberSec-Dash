import React, { useCallback, useMemo, useState } from "react";

const Footer: React.FC = () => {
    const hasUpdater = useMemo(
        () => typeof window !== "undefined" && !!(window as any).api?.checkForUpdates,
        []
    );

    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<null | "ok" | "fail">(null);

    const onCheck = useCallback(async () => {
        if (!hasUpdater) return;
        try {
            setChecking(true);
            setResult(null);
            // @ts-ignore available when running in Electron
            const res = await window.api.checkForUpdates();
            setResult(res?.ok ? "ok" : "fail");
        } catch {
            setResult("fail");
        } finally {
            setChecking(false);
        }
    }, [hasUpdater]);

    return (
        <footer className="bg-gray-800 text-white p-4 text-center">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                <div>© {new Date().getFullYear()} Cyber Agents • Built with React &amp; Gemini API</div>
                {hasUpdater && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-sm disabled:opacity-60"
                            onClick={onCheck}
                            disabled={checking}
                        >
                            {checking ? "Checking…" : "Check for Updates"}
                        </button>
                        {result === "ok" && (
                            <span className="text-green-400 text-sm">Checked</span>
                        )}
                        {result === "fail" && (
                            <span className="text-red-400 text-sm">Failed</span>
                        )}
                    </div>
                )}
            </div>
        </footer>
    );
};

export default Footer;

