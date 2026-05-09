import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import './App.css';
import { masterSectorMap, sectorColors } from './sectorData';

// Simple Bar Chart Component for the Sparkline
const MiniSparkline = ({ historyString, isPositive }) => {
  if (!historyString) return null;

  // Convert string into array of numbers
  const data = historyString.split(',').map(Number);

  const series = [{ data: data }];
  const options = {
  chart: { 
    type: 'line', 
    sparkline: { enabled: true }, 
    animations: { enabled: false },
    // This prevents the chart from expanding beyond the container
    parentHeightOffset: 0,
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      columnWidth: '50%', // Thinner bars look more like a sparkline
      borderRadius: 1,
      // Prevents bars from growing too tall
      dataLabels: { position: 'top' } 
    }
  },
  grid: {
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  },
  colors: [isPositive ? '#00aa00' : '#ff0000'],
  tooltip: { enabled: false }
};

  return (
    <div className="chart-container">
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </div>
  );
};

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Updated Deployed Web App URL
    const apiURL = 'https://script.google.com/macros/s/AKfycbz9y8CAEoIUApsJFXC3RCAv84kC5d35IGKmgwePh-6GFAyBADY-qx0BtbEdkreW2Mm_BQ/exec';
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

  if (loading) {
    return (
      <div className="white-mode-wrapper loading-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h3>Synchronizing with Google Sheets...</h3>
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

              {/* Chart sits outside the row to allow absolute positioning in CSS */}
              <div className="hover-chart-wrapper">
                <MiniSparkline historyString={s.h} isPositive={monthUp} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;