import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddCandidate from './pages/AddCandidate';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/candidates/new" element={<AddCandidate />} />
      </Routes>
    </div>
  );
}

export default App;
