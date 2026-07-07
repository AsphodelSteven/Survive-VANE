import WeatherDashboard from './components/WeatherDashboard';
import { AIDashboard } from './components/AIDashboard';
import { AppNavigation } from './components/AppNavigation';
import { useState } from 'react';



function App() {
  const [view, setView] = useState('Dashboard');
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <AppNavigation currentView={view} setView={setView} />
      
      <main className="p-4">
        {view === 'Dashboard' ? <WeatherDashboard /> : <AIDashboard />}
      </main>
    </div>
  );
}

export default App;