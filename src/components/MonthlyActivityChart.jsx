import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,   // ⭐ REQUIRED FOR fill: true
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

function MonthlyActivityChart({ data }) {
  if (!data) return null;

  const labels = data.map((item) => item.date);
  const counts = data.map((item) => item.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Monthly Transactions",
        data: counts,
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.3)",
        tension: 0.3,
        fill: true,   // ⭐ Now works
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

export default MonthlyActivityChart;
