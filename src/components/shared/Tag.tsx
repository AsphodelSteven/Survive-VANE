export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-mono tracking-[0.22em] text-[#00d4ff]/45 uppercase">
      {children}
    </span>
  );
}