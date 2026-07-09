export function ChartToolTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-[rgba(0,212,255,0.18)] bg-[rgba(4,12,18,0.97)] px-3 py-2 text-[10px] font-mono">
      <p className="text-[#00d4ff]/60 mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} style={{ color: e.color ?? e.stroke }}>
          {e.name}: {typeof e.value === "number" ? e.value.toFixed(2) : e.value}
        </p>
      ))}
    </div>
  );
}