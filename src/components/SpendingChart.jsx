import React from "react";
import { Pie } from "react-chartjs-2";

export default function SpendingChart({ data }) {
  if (!data || typeof data !== "object") {
    return <p>No spending data available.</p>;
  }

  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Spending Breakdown",
        data: values,
        backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#FF5722"],
      },
    ],
  };

  return (
    <div>
      <h3>Spending Breakdown</h3>
      <Pie data={chartData} />
    </div>
  );
}
