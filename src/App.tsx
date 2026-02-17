import { IconDemo } from './components/IconDemo';
import './App.css';

function App() {
  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">AgentViz</h1>
        <p className="app__subtitle">OpenClaw Agent Activity Dashboard</p>
      </header>
      <IconDemo />
    </main>
  );
}

export default App;
