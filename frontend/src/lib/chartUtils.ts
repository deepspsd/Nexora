/**
 * Utility functions for generating charts using QuickChart API
 */

const QUICKCHART_API_URL = "https://quickchart.io/chart";

interface ChartConfig {
  type: string;
  data: any;
  options?: any;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

/**
 * Generate a chart URL using QuickChart API
 */
export function generateChartUrl(config: ChartConfig): string {
  const chartConfig = {
    chart: {
      type: config.type,
      data: config.data,
      options: config.options || {}
    },
    width: config.width || 500,
    height: config.height || 300,
    backgroundColor: config.backgroundColor || 'white'
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig.chart));
  return `${QUICKCHART_API_URL}?c=${encodedConfig}&width=${chartConfig.width}&height=${chartConfig.height}&backgroundColor=${chartConfig.backgroundColor}`;
}

/**
 * Generate a bar chart for validation scores
 */
export function generateValidationBarChart(scores: any): string {
  const chartData = {
    labels: ['Feasibility', 'Scalability', 'Market Demand', 'Innovation'],
    datasets: [{
      label: 'Score',
      data: [
        scores.feasibility || 0,
        scores.scalability || 0,
        scores.marketDemand || 0,
        scores.innovation || 0
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(34, 197, 94, 0.8)',   // Green
        'rgba(251, 191, 36, 0.8)',  // Yellow
        'rgba(168, 85, 247, 0.8)'   // Purple
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(251, 191, 36)',
        'rgb(168, 85, 247)'
      ],
      borderWidth: 2
    }]
  };

  return generateChartUrl({
    type: 'bar',
    data: chartData,
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Validation Scores by Category'
        }
      }
    },
    width: 600,
    height: 400
  });
}

/**
 * Generate a radar chart for comprehensive analysis
 */
export function generateRadarChart(scores: any): string {
  const chartData = {
    labels: [
      'Market Potential',
      'Feasibility',
      'Innovation',
      'Scalability',
      'Market Demand'
    ],
    datasets: [{
      label: 'Score',
      data: [
        scores.marketPotential || 0,
        scores.feasibility || 0,
        scores.innovation || 0,
        scores.scalability || 0,
        scores.marketDemand || scores.marketPotential || 0
      ],
      fill: true,
      backgroundColor: 'rgba(251, 191, 36, 0.2)',
      borderColor: 'rgb(251, 191, 36)',
      pointBackgroundColor: 'rgb(251, 191, 36)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(251, 191, 36)'
    }]
  };

  return generateChartUrl({
    type: 'radar',
    data: chartData,
    options: {
      elements: {
        line: {
          borderWidth: 3
        }
      },
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Comprehensive Score Analysis'
        }
      }
    },
    width: 500,
    height: 500
  });
}

/**
 * Generate a line chart for market growth
 */
export function generateMarketGrowthChart(data: any): string {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
  
  const chartData = {
    labels: years,
    datasets: [{
      label: 'TAM (Total Addressable Market)',
      data: years.map((_, i) => Math.round(100 * Math.pow(1.15, i))), // 15% growth
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }, {
      label: 'SAM (Serviceable Addressable Market)',
      data: years.map((_, i) => Math.round(30 * Math.pow(1.20, i))), // 20% growth
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4
    }, {
      label: 'SOM (Serviceable Obtainable Market)',
      data: years.map((_, i) => Math.round(5 * Math.pow(1.35, i))), // 35% growth
      borderColor: 'rgb(251, 191, 36)',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      tension: 0.4
    }]
  };

  return generateChartUrl({
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Market Size Projection (in Billions)'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Market Size ($B)'
          }
        }
      }
    },
    width: 700,
    height: 400
  });
}

/**
 * Generate a pie chart for competitor market share
 */
export function generateCompetitorChart(competitors: string[]): string {
  const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)'
  ];

  const chartData = {
    labels: [...competitors.slice(0, 4), 'Others'],
    datasets: [{
      data: [25, 20, 15, 10, 30], // Sample market share data
      backgroundColor: colors,
      borderColor: colors.map(c => c.replace('0.8', '1')),
      borderWidth: 2
    }]
  };

  return generateChartUrl({
    type: 'pie',
    data: chartData,
    options: {
      plugins: {
        legend: {
          position: 'right'
        },
        title: {
          display: true,
          text: 'Competitor Market Share Analysis'
        }
      }
    },
    width: 500,
    height: 400
  });
}
