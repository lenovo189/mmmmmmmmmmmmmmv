"use client";

import { useState } from "react";
import { transformDataForChart, ChartConfig } from "@/lib/chart-utils";
import { ChartRenderer } from "@/components/chart-renderer";

// Sample test data for demonstration
const sampleData = [
  ["Month", "Sales", "Expenses"],
  ["January", 1000, 800],
  ["February", 1200, 900],
  ["March", 1500, 1000],
  ["April", 1800, 1100],
  ["May", 2000, 1200],
];

// Convert raw rows into objects
function convertRowsToObjects(rows: any[][]) {
  const [headers, ...dataRows] = rows;
  return dataRows.map((row) =>
    headers.reduce((acc: any, header: string, idx: number) => {
      acc[header] = row[idx];
      return acc;
    }, {})
  );
}

const sampleChartConfigs: ChartConfig[] = [
  {
    type: "bar",
    title: "Monthly Sales Data",
    description: "Sales performance over the first quarter",
    xAxis: "Month",
    yAxis: "Sales",
    dataKey: "Sales",
    priority: 1,
  },
  {
    type: "line",
    title: "Expense Trends",
    description: "Monthly expense tracking",
    xAxis: "Month",
    yAxis: "Expenses",
    dataKey: "Expenses",
    priority: 2,
  },
  {
    type: "pie",
    title: "Sales Distribution",
    description: "Distribution of sales across months",
    xAxis: "Month",
    yAxis: "Sales",
    dataKey: "Sales",
    priority: 3,
  },
];

export default function ChartTestComponent() {
  const [selectedChart, setSelectedChart] = useState<number>(0);

  // Prepare data
  const normalizedData = convertRowsToObjects(sampleData);

  // Transform for chart rendering
  const processedChart = transformDataForChart(
    normalizedData,
    sampleChartConfigs[selectedChart],
    true
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Chart Integration Test</h1>

      {/* Chart Selector */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Chart Type Selection</h2>
        <div className="flex gap-2">
          {sampleChartConfigs.map((config, index) => (
            <button
              key={index}
              onClick={() => setSelectedChart(index)}
              className={`px-4 py-2 rounded-lg ${
                selectedChart === index
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {config.type.toUpperCase()} Chart
            </button>
          ))}
        </div>
      </div>

      {/* Chart Renderer */}
      {processedChart && (
        <div className="border rounded-lg p-4">
          <ChartRenderer chartData={processedChart} />

        </div>
      )}

      {/* Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">
          ✅ Implementation Status
        </h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• AI analysis with chart recommendations ✓</li>
          <li>• Chart data transformation utilities ✓</li>
          <li>• Interactive Recharts components ✓</li>
          <li>• Chart integration in Excel preview ✓</li>
          <li>• Chart-to-PDF conversion ✓</li>
          <li>• Enhanced PDF export with charts ✓</li>
        </ul>
      </div>

      {/* How It Works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 How It Works</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Upload Excel file through the main interface</li>
          <li>Click "AI Analysis & Charts" button</li>
          <li>AI analyzes data and recommends appropriate chart types</li>
          <li>Charts are automatically generated if recommended</li>
          <li>Export PDF includes both data analysis and charts</li>
        </ol>
      </div>
    </div>
  );
}
