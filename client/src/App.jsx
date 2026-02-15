// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreatePoll from './CreatePoll';
import PollPage from './PollPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* Changed class name here */}
      <div className="app-container">
        <Routes>
          <Route path="/" element={<CreatePoll />} />
          <Route path="/poll/:id" element={<PollPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;