import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieActivityChart({ data }) {
  if (!data) return null;

  const chartData = {
    labels: ["Fund", "Send", "Withdraw"],
    datasets: [
      {
        label: "Transaction Breakdown",
        data: [data.fund, data.send, data.withdraw],
        backgroundColor: [
          "rgba(0, 123, 255, 0.7)",   // Fund
          "rgba(40, 167, 69, 0.7)",   // Send
          "rgba(220, 53, 69, 0.7)",   // Withdraw
        ],
        borderColor: [
          "rgba(0, 123, 255, 1)",
          "rgba(40, 167, 69, 1)",
          "rgba(220, 53, 69, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return <Pie data={chartData} options={options} />;
}

export default PieActivityChart;
