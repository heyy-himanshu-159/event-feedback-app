import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#00C49F', '#FF8042', '#0088FE'];

function Dashboard({ feedbacks }) {
  if (feedbacks.length === 0) {
    return (
      <div className="empty-dashboard">
        <div className="empty-icon">📊</div>
        <h2>No Feedback Yet!</h2>
        <p>Submit some feedback to see analytics here</p>
      </div>
    );
  }

  // Rating data for bar chart
  const sessionRatings = feedbacks.reduce((acc, f) => {
    if (!acc[f.session]) acc[f.session] = { total: 0, count: 0 };
    acc[f.session].total += f.rating;
    acc[f.session].count += 1;
    return acc;
  }, {});

  const barData = Object.keys(sessionRatings).map(session => ({
    session: session.split(' ')[0],
rating: parseFloat((sessionRatings[session].total / sessionRatings[session].count).toFixed(1))
  }));

  // Sentiment data for pie chart
  const sentimentCounts = feedbacks.reduce((acc, f) => {
    const s = f.sentiment?.sentiment || 'neutral';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(sentimentCounts).map(key => ({
    name: key,
    value: sentimentCounts[key]
  }));

  const avgRating = (
    feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
  ).toFixed(1);

  const positiveCount = feedbacks.filter(
    f => f.sentiment?.sentiment === 'positive'
  ).length;

  return (
    <div className="dashboard">
      <h2>📊 Live Analytics Dashboard</h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-number">{feedbacks.length}</div>
          <div className="stat-label">Total Feedbacks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">{avgRating}</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">😊</div>
          <div className="stat-number">{positiveCount}</div>
          <div className="stat-label">Positive Reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-number">
            {Math.round((positiveCount / feedbacks.length) * 100)}%
          </div>
          <div className="stat-label">Satisfaction Rate</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Session Ratings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="session" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="rating" fill="#667eea" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Sentiment Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({name, value}) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Feedbacks */}
      <div className="feedback-list">
        <h3>Recent Feedbacks</h3>
        {feedbacks.slice().reverse().map((f, i) => (
          <div key={i} className="feedback-item">
            <div className="feedback-header">
              <span className="feedback-name">👤 {f.name}</span>
              <span className="feedback-session">{f.session}</span>
              <span className="feedback-rating">⭐ {f.rating}/10</span>
              <span className={`feedback-sentiment ${f.sentiment?.sentiment}`}>
                {f.sentiment?.sentiment?.toUpperCase()}
              </span>
            </div>
            <p className="feedback-comment">{f.comment}</p>
            <span className="feedback-time">{f.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;