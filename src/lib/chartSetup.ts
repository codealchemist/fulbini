import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export const CHART_TEXT_COLOR = '#8993a4'
export const CHART_GRID_COLOR = '#1a202b'
export const CHART_ACCENT = '#22c55e'
export const CHART_LIVE = '#ef4444'
export const CHART_INFO = '#38bdf8'
export const CHART_PALETTE = ['#22c55e', '#38bdf8', '#f59e0b', '#a78bfa', '#ef4444', '#ec4899']

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: CHART_TEXT_COLOR, boxWidth: 10, font: { size: 11 } },
    },
    tooltip: {
      backgroundColor: '#171c25',
      titleColor: '#e8ecf1',
      bodyColor: '#e8ecf1',
      borderColor: '#232a37',
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      ticks: { color: CHART_TEXT_COLOR, font: { size: 11 } },
      grid: { color: CHART_GRID_COLOR },
    },
    y: {
      ticks: { color: CHART_TEXT_COLOR, font: { size: 11 } },
      grid: { color: CHART_GRID_COLOR },
    },
  },
} as const
