import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const StockChart = ({ chartData, onPeriodChange }) => {
  const [activePeriod, setActivePeriod] = useState("6m");
  const periods = [
    { label: "1M", value: "1m" },
    { label: "6M", value: "6m" },
    { label: "1Y", value: "1y" },
    { label: "5Y", value: "5y" },
  ];

  const handlePeriodClick = (period) => {
    setActivePeriod(period);
    onPeriodChange(period);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#8b949e", maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }, grid: { color: "#21262d" } },
      y: { ticks: { color: "#8b949e" }, grid: { color: "#21262d" } },
    },
    interaction: { intersect: false, mode: "index" },
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Price",
        data: chartData.data,
        borderColor: chartData.isPositive ? "#238636" : "#da3633",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          const color = chartData.isPositive ? "rgba(35, 134, 54, 0.3)" : "rgba(218, 54, 51, 0.3)";
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, "rgba(13, 17, 23, 0)");
          return gradient;
        },
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-end mb-2">
        <div className="bg-[#0d1117] rounded-md p-1 flex space-x-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodClick(p.value)}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                activePeriod === p.value ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-grow">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default StockChart;
