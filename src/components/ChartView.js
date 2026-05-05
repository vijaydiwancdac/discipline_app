let weeklyChart = null;
let monthlyChart = null;

function buildChart(canvas, label, borderColor, backgroundColor) {
  return new Chart(canvas, {
    type: "line",
    data: {
      labels: Array.from({ length: 0 }),
      datasets: [{
        label,
        data: [],
        borderColor,
        backgroundColor,
        tension: 0.25,
        pointRadius: 3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#bbb" } },
        y: {
          grid: { color: "rgba(255,255,255,0.08)" },
          ticks: { color: "#bbb", stepSize: 1 },
          suggestedMin: 0,
          suggestedMax: 1
        }
      }
    }
  });
}

export function initChartView() {
  const weeklyCanvas = document.getElementById("weeklyChart");
  const monthlyCanvas = document.getElementById("monthlyChart");

  if (!window.Chart || !weeklyCanvas || !monthlyCanvas) {
    return;
  }

  weeklyChart = buildChart(weeklyCanvas, "Weekly consistency", "#76d275", "rgba(118,210,117,0.25)");
  monthlyChart = buildChart(monthlyCanvas, "Monthly trend", "#5ab6ff", "rgba(90,182,255,0.18)");
}

function normalizeValues(values) {
  return values.map(value => value === null ? 0 : value);
}

export function updateCharts({ weekly, monthly, labels }) {
  if (weeklyChart) {
    weeklyChart.data.labels = labels.weekly;
    weeklyChart.data.datasets[0].data = normalizeValues(weekly);
    weeklyChart.update();
  }

  if (monthlyChart) {
    monthlyChart.data.labels = labels.monthly;
    monthlyChart.data.datasets[0].data = normalizeValues(monthly);
    monthlyChart.update();
  }
}
