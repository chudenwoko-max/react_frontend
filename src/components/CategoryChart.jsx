// src/components/CategoryChart.jsx

import { Pie } from "react-chartjs-2";

export default function CategoryChart({ data }) {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#6c63ff",
          "#28a745",
          "#dc3545",
          "#ffc107",
          "#17a2b8",
          "#fd7e14",
          "#6c757d",
        ],
      },
    ],
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
      }}
    >
      <h3>Category Spending</h3>
      <Pie data={chartData} />
    </div>
  );
}
