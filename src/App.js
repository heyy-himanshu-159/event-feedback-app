import React, { useState } from 'react';
import FeedbackForm from './components/FeedbackForm';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('feedback');
  const [feedbacks, setFeedbacks] = useState([]);

  const addFeedback = (feedback) => {
    setFeedbacks([...feedbacks, feedback]);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 Smart Event Feedback</h1>
        <nav>
          <button
            className={currentPage === 'feedback' ? 'active' : ''}
            onClick={() => setCurrentPage('feedback')}
          >
            Give Feedback
          </button>
          <button
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </button>
        </nav>
      </header>

      <main>
        {currentPage === 'feedback' ? (
          <FeedbackForm addFeedback={addFeedback} />
        ) : (
          <Dashboard feedbacks={feedbacks} />
        )}
      </main>
    </div>
  );
}

export default App;