export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-[rgba(0,212,255,0.11)] bg-[rgba(10,20,28,0.78)] backdrop-blur-md ${className}`}
      style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,212,255,0.05)" }}
    >
      {children}
    </div>
  );
}