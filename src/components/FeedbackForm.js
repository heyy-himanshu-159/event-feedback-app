import React, { useState } from 'react';
import './FeedbackForm.css';

function FeedbackForm({ addFeedback }) {
  const [formData, setFormData] = useState({
    name: '', session: '', rating: 5, comment: ''
  });
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const analyzeSentiment = async (text) => {
    setLoading(true);
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    // Fallback if API key is not configured
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      setLoading(false);
      const fallback = { sentiment: 'neutral', score: 50, summary: 'API key not configured' };
      setSentiment(fallback);
      return fallback;
    }
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze the sentiment of this event feedback and respond with ONLY a JSON object like this: {"sentiment": "positive/negative/neutral", "score": 0-100, "summary": "one line summary"}
                
Feedback: "${text}"`
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if response has expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response structure');
      }

      const rawText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);
      setSentiment(result);
      return result;
    } catch (err) {
      console.error('Sentiment analysis error:', err);
      const fallback = { sentiment: 'neutral', score: 50, summary: 'Analysis unavailable' };
      setSentiment(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const analysis = await analyzeSentiment(formData.comment);
    const feedback = {
      ...formData,
      sentiment: analysis,
      timestamp: new Date().toLocaleString()
    };
    addFeedback(feedback);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h2>Feedback Submitted!</h2>
        {sentiment && (
          <div className={`sentiment-badge ${sentiment.sentiment}`}>
            <p>Sentiment: {sentiment.sentiment.toUpperCase()}</p>
            <p>Score: {sentiment.score}/100</p>
            <p>{sentiment.summary}</p>
          </div>
        )}
        <button onClick={() => {
          setSubmitted(false);
          setFormData({ name: '', session: '', rating: 5, comment: '' });
          setSentiment(null);
        }}>
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>📝 Event Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Name</label>
          <input type="text" placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required />
        </div>
        <div className="form-group">
          <label>Session Name</label>
          <select value={formData.session}
            onChange={(e) => setFormData({...formData, session: e.target.value})}
            required>
            <option value="">Select Session</option>
            <option value="Opening Keynote">Opening Keynote</option>
            <option value="AI Workshop">AI Workshop</option>
            <option value="Networking Session">Networking Session</option>
            <option value="Panel Discussion">Panel Discussion</option>
            <option value="Closing Ceremony">Closing Ceremony</option>
          </select>
        </div>
        <div className="form-group">
          <label>Rating: {formData.rating}/10</label>
          <input type="range" min="1" max="10" value={formData.rating}
            onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})} />
          <div className="rating-labels"><span>1</span><span>10</span></div>
        </div>
        <div className="form-group">
          <label>Your Feedback</label>
          <textarea placeholder="Share your experience..."
            value={formData.comment}
            onChange={(e) => setFormData({...formData, comment: e.target.value})}
            rows="4" required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '🤖 AI Analyzing...' : '🚀 Submit Feedback'}
        </button>
      </form>
    </div>
  );
}

export default FeedbackForm;