import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getDevelopmentAreaLabel } from "../../constants/developmentAreas";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function DevelopmentProgressChart({ progressPoints, selectedArea }) {
  const chartData = {
    labels: progressPoints.map((point) => formatDate(point.date)),
    datasets: [
      {
        label: getDevelopmentAreaLabel(selectedArea),
        data: progressPoints.map((point) => point.score),
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Grafički prikaz napretka</h5>

        {progressPoints.length === 0 ? (
          <div className="alert alert-info mb-0">
            Nema dovoljno podataka za prikaz grafikona.
          </div>
        ) : (
          <div style={{ height: "320px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("sr-RS");
}

export default DevelopmentProgressChart;