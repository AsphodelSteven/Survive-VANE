export function TuningSlider({
  label, value, onChange, desc, min = 0, max = 1, step = 0.001, fmt,
}: {
  label: string; value: number; onChange: (v: number) => void; desc: string;
  min?: number; max?: number; step?: number; fmt?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = fmt ? fmt(value) : value.toFixed(3);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-white/75">{label}</span>
        <span className="text-[11px] font-mono text-[#00d4ff]">{display}</span>
      </div>
      <div className="relative">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, rgba(0,212,255,0.7) ${pct}%, rgba(0,212,255,0.09) ${pct}%)`,
          }}
        />
      </div>
      <p className="text-[8.5px] font-mono text-[#00d4ff]/28 leading-relaxed">{desc}</p>
    </div>
  );
}