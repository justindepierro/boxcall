import React, { useEffect, useState } from "react";

interface VitalRecord {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  threshold: number;
  timestamp: number;
}

declare global {
  interface Window {
    __WEB_VITALS__?: VitalRecord[];
    __BUILD_META__?: { buildTime: string; mode: string };
  }
}

export const DiagnosticsPage: React.FC = () => {
  const [vitals, setVitals] = useState<VitalRecord[]>(
    () => window.__WEB_VITALS__ || []
  );
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<VitalRecord>).detail;
      setVitals((prev) => {
        const next = [...prev.filter((v) => v.name !== detail.name), detail];
        next.sort((a, b) => a.name.localeCompare(b.name));
        return next;
      });
    }
    window.addEventListener("web-vitals", handler as EventListener);
    return () =>
      window.removeEventListener("web-vitals", handler as EventListener);
  }, []);
  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-semibold mb-4">Diagnostics (Dev Only)</h1>
      <section className="mb-8">
        <h2 className="text-xl font-medium mb-2">Build Metadata</h2>
        <pre className="bg-surface-secondary p-3 rounded text-sm overflow-auto">
          {JSON.stringify(
            {
              buildTime: window.__BUILD_META__?.buildTime || "N/A",
              mode: window.__BUILD_META__?.mode || import.meta.env.MODE,
            },
            null,
            2
          )}
        </pre>
      </section>
      <section>
        <h2 className="text-xl font-medium mb-2">Web Vitals</h2>
        {vitals.length === 0 && (
          <p className="text-text-secondary text-sm">Waiting for metrics...</p>
        )}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-border-subtle">
              <th className="py-1 pr-2">Name</th>
              <th className="py-1 pr-2">Value</th>
              <th className="py-1 pr-2">Threshold</th>
              <th className="py-1 pr-2">Rating</th>
              <th className="py-1 pr-2">Delta</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map((v) => (
              <tr
                key={v.name}
                className="border-b border-border-subtle last:border-none"
              >
                <td className="py-1 pr-2 font-medium">{v.name}</td>
                <td className="py-1 pr-2 tabular-nums">{v.value.toFixed(2)}</td>
                <td className="py-1 pr-2 tabular-nums">{v.threshold}</td>
                <td className="py-1 pr-2 capitalize">
                  {v.rating.replace("-", " ")}
                </td>
                <td className="py-1 pr-2 tabular-nums">
                  {(v.value - v.threshold).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
export default DiagnosticsPage;
