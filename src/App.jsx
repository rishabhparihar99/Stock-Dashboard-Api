import React, { useState, useEffect } from 'react';
import './App.css';
import { masterSectorMap, sectorColors } from './sectorData';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Your specific Deployed Web App URL
    const apiURL = 'https://script.google.com/macros/s/AKfycbzCS6wE5wzkkjvwSbBt0md6SEgm5__4M-bAOQbpSaViW1nEtN-xw1hTnBc0nEMbtVwPnw/exec';

    fetch(apiURL, { redirect: 'follow' })
      .then(response => response.json())
      .then(data => {
        setStocks(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching stocks:', error);
        setLoading(false);
      });
  }, []);

  const getFadingGradient = (name) => {
    const stockName = name.toLowerCase();
    const entry = Object.keys(masterSectorMap).find(key => {
      const keyLower = key.toLowerCase();
      return stockName.includes(keyLower) || keyLower.includes(stockName);
    });

    const sector = entry ? masterSectorMap[entry] : "DEFAULT";
    const baseColor = sectorColors[sector];
    return `linear-gradient(to right, ${baseColor} 0%, ${baseColor}66 30%, #ffffff 85%)`;
  };

  // --- Point 3: Loading and Empty State Handling ---
  if (loading) {
    return (
      <div className="white-mode-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666' }}>
        <h3>Synchronizing with Google Sheets...</h3>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="white-mode-wrapper" style={{ padding: '20px', color: '#666' }}>
        <h3>No stock data found. Please check your Google Sheet.</h3>
      </div>
    );
  }

  return (
    <div className="white-mode-wrapper">
      <div className="dense-grid">
        {stocks.map((s, i) => {
          const dailyUp = s.d.startsWith('+');
          const monthUp = s.m.startsWith('+');
          const gradient = getFadingGradient(s.n);

          return (
            <div 
              key={i} 
              className="mini-card" 
              style={{ background: gradient }}
            >
              <div className="single-line-row">
                <span className="stock-name">{s.n}</span>
                <div className="stats-group">
                  <span className={`val ${dailyUp ? 'pos' : 'neg'}`}>
                    {dailyUp ? '▲' : '▼'}{s.d}
                  </span>
                  <span className={`val ${monthUp ? 'pos' : 'neg'}`}>
                    {monthUp ? '▲' : '▼'}{s.m}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;