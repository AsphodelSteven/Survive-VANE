// Weather Dash + AI Dash + System Config
interface NavProps {
  currentView: string;
  setView: (view: string) => void;
}

export function AppNavigation({ currentView, setView }: NavProps) {
  const links = ['Dashboard', 'AI'];

  return (
    <nav className="flex gap-4 p-4 border-b border-slate-800 bg-slate-900">
      {links.map((link) => (
        <button
          key={link}
          onClick={() => setView(link)}
          className={`font-mono text-xs uppercase tracking-widest px-3 py-1 rounded transition-colors ${
            currentView === link ? 'bg-cyan-400/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {link}
        </button>
      ))}
    </nav>
  );
}