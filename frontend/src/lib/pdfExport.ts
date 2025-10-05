/**
 * PDF Export utility for generating validation reports
 */

import { generateValidationBarChart, generateRadarChart } from './chartUtils';

interface ValidationData {
  score: any;
  improvedIdea: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  marketSize: string | { [key: string]: any };
  targetAudience: string | { [key: string]: any };
  competitorInsights: any[];
  originalIdea?: string;
  problem?: string;
}

/**
 * Helper function to format target audience for display
 */
function formatTargetAudience(targetAudience: string | { [key: string]: any }): string {
  if (typeof targetAudience === 'string') {
    return targetAudience;
  }
  if (typeof targetAudience === 'object' && targetAudience !== null) {
    return Object.entries(targetAudience)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join('<br>');
  }
  return 'Not specified';
}

/**
 * Helper function to format market size for display
 */
function formatMarketSize(marketSize: string | { [key: string]: any }): string {
  if (typeof marketSize === 'string') {
    return marketSize;
  }
  if (typeof marketSize === 'object' && marketSize !== null) {
    return Object.entries(marketSize)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          const subEntries = Object.entries(value)
            .map(([subKey, subValue]) => `${subKey}: ${subValue}`)
            .join(', ');
          return `<strong>${key}:</strong><br><span style="padding-left: 20px;">${subEntries}</span>`;
        }
        return `<strong>${key}:</strong> ${value}`;
      })
      .join('<br>');
  }
  return 'Not specified';
}

/**
 * Generate and download a PDF report for idea validation
 */
