export function DataToggle({
  label, active, onToggle, icon: Icon, note,
}: {
  label: string; active: boolean; onToggle: () => void; icon: React.ElementType; note: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all duration-200 ${
        active
          ? "border-[rgba(0,212,255,0.22)] bg-[rgba(0,212,255,0.05)]"
          : "border-[rgba(255,255,255,0.04)] bg-transparent hover:border-[rgba(0,212,255,0.08)]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={12} className={active ? "text-[#00d4ff]" : "text-[#333]"} />
        <div>
          <div className={`text-[11px] font-mono ${active ? "text-white" : "text-[#444]"}`}>{label}</div>
          <div className="text-[9px] font-mono text-[#2a3a44] mt-0.5">{note}</div>
        </div>
      </div>
      <div
        className={`w-8 h-[18px] rounded-full relative flex-shrink-0 border transition-all duration-200 ${
          active ? "bg-[rgba(0,212,255,0.2)] border-[rgba(0,212,255,0.45)]" : "bg-[#111] border-[#222]"
        }`}
      >
        <span
          className={`absolute top-[3px] w-3 h-3 rounded-full transition-all duration-200 ${
            active ? "left-[17px] bg-[#00d4ff]" : "left-[3px] bg-[#333]"
          }`}
          style={{ boxShadow: active ? "0 0 6px rgba(0,212,255,0.8)" : undefined }}
        />
      </div>
    </button>
  );
}