import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import './App.css';
import { masterSectorMap, sectorColors } from './sectorData';

// --- CUSTOM TOOLTIP COMPONENT ---
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="recharts-custom-tooltip">
        <p className="tooltip-price">
          {`₹${payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 1 })}`}
        </p>
      </div>
    );
  }
  return null;
};

// --- SUB-COMPONENT: STABLE RECHARTS SPARKLINE ---
const MiniSparkline = ({ historyString, isPositive }) => {
  if (!historyString) return null;

  const data = historyString.split(',').map((val, index) => ({
    time: index,
    price: Number(val)
  }));

  const strokeColor = isPositive ? '#00aa00' : '#ff0000';

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`colorPrice-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '3 3' }}
            isAnimationActive={false}
          />
          
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={strokeColor} 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill={`url(#colorPrice-${isPositive})`} 
            animationDuration={0}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getFadingGradient = (name) => {
    if (!name) return '#ffffff';
    const stockName = name.toLowerCase();
    const entry = Object.keys(masterSectorMap).find(k => stockName.includes(k.toLowerCase()));
    const sector = entry ? masterSectorMap[entry] : "DEFAULT";
    const baseColor = sectorColors[sector] || '#eef0f2';
    return `linear-gradient(to right, ${baseColor} 0%, ${baseColor}66 30%, #ffffff 85%)`;
  };

  useEffect(() => {
    const apiURL = 'https://script.google.com/macros/s/AKfycbz9y8CAEoIUApsJFXC3RCAv84kC5d35IGKmgwePh-6GFAyBADY-qx0BtbEdkreW2Mm_BQ/exec';
    fetch(apiURL, { redirect: 'follow' })
      .then(res => res.json())
      .then(data => { 
        setStocks(data); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-container"><h3>Syncing with Google Sheets...</h3></div>;
  }

  return (
    <div className="white-mode-wrapper">
      <div className="dense-grid">
        {stocks && stocks.map((s, i) => {
          const monthUp = s.m && s.m.startsWith('+');
          const dailyUp = s.d && s.d.startsWith('+');

          return (
            <div 
              key={i} 
              className="mini-card" 
              style={{ background: getFadingGradient(s.n) }}
            >
              <div className="single-line-row">
                <span className="stock-name">{s.n}</span>
                <div className="stats-group">
                  <span className={`val ${dailyUp ? 'pos' : 'neg'}`}>{s.d}</span>
                  <span className={`val ${monthUp ? 'pos' : 'neg'}`}>{s.m}%</span>
                </div>
              </div>

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