export async function exportValidationPDF(data: ValidationData, originalData: { idea: string; problem: string }) {
  try {
    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Generate chart URLs
    const barChartUrl = generateValidationBarChart(data.score);
    const radarChartUrl = generateRadarChart(data.score);

    // Build the HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NEXORA - Idea Validation Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #fbbf24;
          }
          
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          
          .report-title {
            font-size: 24px;
            color: #374151;
            margin-bottom: 10px;
          }
          
          .report-date {
            color: #6b7280;
            font-size: 14px;
          }
          
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .score-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .score-item {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #fbbf24;
          }
          
          .score-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          
          .score-value {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
          }
          
          .overall-score {
            text-align: center;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
          }
          
          .overall-score-value {
            font-size: 48px;
            font-weight: bold;
            color: #92400e;
          }
          
          .overall-score-label {
            font-size: 14px;
            color: #78350f;
            margin-top: 5px;
          }
          
          .content-box {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
          }
          
          .list-item {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
          }
          
          .list-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #fbbf24;
            font-weight: bold;
          }
          
          .competitor-box {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
          }
          
          .competitor-name {
            font-weight: 600;
            color: #111827;
            margin-bottom: 10px;
          }
          
          .competitor-detail {
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .label-strong {
            font-weight: 600;
            color: #059669;
          }
          
          .label-weak {
            font-weight: 600;
            color: #dc2626;
          }
          
          .label-opp {
            font-weight: 600;
            color: #2563eb;
          }
          
          .chart-container {
            text-align: center;
            margin: 20px 0;
            page-break-inside: avoid;
          }
          
          .chart-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">NEXORA</div>
          <div class="report-title">Idea Validation Report</div>
          <div class="report-date">Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Original Idea</div>
          <div class="content-box">
            <p>${originalData.idea}</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Problem Statement</div>
          <div class="content-box">
            <p>${originalData.problem}</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Validation Scores</div>
          <div class="overall-score">
            <div class="overall-score-value">${data.score.overall || 0}</div>
            <div class="overall-score-label">Overall Score</div>
          </div>
          <div class="score-grid">
            <div class="score-item">
              <div class="score-label">Feasibility</div>
              <div class="score-value">${data.score.feasibility || 0}%</div>
            </div>
            <div class="score-item">
              <div class="score-label">Scalability</div>
              <div class="score-value">${data.score.scalability || 0}%</div>
            </div>
            <div class="score-item">
              <div class="score-label">Market Demand</div>
              <div class="score-value">${data.score.marketDemand || data.score.marketPotential || 0}%</div>
            </div>
            <div class="score-item">
              <div class="score-label">Innovation</div>
              <div class="score-value">${data.score.innovation || 0}%</div>
            </div>
          </div>
        </div>
        
        <div class="chart-container">
          <img src="${barChartUrl}" alt="Score Analysis" class="chart-image" />
        </div>
        
        <div class="section">
          <div class="section-title">AI-Enhanced Idea</div>
          <div class="content-box">
            <p>${data.improvedIdea}</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Market Analysis</div>
          <div class="content-box">
            <p><strong>Market Size:</strong><br>${formatMarketSize(data.marketSize)}</p>
            <p style="margin-top: 10px;"><strong>Target Audience:</strong><br>${formatTargetAudience(data.targetAudience)}</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Strengths</div>
          <div class="content-box">
            ${data.strengths.map(s => `<div class="list-item">${s}</div>`).join('')}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Areas for Improvement</div>
          <div class="content-box">
            ${data.weaknesses.map(w => `<div class="list-item">${w}</div>`).join('')}
          </div>
        </div>
        
        ${data.competitorInsights && data.competitorInsights.length > 0 ? `
        <div class="section">
          <div class="section-title">Competitor Analysis</div>
          ${data.competitorInsights.map(insight => `
            <div class="competitor-box">
              <div class="competitor-name">${insight.competitor}</div>
              <div class="competitor-detail">
                <span class="label-strong">Strengths:</span> ${insight.strengths}
              </div>
              <div class="competitor-detail">
                <span class="label-weak">Weaknesses:</span> ${insight.weaknesses}
              </div>
              <div class="competitor-detail">
                <span class="label-opp">Opportunity:</span> ${insight.opportunity}
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">Recommendations</div>
          <div class="content-box">
            ${data.recommendations.map((r, i) => `
              <div style="margin-bottom: 12px;">
                <strong>${i + 1}.</strong> ${r}
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="chart-container">
          <img src="${radarChartUrl}" alt="Comprehensive Analysis" class="chart-image" />
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} NEXORA - AI-Powered Startup Assistant</p>
          <p>This report is confidential and proprietary</p>
        </div>
      </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for images to load then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 1500);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Generate a simple text report for quick export
 */
export function generateTextReport(data: ValidationData, originalData: { idea: string; problem: string }): string {
  const report = `
NEXORA - IDEA VALIDATION REPORT
================================
Generated: ${new Date().toLocaleDateString()}

ORIGINAL IDEA
-------------
${originalData.idea}

PROBLEM STATEMENT
-----------------
${originalData.problem}

VALIDATION SCORES
-----------------
Overall Score: ${data.score.overall}%
• Feasibility: ${data.score.feasibility}%
• Scalability: ${data.score.scalability}%
• Market Demand: ${data.score.marketDemand || data.score.marketPotential}%
• Innovation: ${data.score.innovation}%

AI-ENHANCED IDEA
----------------
${data.improvedIdea}

MARKET ANALYSIS
---------------
Market Size: ${typeof data.marketSize === 'string' 
  ? data.marketSize 
  : Object.entries(data.marketSize).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `\n  ${key}:\n${Object.entries(value).map(([k, v]) => `    ${k}: ${v}`).join('\n')}`;
      }
      return `\n  ${key}: ${value}`;
    }).join('')}
Target Audience: ${typeof data.targetAudience === 'string' 
  ? data.targetAudience 
  : Object.entries(data.targetAudience).map(([key, value]) => `\n  ${key}: ${value}`).join('')}

STRENGTHS
---------
${data.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

AREAS FOR IMPROVEMENT
---------------------
${data.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

${data.competitorInsights && data.competitorInsights.length > 0 ? `
COMPETITOR ANALYSIS
-------------------
${data.competitorInsights.map(insight => `
${insight.competitor}:
• Strengths: ${insight.strengths}
• Weaknesses: ${insight.weaknesses}
• Opportunity: ${insight.opportunity}
`).join('\n')}
` : ''}

RECOMMENDATIONS
---------------
${data.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

================================
© ${new Date().getFullYear()} NEXORA - AI-Powered Startup Assistant
`;

  return report;
}
