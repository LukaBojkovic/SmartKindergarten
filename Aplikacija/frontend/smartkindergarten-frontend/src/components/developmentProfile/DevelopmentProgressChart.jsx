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
import { formatDate } from "../../utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AREA_COLORS = {
  SocialSkills: "#4f8f70",
  CognitiveDevelopment: "#4f7cac",
  MotorSkills: "#f4b860",
  SpeechLanguageDevelopment: "#9b6bcc",
};

function DevelopmentProgressChart({ progressPoints, selectedArea }) {
  const areaColor = AREA_COLORS[selectedArea] || "#4f8f70";
  const latestPoint = progressPoints[progressPoints.length - 1];
  
  const chartData = {
    labels: progressPoints.map((point) => formatDate(point.date)),
    datasets: [
      {
        label: getDevelopmentAreaLabel(selectedArea),
        data: progressPoints.map((point) => point.score),
        borderColor: areaColor,
        backgroundColor: areaColor,
        pointBackgroundColor: areaColor,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#dfe8e2",
          font: {
            weight: "600",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Ocena: ${context.parsed.y}/5`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#b8c7be",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.06)",
        },
      },
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          color: "#b8c7be",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.08)",
        },
      },
    },
  };

  return (
    <div className="card shadow-sm mb-4 development-chart-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h5 className="card-title mb-1">Grafički prikaz napretka</h5>
            <p className="text-muted mb-0">
              Oblast: {getDevelopmentAreaLabel(selectedArea)}
            </p>
          </div>

          {latestPoint && (
            <span className="badge development-score-badge">
              Poslednja ocena: {latestPoint.score}/5
            </span>
          )}
        </div>

        {progressPoints.length === 0 ? (
          <div className="alert alert-info mb-0">
            Nema dovoljno podataka za prikaz grafikona.
          </div>
        ) : (
          <div className="development-chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}

export default DevelopmentProgressChart;
