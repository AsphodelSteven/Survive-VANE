import WeatherDashboard from './components/WeatherDashboard';

function App() {
  // We are bypassing the Auth check for now so you can diagnose the UI
  return (
    <main className="vane-theme">
      <WeatherDashboard />
    </main>
  );
}

export default App;