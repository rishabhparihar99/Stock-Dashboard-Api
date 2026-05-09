import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Example using a generic API endpoint
      const response = await axios.get(`YOUR_API_URL/historical/${symbol}.NS?days=30`);
      
      const formattedData = response.data.map(item => ({
        x: new Date(item.date),
        y: item.close
      }));
      
      setChartData(formattedData);
    };
    fetchData();
  }, [symbol]);

  const options = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { type: 'datetime' },
    colors: ['#00aa00'], // Matching your 'pos' green color
  };

  const series = [{ name: 'Price', data: chartData }];

  return (
    <div className="chart-wrapper">
      <Chart options={options} series={series} type="line" height={200} />
    </div>
  );
};

export default StockChart;