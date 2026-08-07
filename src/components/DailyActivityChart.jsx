import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function DailyActivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div>
        <h3>Daily Activity</h3>
        <p>No activity data available.</p>
      </div>
    );
  }

  const labels = data.map((item) => {
    const dateObj = new Date(item.date);
    return dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  });

  const counts = data.map((item) => item.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Transactions per Day",
        data: counts,
        backgroundColor: "rgba(0, 123, 255, 0.7)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Transactions: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
      x: {
        ticks: { maxRotation: 0, minRotation: 0 },
      },
    },
  };

  return (
    <div>
      <h3>Daily Activity</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
